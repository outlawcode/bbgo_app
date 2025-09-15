import * as React from "react";
import {HomeStackScreen} from "app/navigation/StackScreen/HomeStackScreen";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {AccountStackScreen} from "app/navigation/StackScreen/AccountStackScreen";
import {ProductStackScreen} from "app/navigation/StackScreen/ProductStackScreen";
import {CartStackScreen} from "app/navigation/StackScreen/CartStackScreen";
import CartBottomIcon from "app/screens/Cart/components/cartBottomIcon";
import {View, Text, Platform} from "react-native";
import tw from "twrnc";
import {SupportStackScreen} from "app/navigation/StackScreen/SupportStackScreen";
import {FoodStackScreen} from "app/navigation/StackScreen/FoodStackScreen";
import FoodScreen from "app/screens/Food/FoodScreen";
import {QRScannerStackScreen} from "app/navigation/StackScreen/QRScannerStackScreen.js";
import { StoreStackScreen } from "app/navigation/StackScreen/StoreStackScreen.js";
import HTMMartScreen from "app/screens/HTM-Mart/index.js";
import { MartStackScreen } from "app/navigation/StackScreen/MartStackScreen.js";
import Stores from "app/screens/Stores";

const AppTabs = createBottomTabNavigator()

// Custom tab bar icons with simpler styling
const TabBarIcon = ({ focused, color, icon, label }) => (
	<View style={tw`items-center justify-center`}>
		<Icon name={icon} size={24} color={focused ? '#16a34a' : '#64748b'} />
		<Text style={tw`text-xs mt-1 ${focused ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
			{label}
		</Text>
	</View>
);

export const AppTabsScreen = () => (
	<AppTabs.Navigator
		screenOptions={{
			tabBarActiveTintColor: '#16a34a',
			tabBarInactiveTintColor: '#64748b',
			headerShown: false,
			tabBarStyle: {
				height: 65,
				paddingBottom: Platform.OS === 'ios' ? 20 : 10,
				paddingTop: 10,
				paddingRight: 10,
				paddingLeft: 10,
				backgroundColor: 'white',
				borderTopWidth: 0,
				elevation: 8,
				shadowColor: '#000',
				shadowOffset: { width: 0, height: -2 },
				shadowOpacity: 0.05,
				shadowRadius: 3,
			},
			tabBarShowLabel: false,
			tabBarHideOnKeyboard: true,
		}}
	>
		<AppTabs.Screen
			name="Mới nhất"
			component={HomeStackScreen}
			options={{
				unmountOnBlur: true,
				tabBarIcon: ({ focused, color }) => (
					<TabBarIcon focused={focused} color={color} icon="compass" label="Mới nhất" />
				)
			}}
		/>
		<AppTabs.Screen
			name="Siêu thị"
			component={MartStackScreen}
			options={{
				unmountOnBlur: true,
				tabBarIcon: ({ focused, color }) => (
					<TabBarIcon focused={focused} color={color} icon="store" label="Siêu thị" />
				)
			}}
		/>
		<AppTabs.Screen
			name="QR Scan"
			component={QRScannerStackScreen}
			options={{
				unmountOnBlur: true,
				tabBarIcon: ({ focused, color }) => (
					<View style={tw`items-center justify-center`}>
						<View style={tw`bg-green-600 rounded-full h-12 w-12 items-center justify-center -mt-5 shadow-md`}>
							<Icon name="qrcode-scan" size={24} color="#ffffff" />
						</View>
						<Text style={tw`text-xs mt-1 text-green-600`}>Scan</Text>
					</View>
				)
			}}
		/>
		<AppTabs.Screen
			name="Dịch vụ"
			options={{
				unmountOnBlur: true,
				tabBarIcon: ({ focused, color }) => (
					<TabBarIcon focused={focused} color={color} icon="spa" label="Dịch vụ" />
				)
			}}
			initialParams={{ slug: "service" }}
		>
			{props => <FoodStackScreen {...props} props={{slug: 'service'}} />}
		</AppTabs.Screen>
		<AppTabs.Screen
			name="Tài khoản"
			component={AccountStackScreen}
			options={{
				unmountOnBlur: true,
				tabBarIcon: ({ focused, color }) => (
					<TabBarIcon focused={focused} color={color} icon="account-circle" label="Tài khoản" />
				)
			}}
		/>
	</AppTabs.Navigator>
)
