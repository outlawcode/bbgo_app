import * as React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {RootStackScreen} from "app/navigation/StackScreen/RootStackScreen";
import CustomDrawer from "app/components/CustomDrawer";
import ProductDetailScreen from "app/screens/ProductDetail";
import PostDetailScreen from "app/screens/Posts/PostDetail";
import OrderDetailScreen from "app/screens/Orders/OrderDetail";

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
