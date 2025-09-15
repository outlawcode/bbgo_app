import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import { useDispatch } from "react-redux";
import OrderList from "app/screens/Orders/OrderList";
import { useIsFocused } from "@react-navigation/native";

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

	useEffect(() => {
		props.navigation.setOptions({
			title: 'Đơn hàng',
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

	const renderLabel = ({ route, focused, color }) => {
		return (
			<View style={tw`w-full`}>
				<Text
					style={focused ? styles.activeTabTextColor : styles.tabTextColor}
				>
					{route.title}
				</Text>
			</View>
		)
	}

	const renderTabBar = props => (
		<TabBar
			{...props}
			indicatorStyle={{ backgroundColor: 'black'}}
			style={{ backgroundColor: 'white' }} tabStyle={{width: 120}}
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
