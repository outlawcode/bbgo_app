import * as React from "react";
import {HomeStackScreen} from "app/navigation/StackScreen/HomeStackScreen";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {AccountStackScreen} from "app/navigation/StackScreen/AccountStackScreen";
import {Platform, Text, View, Image} from "react-native";
import tw from "twrnc";
import {ProductStackScreen} from "app/navigation/StackScreen/ProductStackScreen";
import {CartStackScreen} from "app/navigation/StackScreen/CartStackScreen";
import NotificationScreen from "app/screens/Notification";
import { useSelector } from "react-redux";
import axios from "axios";
import AsyncStorage from "@react-native-community/async-storage";
import apiConfig from "app/config/api-config";

const AppTabs = createBottomTabNavigator()

// Custom tab bar icons with modern styling
const TabBarIcon = ({ focused, color, icon, image, label, showBadge = false, badgeCount = 0 }) => (
	<View style={tw`items-center justify-center`}>
		{/* Active badge behind icon */}
		<View style={tw`relative`}>
			<View style={[tw`items-center justify-center`, {
				width: 32,
				height: 32,
				borderRadius: 16,
				backgroundColor: focused ? '#E6F5F6' : 'transparent',
			}]}
			>
				{image ? (
					<Image
						source={image}
						style={{
							width: 20,
							height: 20,
						}}
						resizeMode="contain"
					/>
				) : (
					<Icon name={icon} size={20} color={focused ? '#008A97' : '#9ca3af'} />
				)}
			</View>
			{/* Notification badge */}
			{showBadge && badgeCount > 0 && (
				<View style={[tw`absolute -top-1 -right-1 bg-red-500 rounded-full min-w-4 h-4 items-center justify-center`, {
					paddingHorizontal: badgeCount > 9 ? 4 : 2,
				}]}>
					<Text style={tw`text-white text-xs font-bold`}>
						{badgeCount > 99 ? '99+' : badgeCount}
					</Text>
				</View>
			)}
		</View>
		<Text style={[{fontSize: 11}, tw`${focused ? 'text-cyan-700 font-medium' : 'text-gray-400'}`]}>
			{label}
		</Text>
	</View>
);

// Hook to manage unread notification count
const useUnreadCount = () => {
	const [unreadCount, setUnreadCount] = React.useState(0);

	React.useEffect(() => {
		// Fetch unread count when component mounts
		fetchUnreadCount();

		// Set up interval to refresh unread count every 30 seconds
		const interval = setInterval(fetchUnreadCount, 10000);

		return () => clearInterval(interval);
	}, []);

	const fetchUnreadCount = async () => {
		try {
			const token = await AsyncStorage.getItem('sme_user_token');
			if (!token) return;

			const response = await axios.get(`${apiConfig.BASE_URL}/notification/member/list`, {
				headers: { Authorization: `Bearer ${token}` }
			});

			if (response.data && response.data.list) {
				const unread = response.data.list.filter(item => Number(item.isRead) === 0).length;
				setUnreadCount(unread);
			}
		} catch (error) {
			console.log('Error fetching unread count:', error);
		}
	};

	return unreadCount;
};

// Hook to get cart quantity from Redux state
const useCartQuantity = () => {
	const cart = useSelector(state => state.CartReducer);
	
	let cartQuantity = 0;
	if (cart && cart.items) {
		cart.items.forEach((item) => {
			cartQuantity += item.quantity || 0;
		});
	}
	
	return cartQuantity;
};

export const AppTabsScreen = () => {
	const unreadCount = useUnreadCount();
	const cartQuantity = useCartQuantity();

	console.log('Unread notifications:', unreadCount);
	console.log('Cart quantity:', cartQuantity);

	return (
		<AppTabs.Navigator
			screenOptions={{
				tabBarActiveTintColor: '#008A97',
				tabBarInactiveTintColor: '#9ca3af',
				headerShown: false,
				tabBarStyle: {
					height: 64,
					paddingBottom: Platform.OS === 'ios' ? 22 : 12,
					paddingTop: 10,
					backgroundColor: 'white',
					borderTopWidth: 0,
					elevation: 12,
					shadowColor: '#000',
					shadowOffset: { width: 0, height: -2 },
					shadowOpacity: 0.06,
					shadowRadius: 6,
					paddingLeft: 12,
					paddingRight: 12,
				},
				tabBarShowLabel: false,
				tabBarHideOnKeyboard: true,
			}}
		>
			<AppTabs.Screen
				name="Trang chủ"
				component={HomeStackScreen}
				options={{
					unmountOnBlur: true,
					tabBarIcon: ({ focused, color }) => (
						<TabBarIcon
							focused={focused}
							color={color}
							image={require('../../assets/images/icon.png')}
							label="Trang chủ"
						/>
					)
				}}
			/>
			<AppTabs.Screen
				name="Giỏ hàng"
				component={CartStackScreen}
				options={{
					unmountOnBlur: true,
					tabBarIcon: ({ focused, color }) => (
						<TabBarIcon 
							focused={focused} 
							color={color} 
							icon="cart" 
							label="Giỏ hàng"
							showBadge={cartQuantity > 0}
							badgeCount={cartQuantity}
						/>
					)
				}}
			/>
			<AppTabs.Screen
				name="Cửa hàng"
				component={ProductStackScreen}
				options={{
					unmountOnBlur: true,
					tabBarIcon: ({ focused, color }) => (
						<TabBarIcon focused={focused} color={color} icon="shopping" label="Sản phẩm" />
					)
				}}
			/>
			<AppTabs.Screen
				name="Thông báo"
				component={NotificationScreen}
				options={{
					headerShown: true,
					unmountOnBlur: true,
					tabBarIcon: ({ focused, color }) => (
						<TabBarIcon
							focused={focused}
							color={color}
							icon="bell"
							label="Thông báo"
							showBadge={true}
							badgeCount={unreadCount}
						/>
					)
				}}
			/>
			<AppTabs.Screen
				name="Tài khoản"
				component={AccountStackScreen}
				options={{
					unmountOnBlur: true,
					tabBarIcon: ({ focused, color }) => (
						<TabBarIcon focused={focused} color={color} icon="account" label="Tài khoản" />
					)
				}}
			/>
		</AppTabs.Navigator>
	);
};
