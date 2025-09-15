import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "app/screens/Home";
import ProductsScreen from "app/screens/Products";
import AccountScreen from "app/screens/Account";
import ProductDetailScreen from "app/screens/ProductDetail";
import ProductCategoryScreen from "app/screens/Products/ProductCategory";
import LoginScreen from "app/screens/Auth/LoginScreen";
import RegisterScreen from "app/screens/Auth/RegisterScreen";
import ForgotPasswordScreen from "app/screens/Auth/ForgotPasswordScreen";
import CustomerInformation from "app/screens/CheckOut/CustomerInformation";
import PostsScreen from "app/screens/Posts";
import PostCategoryScreen from "app/screens/Posts/PostCategory";
import PostDetailScreen from "app/screens/Posts/PostDetail";
import VideosScreen from "app/screens/Videos";
import { SupportStackScreen } from "app/navigation/StackScreen/SupportStackScreen";
import { CartStackScreen } from "app/navigation/StackScreen/CartStackScreen";
import PaymentMethod from "app/screens/CheckOut/PaymentMethod";
import { HomeStackScreen } from "app/navigation/StackScreen/HomeStackScreen";
import OrdersScreen from "app/screens/Orders";
import OrderDetailScreen from "app/screens/Orders/OrderDetail";
import ProjectDetailScreen from "app/screens/ProjectDetail";
import InvestmentPaymentMethod from "app/screens/InvestmentCheckout/PaymentMethod";
import {StoreStackScreen} from "app/navigation/StackScreen/StoreStackScreen";
import ShopDetailScreen from "app/screens/ShopDetails";
import {FoodStackScreen} from "app/navigation/StackScreen/FoodStackScreen";
import RestaurantDetails from "app/screens/Food/RestaurantDetails";
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
			name={"ProjectDetail"}
			options={{
				headerShown: false,
			}}
			component={ProjectDetailScreen}
		/>
		<ProductStack.Screen
			name={"ProductCategory"}
			component={ProductCategoryScreen}
		/>
		<ProductStack.Screen name={"CustomerInformation"} component={CustomerInformation}/>
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
			name={"Videos"}
			options={{
				headerShown: true,
			}}
			component={VideosScreen}
		/>
		<ProductStack.Screen
			name={"Support"}
			options={{
				headerShown: false,
			}}
			component={SupportStackScreen}
		/>
		<ProductStack.Screen
			name={"Cart"}
			options={{
				headerShown: false,
			}}
			component={CartStackScreen}
		/>

		<ProductStack.Screen
			name={"Stores"}
			options={{
				headerShown: false,
			}}
			component={StoreStackScreen}
		/>
		<ProductStack.Screen
			name={"StoreDetail"}
			options={{
				headerShown: false,
			}}
			component={ShopDetailScreen}
		/>
		<ProductStack.Screen
			name={"Foods"}
			options={{
				headerShown: false,
				animationEnabled: false,
			}}
			component={FoodStackScreen}
		/><ProductStack.Screen
		name={"RestaurantDetails"}
		options={{
			headerShown: false,
		}}
		component={RestaurantDetails}
	/>
		<ProductStack.Screen name={"PaymentMethod"} component={PaymentMethod}/>
		<ProductStack.Screen name={"InvestmentPaymentMethod"} component={InvestmentPaymentMethod}/>
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
