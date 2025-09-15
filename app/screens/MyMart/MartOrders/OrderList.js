import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import TransactionItem from "app/components/TransactionItem";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import OrderItem from "app/screens/MyMart/MartOrders/components/OrderItem";
import moment from "moment";
import DatePicker from "react-native-neat-date-picker";
import { formatDate, formatDateUS, formatNumber } from "app/utils/helper.js";

function OrderList(props) {
	const [loading, setLoading] = useState(false)
	const [orders, setOrders] = useState({ list: [], count: 0 })
	const [notfound, setNotfound] = useState(false)
	const [refresh, setRefresh] = useState(false)

	const [showDatePicker, setShowDatePicker] = useState(false);

	const [dateRange, setDateRange] = useState(
		[
			moment.utc(moment().clone().startOf('month').format('YYYY-MM-DD')),
			moment.utc(moment().clone().endOf('month').format("YYYY-MM-DD"))
		]
	)

	useEffect(() => {
		setLoading(true);
		async function getData() {
			const token = await AsyncStorage.getItem('sme_user_token');
			axios({
				method: 'get',
				url: `${apiConfig.BASE_URL}/member/order/shop`,
				params: {
					limit: 10000000,
					page: 1,
					status: props.status,
					process: props.process,
					rangeStart: formatDateUS(dateRange[0]),
					rangeEnd: formatDateUS(dateRange[1]),
					orderSource: 'Offline'
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
	}, [props.status, refresh, props.isFocused, props.refresh, dateRange])
	return (
		loading ? <ActivityIndicator /> :
		<View>
			<View style={tw`bg-white p-3 flex items-center flex-row justify-between`}>
				<View>
					<Text>Có {formatNumber(orders && orders.count)} đơn hàng</Text>
				</View>
				<TouchableOpacity
					style={tw`border border-gray-200 rounded px-3 py-2 flex items-center flex-row`}
					onPress={() => setShowDatePicker(true)}
				>
					<Icon name={"calendar-range-outline"} size={18} style={tw`mr-1`}/>
					<Text>{formatDate(dateRange[0])} - {formatDate(dateRange[1])}</Text>
				</TouchableOpacity>
			</View>
			<View style={tw`pb-30`}>
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
			<DatePicker
				isVisible={showDatePicker}
				mode={'range'}
				onCancel={() => setShowDatePicker(false)}
				onConfirm={(output) => {
					setShowDatePicker(false)
					setDateRange([output.startDateString, output.endDateString])
				}}
			/>
		</View>
	);
}

export default React.memo(OrderList);
