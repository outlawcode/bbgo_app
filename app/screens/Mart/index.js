import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import CartIcon from "app/screens/Cart/components/cartIcon";
import { useDispatch, useSelector } from "react-redux";
import { apiClient } from "app/services/client";
import CategoryHorizontalList from "app/screens/Home/components/CategoryHorizontalList";
import ProductItem from "app/components/ProductItem";
import { FlatGrid } from "react-native-super-grid";
import ProductPageLoading from "app/screens/Products/components/ProductPageLoading";
import ProjectItem from "app/components/ProjectItem";
import ShopItem from "app/components/ShopItem";
import ServiceShopItem from "app/components/ServiceShopItem";

function SieuthiScreen(props) {
	const dispatch = useDispatch();
	const settings = useSelector(state => state.SettingsReducer.options)
	const [result, setResult] = useState([]);
	const [refresh, setRefresh] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		props.navigation.setOptions({
			title: 'Siêu thị',
			headerStyle: {
				backgroundColor: '#2b8f00',
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

	async function getShops() {
		await apiClient.get(`/user-shop`,
			{
				params: {
					limit: 10000,
					page: 1,
					isPersonal: true,
					isMart: 0,
				}
			}
		).then((result) => {
			setRefresh(false);
			setLoading(false);
			setResult(result.data);
		}).catch(function(error){
			console.log(error);
			setLoading(false)
		})
	}

	useEffect(() => {
		getShops()
	},[refresh])

	return (
		<View style={tw`flex bg-gray-100 min-h-full`}>
			<StatusBar barStyle={"light-content"} backgroundColor={'#ff0021'} />
			{loading ? <ProductPageLoading /> :
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
							<FlatGrid
								itemDimension={150}
								data={result && result.list}
								additionalRowStyle={tw`flex items-start`}
								spacing={10}
								renderItem={({ item, index }) => (
									item.type === 'Product' ?
									<ShopItem
										grid
										item={item}
										navigation={props.navigation}
										key={index}
									/>
										:
										<ServiceShopItem
											grid
											item={item}
											navigation={props.navigation}
											key={index}
										/>
								)} />
						</View>
					</View>
				</ScrollView>
			}
		</View>
	);
}

export default SieuthiScreen;
