import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Image,
	Linking,
	RefreshControl,
	ScrollView,
	StatusBar,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import tw from "twrnc";
import CartIcon from "app/screens/Cart/components/cartIcon";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import supportImg from '../../assets/images/support.jpg'
import CustomerSupport from "app/screens/Home/components/CustomerSupport";
import { apiClient } from "app/services/client";
import { FlatGrid } from "react-native-super-grid";
import ProductItem from "app/components/ProductItem";

function SupportScreen(props) {
	const currentUser = useSelector(state => state.memberAuth.user);
	const settings = useSelector(state => state.SettingsReducer.options);
	const [products, setProducts] = useState();
	const [refresh, setRefresh] = useState();
	const [loading, setLoading] = useState(false);

	function getFeaturedProducts() {
		apiClient.get('/product', {
			params: {
				limit: 10000,
				page: 1,
				tag: 'Khách sạn'
			}
		}).then(function (response) {
			setProducts(response.data)
			setRefresh(false)
		}).catch(function (error) {
			console.log(error);
		})
	}

	useEffect(() => {
		getFeaturedProducts()
		props.navigation.setOptions({
			title: 'Khách sạn',
			headerStyle: {
				backgroundColor: '#2ea65d',
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
				<View style={tw`flex flex-row items-center mr-3`}>
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
	}, [refresh])

	console.log(products);

	return (
		<View>
			<StatusBar barStyle={"light-content"} backgroundColor={'#2ea65d'} />
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
				<View style={tw`bg-white py-3`}>

					{products && products.list && products.list.length > 0 ?
						<FlatGrid
							itemDimension={150}
							data={products && products.list}
							additionalRowStyle={tw`flex items-start`}
							spacing={10}
							renderItem={({ item, index }) => (
								<ProductItem item={item} navigation={props.navigation} key={index} />
							)} />
						:
						<View>
							<View style={tw`my-5 flex items-center`}>
								<Icon name={"store-search-outline"} size={50} style={tw`text-gray-300 mb-2`}/>
								<Text  style={tw`text-gray-600`}>Không có sản phẩm trong danh mục</Text>
							</View>
						</View>
					}
				</View>
			</ScrollView>
		</View>
	);
}

export default SupportScreen;
