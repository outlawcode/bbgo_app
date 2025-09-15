import * as React from 'react';
import { Button, View } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from "app/screens/Home";
import { RootStackScreen } from "app/navigation/StackScreen/RootStackScreen";
import CustomDrawer from "app/components/CustomDrawer";
import { useEffect, useState } from "react";
import { apiClient } from "app/services/client";
import ProductCategoryScreen from "app/screens/Products/ProductCategory";
import ProductDetailScreen from "app/screens/ProductDetail";
import PostDetailScreen from "app/screens/Posts/PostDetail";
import OrderDetailScreen from "app/screens/Orders/OrderDetail";
import SieuthiScreen from "app/screens/Mart";
import {MartStackScreen} from "app/navigation/StackScreen/MartStackScreen";
import {StoreStackScreen} from "app/navigation/StackScreen/StoreStackScreen";

const Drawer = createDrawerNavigator();

export default function DrawerScreen() {

	return (
		<Drawer.Navigator
			initialRouteName="Home"
			screenOptions={{
				headerShown: false,
			}}
			drawerContent={(props) => <CustomDrawer {...props} />}
		>
			<Drawer.Screen
				name="Home"
				component={RootStackScreen}
			/>
			<Drawer.Screen
				name="Mart"
				component={MartStackScreen}
			/>
			<Drawer.Screen
				name="Stores"
				component={StoreStackScreen}
			/>
			<Drawer.Screen
				name={"ProductDetail"}
				options={{
					headerShown: false,
					animationEnabled: false,
				}}
				component={ProductDetailScreen}
			/>
			<Drawer.Screen
				name={"PostDetail"}
				options={{
					headerShown: true,
					animationEnabled: false,
				}}
				component={PostDetailScreen}
			/>
			<Drawer.Screen name={"OrderDetail"}
							  options={{
								  headerShown: true,
							  }} component={OrderDetailScreen}/>
		</Drawer.Navigator>
	)
}
