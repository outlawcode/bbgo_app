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
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiConfig from "app/config/api-config";
import {useSafeAreaInsets} from 'react-native-safe-area-context';

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
	const insets = useSafeAreaInsets();

	console.log('Unread notifications:', unreadCount);
	console.log('Cart quantity:', cartQuantity);

	return (
		<AppTabs.Navigator
			screenOptions={{
				tabBarActiveTintColor: '#008A97',
				tabBarInactiveTintColor: '#9ca3af',
				headerShown: false,
				tabBarStyle: {
					height: (Platform.OS === 'ios' ? 64 : 60) + (insets.bottom ? 4 : 0),
					paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 10) : 12,
					paddingTop: 8,
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
				tabBarShowLabel: true,
				tabBarLabelStyle: {
					fontSize: 11,
					marginTop: 2,
					marginBottom: 0,
				},
				tabBarHideOnKeyboard: true,
				tabBarSafeAreaInsets: { bottom: 0 },
			}}
		>
			<AppTabs.Screen
				name="Trang chủ"
				component={HomeStackScreen}
				options={{
					unmountOnBlur: true,
					tabBarLabel: "Trang chủ",
					tabBarIcon: ({ focused, color }) => (
						<TabBarIcon
							focused={focused}
							color={color}
							image={require('../../assets/images/icon.png')}
						/>
					)
				}}
				listeners={({ navigation }) => ({
					tabPress: e => {
						// force refresh Home by pushing a param that changes
						navigation.navigate('Trang chủ', {
							screen: 'Home',
							params: { forceRefresh: Date.now() }
						});
					}
				})}
			/>
			<AppTabs.Screen
				name="Giỏ hàng"
				component={CartStackScreen}
				options={{
					unmountOnBlur: true,
					tabBarLabel: "Giỏ hàng",
					tabBarIcon: ({ focused, color }) => (
						<TabBarIcon 
							focused={focused} 
							color={color} 
							icon="cart" 
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
					tabBarLabel: "Sản phẩm",
					tabBarIcon: ({ focused, color }) => (
						<TabBarIcon focused={focused} color={color} icon="shopping" />
					)
				}}
			/>
			<AppTabs.Screen
				name="Thông báo"
				component={NotificationScreen}
				options={{
					headerShown: true,
					unmountOnBlur: true,
					tabBarLabel: "Thông báo",
					tabBarIcon: ({ focused, color }) => (
						<TabBarIcon
							focused={focused}
							color={color}
							icon="bell"
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
					tabBarLabel: "Tài khoản",
					tabBarIcon: ({ focused, color }) => (
						<TabBarIcon focused={focused} color={color} icon="account" />
					)
				}}
			/>
		</AppTabs.Navigator>
	);
};
