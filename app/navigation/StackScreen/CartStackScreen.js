import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import CartScreen from "app/screens/Cart";
import CustomerInformation from "app/screens/CheckOut/CustomerInformation";
import PaymentMethod from "app/screens/CheckOut/PaymentMethod";
import CheckoutCompleted from "app/screens/CheckOut/CheckoutCompleted";
import ProductsScreen from "app/screens/Products";
import ProductDetailScreen from "app/screens/ProductDetail";
import LoginScreen from "app/screens/Auth/LoginScreen";
import RegisterScreen from "app/screens/Auth/RegisterScreen";
import ForgotPasswordScreen from "app/screens/Auth/ForgotPasswordScreen";
import ResetPasswordScreen from "app/screens/Auth/ResetPasswordScreen";
import { HomeStackScreen } from "app/navigation/StackScreen/HomeStackScreen";
import HomeScreen from "app/screens/Home";
import ProductCategoryScreen from "app/screens/Products/ProductCategory";
import PostsScreen from "app/screens/Posts";
import PostCategoryScreen from "app/screens/Posts/PostCategory";
import PostDetailScreen from "app/screens/Posts/PostDetail";
import VideosScreen from "app/screens/Videos";
import { SupportStackScreen } from "app/navigation/StackScreen/SupportStackScreen";
import OrdersScreen from "app/screens/Orders";
import OrderDetailScreen from "app/screens/Orders/OrderDetail";
import ProjectDetailScreen from "app/screens/ProjectDetail";
import InvestmentCheckoutCompleted from "app/screens/InvestmentCheckout/CheckoutCompleted";
import InvestmentPaymentMethod from "app/screens/InvestmentCheckout/PaymentMethod";
import {StoreStackScreen} from "app/navigation/StackScreen/StoreStackScreen";
import ShopDetailScreen from "app/screens/ShopDetails";
import {FoodStackScreen} from "app/navigation/StackScreen/FoodStackScreen";
import RestaurantDetails from "app/screens/Food/RestaurantDetails";
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
		<CartStack.Screen name={"CustomerInformation"} component={CustomerInformation}/>
		<CartStack.Screen name={"PaymentMethod"} component={PaymentMethod}/>
		<CartStack.Screen name={"InvestmentPaymentMethod"} component={InvestmentPaymentMethod}/>
		<CartStack.Screen name={"Products"} component={ProductsScreen}/>
		<CartStack.Screen name={"ProductDetail"}
		                  options={{
			                  headerShown: false,
		                  }} component={ProductDetailScreen}/>
		<CartStack.Screen name={"ProjectDetail"}
		                  options={{
			                  headerShown: false,
		                  }} component={ProjectDetailScreen}/>
		<CartStack.Screen
			name={"ProductCategory"}
			component={ProductCategoryScreen}
		/>
		<CartStack.Screen
			name={"CheckoutScreen"}
			component={CheckoutScreen}
		/>
		<CartStack.Screen
			name={"CheckoutCompleted"}
			component={CheckoutCompleted}
			options={{
				headerShown: false,
				animationEnabled: false,
				gestureEnabled: false,
			}}
		/>
		<CartStack.Screen
			name={"InvestmentCheckoutCompleted"}
			component={InvestmentCheckoutCompleted}
			options={{
				headerShown: false,
				animationEnabled: false,
				gestureEnabled: false,
			}}
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
		<CartStack.Screen
			name={"Videos"}
			options={{
				headerShown: true,
			}}
			component={VideosScreen}
		/>
		<CartStack.Screen
			name={"Support"}
			options={{
				headerShown: false,
			}}
			component={SupportStackScreen}
		/>
		<CartStack.Screen name={"Orders"} component={OrdersScreen}/>
		<CartStack.Screen name={"OrderDetail"} component={OrderDetailScreen}/>
		<CartStack.Screen
			name={"Stores"}
			options={{
				headerShown: false,
			}}
			component={StoreStackScreen}
		/>
		<CartStack.Screen
			name={"StoreDetail"}
			options={{
				headerShown: false,
			}}
			component={ShopDetailScreen}
		/>
		<CartStack.Screen
			name={"Foods"}
			options={{
				headerShown: false,
				animationEnabled: false,
			}}
			component={FoodStackScreen}
		/>
		<CartStack.Screen
			name={"RestaurantDetails"}
			options={{
				headerShown: false,
			}}
			component={RestaurantDetails}
		/>
	</CartStack.Navigator>
)
