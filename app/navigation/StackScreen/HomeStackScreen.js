import * as React from "react";
import {createStackNavigator} from "@react-navigation/stack";
import HomeScreen from "app/screens/Home";
import ProductsScreen from "app/screens/Products";
import ProductDetailScreen from "app/screens/ProductDetail";
import {CartStackScreen} from "app/navigation/StackScreen/CartStackScreen";
import LoginScreen from "app/screens/Auth/LoginScreen";
import ProductCategoryScreen from "app/screens/Products/ProductCategory";
import PostsScreen from "app/screens/Posts";
import PostCategoryScreen from "app/screens/Posts/PostCategory";
import PostDetailScreen from "app/screens/Posts/PostDetail";
import RegisterScreen from "app/screens/Auth/RegisterScreen";
import ForgotPasswordScreen from "app/screens/Auth/ForgotPasswordScreen";
import OrdersScreen from "app/screens/Orders";
import {AccountStackScreen} from "app/navigation/StackScreen/AccountStackScreen";
import ContactScreen from "app/screens/Contact";
import OrderDetailScreen from "app/screens/Orders/OrderDetail";
import SearchProductScreen from "app/screens/Search/SearchProductScreen";
import CheckoutScreen from "app/screens/CheckOut/Checkout.js";

const HomeStack = createStackNavigator()
export const HomeStackScreen = () => (
	<HomeStack.Navigator
		screenOptions={{
			headerShown: false,
		}}
	>
		<HomeStack.Screen name={"Home"} component={HomeScreen}
						  options={{
							  animationEnabled: false,
						  }}/>
		<HomeStack.Screen
			name={"Products"}
			options={{
				headerShown: true,
				animationEnabled: false,
			}}
			component={ProductsScreen}
		/>
		<HomeStack.Screen
			name={"SearchScreen"}
			options={{
				headerShown: false,
				animationEnabled: false,
			}}
			component={SearchProductScreen}
		/>
		<HomeStack.Screen
			name={"ProductDetail"}
			options={{
				headerShown: false,
				animationEnabled: false,
			}}
			component={ProductDetailScreen}
		/>
		<HomeStack.Screen
			name={"ProductCategory"}
			options={{
				headerShown: true,
				animationEnabled: false,
			}}
			component={ProductCategoryScreen}
		/>

		<HomeStack.Screen
			name={"Posts"}
			options={{
				headerShown: true,
				animationEnabled: false,
			}}
			component={PostsScreen}
		/>
		<HomeStack.Screen
			name={"PostCategory"}
			options={{
				headerShown: true,
				animationEnabled: false,
			}}
			component={PostCategoryScreen}
		/>
		<HomeStack.Screen
			name={"PostDetail"}
			options={{
				headerShown: true,
				animationEnabled: false,
			}}
			component={PostDetailScreen}
		/>
		<HomeStack.Screen
			name={"Account"}
			options={{
				headerShown: false,
				animationEnabled: false,
			}}
			component={AccountStackScreen}
		/>
		<HomeStack.Screen
			name={"Login"}
			options={{
				headerShown: true,
				animationEnabled: false,
				gestureEnabled: false,
			}}
			component={LoginScreen}
		/>
		<HomeStack.Screen
			name={"Register"}
			options={{
				headerShown: true,
				animationEnabled: false,
				gestureEnabled: false,
			}}
			component={RegisterScreen}
		/>
		<HomeStack.Screen
			name={"ForgotPassword"}
			options={{
				headerShown: true,
				animationEnabled: false,
				gestureEnabled: false,
			}}
			component={ForgotPasswordScreen}
		/>
		<HomeStack.Screen
			name={"Cart"}
			component={CartStackScreen}
		/>
		<HomeStack.Screen
			name={"Orders"}
			component={OrdersScreen}
			options={{
				headerShown: true,
			}}
		/>
		<HomeStack.Screen
			name={"Contact"}
			options={{
				headerShown: true,
				animationEnabled: false,
			}}
			component={ContactScreen}
		/>
		<HomeStack.Screen name={"OrderDetail"}
		                  options={{
			                  headerShown: true,
		                  }} component={OrderDetailScreen}/>
		<HomeStack.Screen
			name={"CheckoutScreen"}
			options={{
				headerShown: true,
			}}
			component={CheckoutScreen}
		/>
	</HomeStack.Navigator>
)
