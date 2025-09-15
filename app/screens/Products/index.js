import React, {useEffect, useState} from "react";
import {ActivityIndicator, RefreshControl, ScrollView, StatusBar, Text, TouchableOpacity, View} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import CartIcon from "app/screens/Cart/components/cartIcon";
import {useDispatch, useSelector} from "react-redux";
import {apiClient} from "app/services/client";
import ProductItem from "app/components/ProductItem";
import {FlatGrid} from "react-native-super-grid";
import ProductPageLoading from "app/screens/Products/components/ProductPageLoading";

function ProductsScreen(props) {
	const dispatch = useDispatch();
	const settings = useSelector(state => state.SettingsReducer.options)
	const categories = useSelector(state => state.SettingsReducer.productCategories)
	//const [categories, setCategories] = useState([]);
	const [category, setCategory] = useState();
	const [catId, setCatId] = useState('ALL');
	const [featureProducts, setFeatureProducts] = useState([]);
	const [products, setProducts] = useState([]);
	const [refresh, setRefresh] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		props.navigation.setOptions({
			title: 'Sản phẩm',
			headerStyle: {
				backgroundColor: '#008A97',
			},
			headerTintColor: '#fff',
			headerLeft: () => (
				<TouchableOpacity
					activeOpacity={1}
					onPress={() => props.navigation.goBack()}>
					<Icon name="chevron-left"
					         size={26}
					         style={tw`text-white ml-3`}
					/>
				</TouchableOpacity>
			),
			headerRight: () => (
				<View style={tw`mr-3 flex flex-row items-center`}>
					<CartIcon
						navigation={props.navigation}
					/>
					<TouchableOpacity
						activeOpacity={1}
						onPress={() => props.navigation.openDrawer()}
					>
						<Icon name={"menu"} size={30} style={tw`text-white ml-5`} />
					</TouchableOpacity>
				</View>
			)
		})
	}, [])

	async function getProducts(catid) {
		await apiClient.get('/product',
			{
				params: {
					limit: 1000000,
					category: catId === 'ALL' ? 'ALL' : [catid],
				}
			}
		).then((result) => {
			setRefresh(false);
			setLoading(false);
			setProducts(result.data);
		}).catch(function(error){
			console.log(error);
			setLoading(false)
		})
	}

	useEffect(() => {
		if (settings) {
			setLoading(true)
			if (catId !== 'ALL') {
				async function getCategory() {
					await apiClient.get(`/product-category/${catId}`,
					).then(function (response) {
						console.log(response);
						if (response.status === 200) {
							setCategory(response.data)
							setLoading(false)
						}
					}).catch(function(error){
						console.log(error);
						setLoading(false)
					})
				}
				getCategory();
			}
			getProducts(catId)
		}
	},[catId, refresh, settings])

	return (
		<View style={tw`flex bg-gray-100 min-h-full`}>
			<StatusBar barStyle={"light-content"} backgroundColor={'#008A97'} />
			<View style={tw`bg-white py-3 px-3`}>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
				>
					<TouchableOpacity
						activeOpacity={1}
						onPress={() => setCatId('ALL')}
						style={tw`mr-2 rounded border border-gray-200 px-3 py-2 ${catId === 'ALL' && 'bg-cyan-600'}`}
					>
						<Text style={tw`font-medium text-cyan-600 ${catId === 'ALL' && 'text-white'}`}>Tất cả</Text>
					</TouchableOpacity>
					{categories && categories.length > 0 && categories.map((item, index) => (
						<TouchableOpacity
							activeOpacity={1}
							style={tw`mr-2 rounded border border-gray-100 px-3 py-2 ${catId === item.id && 'bg-cyan-600'}`}
							onPress={() => setCatId(item.id)}
						>
							<View>
								<Text  style={tw`font-medium text-cyan-600 ${catId === item.id && 'text-white'}`}>{item.name}</Text>
							</View>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>
			{loading ? <ActivityIndicator size="large" /> :
				<ScrollView
					showsVerticalScrollIndicator={false}
					overScrollMode={'never'}
					scrollEventThrottle={16}
					refreshControl={
						<RefreshControl
							refreshing={refresh}
							onRefresh={() => setRefresh(true)}
							title="đang tải"
							titleColor="#000"
							tintColor="#000"
						/>
					}
				>
					<View style={tw`pb-10`}>
						<View style={tw`bg-white py-3`}>
							<View style={tw`flex flex-row ml-3`}>
								<Icon name={"check-decagram"} size={16} style={tw`text-cyan-600`} />
								{catId === 'ALL' ?
									<Text style={tw`font-medium text-gray-700 ml-2`}>Tất cả sản phẩm</Text>
									:
									<Text style={tw`font-medium text-gray-700 ml-2`}>{category && category.detail && category.detail.name}</Text>
								}
							</View>
							<FlatGrid
								itemDimension={150}
								data={products && products.list}
								additionalRowStyle={tw`flex items-start`}
								spacing={10}
								renderItem={({ item, index }) => (<ProductItem item={item} navigation={props.navigation} key={index} />)} />
						</View>
					</View>
				</ScrollView>
			}
		</View>
	);
}

export default ProductsScreen;
