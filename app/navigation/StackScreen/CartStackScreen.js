import * as React from "react";
import {createStackNavigator} from "@react-navigation/stack";
import CartScreen from "app/screens/Cart";
import ProductsScreen from "app/screens/Products";
import ProductDetailScreen from "app/screens/ProductDetail";
import LoginScreen from "app/screens/Auth/LoginScreen";
import RegisterScreen from "app/screens/Auth/RegisterScreen";
import ForgotPasswordScreen from "app/screens/Auth/ForgotPasswordScreen";
import ResetPasswordScreen from "app/screens/Auth/ResetPasswordScreen";
import HomeScreen from "app/screens/Home";
import ProductCategoryScreen from "app/screens/Products/ProductCategory";
import PostsScreen from "app/screens/Posts";
import PostCategoryScreen from "app/screens/Posts/PostCategory";
import PostDetailScreen from "app/screens/Posts/PostDetail";
import OrdersScreen from "app/screens/Orders";
import OrderDetailScreen from "app/screens/Orders/OrderDetail";
import CheckoutScreen from "app/screens/CheckOut/Checkout.js";

const CartStack = createStackNavigator()
export const CartStackScreen = () => (
	<CartStack.Navigator
		screenOptions={{
			headerShown: true
		}}
	>
		<CartStack.Screen name={"Cart"} component={CartScreen}/>
		<CartStack.Screen name={"Home"} options={{
			headerShown: false,
		}}  component={HomeScreen}/>
		<CartStack.Screen name={"Products"} component={ProductsScreen}/>
		<CartStack.Screen name={"ProductDetail"}
		                  options={{
			                  headerShown: false,
		                  }} component={ProductDetailScreen}/>
		<CartStack.Screen
			name={"ProductCategory"}
			component={ProductCategoryScreen}
		/>
		<CartStack.Screen
			name={"Checkout"}
			component={CheckoutScreen}
		/>
		<CartStack.Screen
			name={"Login"}
			component={LoginScreen}
			options={{
				headerShown: true,
				animationEnabled: false,
				gestureEnabled: false,
			}}
		/>
		<CartStack.Screen
			name={"Register"}
			component={RegisterScreen}
			options={{
				headerShown: true,
				animationEnabled: false,
				gestureEnabled: false,
			}}
		/>
		<CartStack.Screen
			name={"ForgotPassword"}
			component={ForgotPasswordScreen}
			options={{
				headerShown: true,
				animationEnabled: false,
				gestureEnabled: false,
			}}
		/>
		<CartStack.Screen
			name={"ResetPassword"}
			component={ResetPasswordScreen}
			options={{
				headerShown: true,
				animationEnabled: false,
				gestureEnabled: false,
			}}
		/>

		<CartStack.Screen
			name={"Posts"}
			options={{
				headerShown: true,
			}}
			component={PostsScreen}
		/>
		<CartStack.Screen
			name={"PostCategory"}
			options={{
				headerShown: true,
			}}
			component={PostCategoryScreen}
		/>
		<CartStack.Screen
			name={"PostDetail"}
			options={{
				headerShown: true,
			}}
			component={PostDetailScreen}
		/>
		<CartStack.Screen name={"Orders"} component={OrdersScreen}/>
		<CartStack.Screen name={"OrderDetail"} component={OrderDetailScreen}/>
	</CartStack.Navigator>
)
