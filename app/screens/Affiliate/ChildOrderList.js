import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import TransactionItem from "app/components/TransactionItem";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import OrderItem from "app/screens/Orders/components/OrderItem";
import CartIcon from "app/screens/Cart/components/cartIcon";

function ChildOrderListScreen(props) {
	const [loading, setLoading] = useState(false)
	const [orders, setOrders] = useState({ list: [], count: 0 })
	const [notfound, setNotfound] = useState(false)
	const [refresh, setRefresh] = useState(false)

	useEffect(() => {
		props.navigation.setOptions({
			title: 'Đơn hàng Cộng tác viên',
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
		})
	}, [])

	useEffect(() => {
		setLoading(true);

		async function getData() {
			const token = await AsyncStorage.getItem('sme_user_token');
			axios({
				method: 'get',
				url: `${apiConfig.BASE_URL}/customer/order/child`,
				params: {
					limit: 10000000,
					page: 1,
					rangeStart: '2022-01-01',
					rangeEnd: '2050-01-01',
					guest: 'FALSE'
				},
				headers: {Authorization: `Bearer ${token}`}
			}).then(function(response) {
				if(response.status === 200) {
					if (response.data.length === 0) {
						setNotfound(true)
					} else {
						setNotfound(false)
						setOrders(response.data)
					}
					setLoading(false);
					setRefresh(false);
				}
			}).catch((function(error) {
				console.log(error);
			}))
		}
		getData()
	}, [refresh])

	return (
		loading ? <ActivityIndicator /> :
		<View>
			{orders && orders.list && orders.list.length > 0 ?
				/*<FlatList
					data={orders.list}
					renderItem={({item}) => <TransactionItem item={item} navigation={props.navigation}/>}
				/>*/
				<FlatList
					data={orders && orders.list}
					renderItem={({item}) => <OrderItem item={item} navigation={props.navigation} childOrder={true}/>}
					refreshControl={
						<RefreshControl
							refreshing={refresh}
							onRefresh={() => setRefresh(true)}
							title="đang tải"
							titleColor="#a7a7a7"
						/>
					}
					keyExtractor={(item) => item.id}
					//ListEmptyComponent={() => (<NotFoundOrder />)}
					removeClippedSubviews={true} // Unmount components when outside of window
					initialNumToRender={4} // Reduce initial render amount
					maxToRenderPerBatch={1} // Reduce number in each render batch
					updateCellsBatchingPeriod={100} // Increase time between renders
					windowSize={7} // Reduce the window size
				/>
				:
				<View style={tw`flex items-center my-5`}>
					<Icon name={"shopping-search"} size={50} style={tw`mb-3 text-gray-300`} />
					<Text  style={tw`text-gray-600`}>Không có đơn hàng</Text>
				</View>
			}
		</View>
	);
}

export default ChildOrderListScreen;
