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
import StoresScreen from "app/screens/Stores";
import ShopDetailsScreen from "app/screens/ShopDetails";
import ShopDetailScreen from "app/screens/ShopDetails";
import {FoodStackScreen} from "app/navigation/StackScreen/FoodStackScreen";
import RestaurantDetails from "app/screens/Food/RestaurantDetails";

const StoreStack = createStackNavigator()
export const StoreStackScreen = () => (
	<StoreStack.Navigator
		screenOptions={{
			headerShown: true
		}}
	>
		<StoreStack.Screen name={"Stores"} component={StoresScreen}/>
		<StoreStack.Screen
			name={"StoreDetail"}
			options={{
				headerShown: false,
			}}
			component={ShopDetailsScreen}
		/>
		<StoreStack.Screen
			name={"ProductDetail"}
			options={{
				headerShown: false,
			}}
			component={ProductDetailScreen}
		/>
		<StoreStack.Screen
			name={"ProjectDetail"}
			options={{
				headerShown: false,
			}}
			component={ProjectDetailScreen}
		/>
		<StoreStack.Screen
			name={"ProductCategory"}
			component={ProductCategoryScreen}
		/>
		<StoreStack.Screen name={"CustomerInformation"} component={CustomerInformation}/>
		<StoreStack.Screen
			name={"Login"}
			options={{
				headerShown: true,
				animationEnabled: false,
				gestureEnabled: false,
			}}
			component={LoginScreen}
		/>
		<StoreStack.Screen
			name={"Register"}
			options={{
				headerShown: true,
				animationEnabled: false,
				gestureEnabled: false,
			}}
			component={RegisterScreen}
		/>
		<StoreStack.Screen
			name={"ForgotPassword"}
			options={{
				headerShown: true,
				animationEnabled: false,
				gestureEnabled: false,
			}}
			component={ForgotPasswordScreen}
		/>
		<StoreStack.Screen name={"Account"} component={AccountScreen}/>
		<StoreStack.Screen
			name={"Posts"}
			options={{
				headerShown: true,
			}}
			component={PostsScreen}
		/>
		<StoreStack.Screen
			name={"PostCategory"}
			options={{
				headerShown: true,
			}}
			component={PostCategoryScreen}
		/>
		<StoreStack.Screen
			name={"PostDetail"}
			options={{
				headerShown: true,
			}}
			component={PostDetailScreen}
		/>
		<StoreStack.Screen
			name={"Videos"}
			options={{
				headerShown: true,
			}}
			component={VideosScreen}
		/>
		<StoreStack.Screen
			name={"Support"}
			options={{
				headerShown: false,
			}}
			component={SupportStackScreen}
		/>
		<StoreStack.Screen
			name={"Cart"}
			options={{
				headerShown: false,
			}}
			component={CartStackScreen}
		/>
		<StoreStack.Screen name={"PaymentMethod"} component={PaymentMethod}/>
		<StoreStack.Screen name={"InvestmentPaymentMethod"} component={InvestmentPaymentMethod}/>
		<StoreStack.Screen name={"Home"}
		                     options={{
			                     headerShown: false,
		                     }} component={HomeStackScreen}/>
		<StoreStack.Screen name={"Orders"}
		                     options={{
			                     headerShown: false,
		                     }} component={OrdersScreen}/>
		<StoreStack.Screen name={"OrderDetail"}
		                     options={{
			                     headerShown: true,
		                     }} component={OrderDetailScreen}/>
		<StoreStack.Screen
			name={"Foods"}
			options={{
				headerShown: false,
				animationEnabled: false,
			}}
			component={FoodStackScreen}
		/>
		<StoreStack.Screen
			name={"RestaurantDetails"}
			options={{
				headerShown: false,
			}}
			component={RestaurantDetails}
		/>
	</StoreStack.Navigator>
)
