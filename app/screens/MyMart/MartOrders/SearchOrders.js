import React, { useEffect, useState } from "react";
import { FlatList, RefreshControl, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import { apiClient } from "app/services/client";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import OrderItem from "app/screens/Orders/components/OrderItem";

function MartSearchOrdersScreen(props) {
	const [loading, setLoading] = useState(true);
	const [query, setQuery] = useState('');
	const [notfound, setNotfound] = useState(false);
	const [orders, setOrders] = useState([]);

	useEffect(() => {
		props.navigation.setOptions({
			title: 'Tìm kiếm đơn hàng',
			headerStyle: {
				backgroundColor: '#fff',
			},
			headerTintColor: '#000',
			headerLeft: () => (
				<TouchableOpacity
					activeOpacity={1}
					onPress={() => props.navigation.goBack()}>
					<Icon name="chevron-left"
					      size={26}
					      style={tw`ml-3`}
					/>
				</TouchableOpacity>
			),
		})
	}, [])

	useEffect(() => {
		setLoading(true);

		if (query !== '') {
			const timer = setTimeout(async () => {
				const token = await AsyncStorage.getItem('sme_user_token');
				axios({
					method: 'get',
					url: `${apiConfig.BASE_URL}/member/order/shop/search`,
					params: {query, orderSource: 'Offline'},
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
					}
				}).catch((function(error) {
					console.log(error);
				}))
			}, 300)
			return () => clearTimeout(timer)
		}
		if (query === '' || typeof query === 'undefined') {
			setOrders([])
			setNotfound(false)
		}
	}, [query])

	return (
		<View>
			<StatusBar barStyle={"dark-content"}/>
			<View style={tw`flex-row justify-between items-center bg-gray-200 rounded bg-white p-3 border-b border-gray-200`}>
				<View style={tw`flex-row items-center`}>
					<Icon name="magnify" size={18} style={tw`text-gray-500 mr-2`} />
					<TextInput
						autoFocus
						style={tw`android:h-20`}
						value={query}
						onChangeText={event => setQuery(event)}
						placeholder="Nhập vào mã đơn hàng..."
						returnKeyType={"done"}
						keyboardType={"numeric"}
					/>
				</View>

				<TouchableOpacity onPress={() => setQuery("")}>
					<Icon name="close-circle" size={18} style={tw`text-gray-500`}/>
				</TouchableOpacity>
			</View>

			<ScrollView
				showsVerticalScrollIndicator={false}
				overScrollMode={'never'}
				scrollEventThrottle={16}
				keyboardShouldPersistTaps={"always"}
			>
				{notfound ?
					<View style={tw`flex items-center my-10`}>
						<Icon name={"note-search-outline"} size={50} style={tw`text-blue-300 mb-5`} />
						<Text>Không tìm thấy đơn hàng với mã "{query}"</Text>
					</View>
					:
					orders && orders.length > 0 ?
					<View style={`pb-40`}>
						<View style={tw`p-3`}>
							<Text>Tìm thấy <Text style={tw`font-bold text-red-500`}>{orders.length}</Text> đơn hàng</Text>
						</View>

						<FlatList
							data={orders && orders}
							renderItem={({item}) => <OrderItem item={item} navigation={props.navigation}/>}
							/*refreshControl={
								<RefreshControl
									refreshing={refresh}
									onRefresh={() => setRefresh(true)}
									title="đang tải"
									titleColor="#a7a7a7"
								/>
							}*/
							keyExtractor={(item) => item.id}
							//ListEmptyComponent={() => (<NotFoundOrder />)}
							removeClippedSubviews={true} // Unmount components when outside of window
							initialNumToRender={4} // Reduce initial render amount
							maxToRenderPerBatch={1} // Reduce number in each render batch
							updateCellsBatchingPeriod={100} // Increase time between renders
							windowSize={7} // Reduce the window size
						/>
					</View>
						:
						<View style={tw`flex items-center my-10`}>
							<Icon name={"shopping-search"} size={50} style={tw`text-blue-300 mb-5`} />
							<Text>Bạn có thể tìm kiếm theo Mã đơn hàng</Text>
						</View>
				}
			</ScrollView>
		</View>
	);
}

export default MartSearchOrdersScreen;
