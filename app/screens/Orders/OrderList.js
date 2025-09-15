import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from "react-native";
import TransactionItem from "app/components/TransactionItem";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import OrderItem from "app/screens/Orders/components/OrderItem";

function OrderList(props) {
	const [loading, setLoading] = useState(false)
	const [orders, setOrders] = useState({ list: [], count: 0 })
	const [notfound, setNotfound] = useState(false)
	const [refresh, setRefresh] = useState(false)

	useEffect(() => {
		setLoading(true);

		async function getData() {
			const token = await AsyncStorage.getItem('sme_user_token');
			axios({
				method: 'get',
				url: `${apiConfig.BASE_URL}/member/order`,
				params: {
					//limit: 10000000,
					//page: 1,
					status: props.status,
					process: props.process,
					rangeStart: '2022-01-01',
					rangeEnd: '2050-01-01',
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
	}, [props.status, refresh, props.isFocused, props.refresh])
	return (
		loading ? <ActivityIndicator /> :
		<View>
			<FlatList
				data={orders && orders.list}
				renderItem={({item}) => <OrderItem item={item} navigation={props.navigation}/>}
				refreshControl={
					<RefreshControl
						refreshing={refresh}
						onRefresh={() => setRefresh(true)}
						title="đang tải"
						titleColor="#a7a7a7"
					/>
				}
				keyExtractor={(item) => item.id}
				ListEmptyComponent={() => (
					<View style={tw`flex items-center my-5`}>
						<Icon name={"shopping-search"} size={50} style={tw`mb-3 text-gray-300`} />
						<Text  style={tw`text-gray-600`}>Không có đơn hàng</Text>
					</View>
				)}
				removeClippedSubviews={true} // Unmount components when outside of window
				initialNumToRender={4} // Reduce initial render amount
				maxToRenderPerBatch={1} // Reduce number in each render batch
				updateCellsBatchingPeriod={100} // Increase time between renders
				windowSize={7} // Reduce the window size
			/>
		</View>
	);
}

export default React.memo(OrderList);
