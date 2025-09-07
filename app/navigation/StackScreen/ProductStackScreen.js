import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ProductsScreen from "app/screens/Products";
import AccountScreen from "app/screens/Account";
import ProductDetailScreen from "app/screens/ProductDetail";
import ProductCategoryScreen from "app/screens/Products/ProductCategory";
import LoginScreen from "app/screens/Auth/LoginScreen";
import RegisterScreen from "app/screens/Auth/RegisterScreen";
import ForgotPasswordScreen from "app/screens/Auth/ForgotPasswordScreen";
import PostsScreen from "app/screens/Posts";
import PostCategoryScreen from "app/screens/Posts/PostCategory";
import PostDetailScreen from "app/screens/Posts/PostDetail";
import { CartStackScreen } from "app/navigation/StackScreen/CartStackScreen";
import { HomeStackScreen } from "app/navigation/StackScreen/HomeStackScreen";
import OrdersScreen from "app/screens/Orders";
import OrderDetailScreen from "app/screens/Orders/OrderDetail";
import CheckoutScreen from "app/screens/CheckOut/Checkout.js";

const ProductStack = createStackNavigator()
export const ProductStackScreen = () => (
	<ProductStack.Navigator
		screenOptions={{
			headerShown: true
		}}
	>
		<ProductStack.Screen name={"Products"} component={ProductsScreen}/>
		<ProductStack.Screen
			name={"ProductDetail"}
			options={{
				headerShown: false,
			}}
			component={ProductDetailScreen}
		/>
		<ProductStack.Screen
			name={"ProductCategory"}
			component={ProductCategoryScreen}
		/>
		<ProductStack.Screen
			name={"Login"}
			options={{
				headerShown: true,
				animationEnabled: false,
				gestureEnabled: false,
			}}
			component={LoginScreen}
		/>
		<ProductStack.Screen
			name={"Register"}
			options={{
				headerShown: true,
				animationEnabled: false,
				gestureEnabled: false,
			}}
			component={RegisterScreen}
		/>
		<ProductStack.Screen
			name={"ForgotPassword"}
			options={{
				headerShown: true,
				animationEnabled: false,
				gestureEnabled: false,
			}}
			component={ForgotPasswordScreen}
		/>
		<ProductStack.Screen name={"Account"} component={AccountScreen}/>
		<ProductStack.Screen
			name={"Posts"}
			options={{
				headerShown: true,
			}}
			component={PostsScreen}
		/>
		<ProductStack.Screen
			name={"PostCategory"}
			options={{
				headerShown: true,
			}}
			component={PostCategoryScreen}
		/>
		<ProductStack.Screen
			name={"PostDetail"}
			options={{
				headerShown: true,
			}}
			component={PostDetailScreen}
		/>
		<ProductStack.Screen
			name={"Cart"}
			options={{
				headerShown: false,
			}}
			component={CartStackScreen}
		/>

		<ProductStack.Screen name={"Home"}
		                     options={{
			                     headerShown: false,
		                     }} component={HomeStackScreen}/>
		<ProductStack.Screen name={"Orders"}
		                     options={{
			                     headerShown: false,
		                     }} component={OrdersScreen}/>
		<ProductStack.Screen name={"OrderDetail"}
		                     options={{
			                     headerShown: true,
		                     }} component={OrderDetailScreen}/>

		<ProductStack.Screen
			name={"CheckoutScreen"}
			component={CheckoutScreen}
		/>
	</ProductStack.Navigator>
)
