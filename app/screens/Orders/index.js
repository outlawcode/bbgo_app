import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import { useDispatch } from "react-redux";
import OrderList from "app/screens/Orders/OrderList";
import { useIsFocused } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-community/async-storage";
import apiConfig from "app/config/api-config";

const styles = StyleSheet.create({
	activeTabTextColor: {
		color: '#262626',
	},
	tabTextColor: {
		color: '#777777'
	}
});

function OrdersScreen(props) {
	const dispatch = useDispatch()
	const isFocused = useIsFocused();
	const [refresh, setRefresh] = useState(false)
	const [orderCounts, setOrderCounts] = useState({
		all: 0,
		pending: 0,
		approved: 0,
		delivering: 0,
		completed: 0,
		cancelled: 0
	});

	useEffect(() => {
		props.navigation.setOptions({
			title: 'Đơn hàng',
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
				<TouchableOpacity
					onPress={() => props.navigation.navigate('SearchOrders')}
				>
					<Icon name={"magnify"}
						size={26} style={tw`text-white mr-3`}
					/>
				</TouchableOpacity>
			)
		})
	}, [dispatch])

	// Fetch order counts for each tab
	const fetchOrderCounts = async () => {
		try {
			const token = await AsyncStorage.getItem('sme_user_token');
			if (!token) return;

			const headers = { Authorization: `Bearer ${token}` };
			
			// Fetch all orders to get counts
			const response = await axios.get(`${apiConfig.BASE_URL}/member/orders?page=1&limit=1000`, { headers });
			
			if (response.data && response.data.list) {
				const orders = response.data.list;
				
				const counts = {
					all: orders.length,
					pending: orders.filter(order => order.status === 'Chờ thanh toán').length,
					approved: orders.filter(order => order.status === 'Đã duyệt' && order.process === 'Chờ lấy hàng').length,
					delivering: orders.filter(order => order.status === 'Đã duyệt' && order.process === 'Đang giao').length,
					completed: orders.filter(order => order.status === 'Hoàn thành' && order.process === 'Đã nhận').length,
					cancelled: orders.filter(order => order.status === 'Huỷ').length
				};
				
				setOrderCounts(counts);
			}
		} catch (error) {
			console.log('Error fetching order counts:', error);
		}
	};

	useEffect(() => {
		if (isFocused) {
			fetchOrderCounts();
		}
	}, [isFocused, refresh]);

	const [index, setIndex] = React.useState(props.route.params && props.route.params.position ? props.route.params.position : 0);
	const [routes] = React.useState([
		{ key: '1', title: 'Tất cả' },
		{ key: '2', title: 'Chờ thanh toán' },
		{ key: '3', title: 'Chờ lấy hàng' },
		{ key: '4', title: 'Đang giao' },
		{ key: '5', title: 'Đã nhận hàng' },
		{ key: '6', title: 'Đã huỷ' },
	]);

	const renderScene = ({ route }) => {
		switch (route.key) {
			case '1':
				return isFocused && <OrderList status={'ALL'} process={'ALL'} navigation={props.navigation} isFocused={isFocused} refresh={refresh}/>;
			case '2':
				return isFocused && <OrderList status={'Chờ thanh toán'} navigation={props.navigation} isFocused={isFocused} refresh={refresh}/>;
			case '3':
				return isFocused && <OrderList status={'Đã duyệt'} process={'Chờ lấy hàng'} navigation={props.navigation} isFocused={isFocused}  refresh={refresh}/>;
			case '4':
				return isFocused && <OrderList status={'Đã duyệt'} process={'Đang giao'} navigation={props.navigation} isFocused={isFocused} refresh={refresh}/>;
			case '5':
				return isFocused && <OrderList status={'Hoàn thành'} process={'Đã nhận'} navigation={props.navigation} isFocused={isFocused} refresh={refresh}/>;
			case '6':
				return isFocused && <OrderList status={'Huỷ'} navigation={props.navigation} isFocused={isFocused} refresh={refresh}/>;
			default:
				return null;
		}
	};

	const initialLayout = { width: Dimensions.get('window').width };

	const getCountForTab = (key) => {
		switch (key) {
			case '1': return orderCounts.all;
			case '2': return orderCounts.pending;
			case '3': return orderCounts.approved;
			case '4': return orderCounts.delivering;
			case '5': return orderCounts.completed;
			case '6': return orderCounts.cancelled;
			default: return 0;
		}
	};

	const renderLabel = ({ route, focused, color }) => {
		const count = getCountForTab(route.key);
		
		return (
			<View style={tw`w-full items-center`}>
				<Text
					style={focused ? styles.activeTabTextColor : styles.tabTextColor}
				>
					{route.title}
				</Text>
				{count > 0 && (
					<View style={tw`mt-1 bg-cyan-600 rounded-full px-2 py-0.5 min-w-5`}>
						<Text style={tw`text-white text-xs font-bold text-center`}>
							{count > 99 ? '99+' : count}
						</Text>
					</View>
				)}
			</View>
		)
	}

	const renderTabBar = props => (
		<TabBar
			{...props}
			indicatorStyle={{ backgroundColor: '#008A97'}}
			style={{ backgroundColor: 'white' }} 
			tabStyle={{width: 120, paddingVertical: 8}}
			renderLabel={renderLabel}
			scrollEnabled
		/>
	);

	return (
		<TabView
			lazy
			scrollEnabled
			navigationState={{ index, routes }}
			renderScene={renderScene}
			onIndexChange={(e) => {
				setIndex(e);
				setRefresh(!refresh)
			}}
			renderTabBar={renderTabBar}
			initialLayout={initialLayout}
		/>
	);
}

export default OrdersScreen;
