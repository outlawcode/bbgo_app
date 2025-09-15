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
import FoodScreen from "app/screens/Food/FoodScreen";
import RestaurantDetails from "app/screens/Food/RestaurantDetails";
import PaymentMethodFood from "app/screens/Food/CheckOutFood/PaymentMethod";
import CustomerInformationFood from "app/screens/Food/CheckOutFood/CustomerInformation";

const FoodStack = createStackNavigator()
export const FoodStackScreen = (props) => (
	<FoodStack.Navigator
		screenOptions={{
			headerShown: true
		}}
	>
		<FoodStack.Screen
			name={"Foods"}
		  	options={{
		   		headerShown: false,
		  	}}
			component={FoodScreen}
			initialParams={{
				...props
			}}
		/>
		<FoodStack.Screen
			name={"RestaurantDetails"}
			options={{
				headerShown: false,
			}}
			component={RestaurantDetails}
		/>
		<FoodStack.Screen
			name={"Login"}
			options={{
				headerShown: true,
				animationEnabled: false,
				gestureEnabled: false,
			}}
			component={LoginScreen}
		/>
		<FoodStack.Screen
			name={"Register"}
			options={{
				headerShown: true,
				animationEnabled: false,
				gestureEnabled: false,
			}}
			component={RegisterScreen}
		/>
		<FoodStack.Screen
			name={"ForgotPassword"}
			options={{
				headerShown: true,
				animationEnabled: false,
				gestureEnabled: false,
			}}
			component={ForgotPasswordScreen}
		/>
		<FoodStack.Screen name={"Account"} component={AccountScreen}/>
		<FoodStack.Screen
			name={"Posts"}
			options={{
				headerShown: true,
			}}
			component={PostsScreen}
		/>
		<FoodStack.Screen
			name={"PostCategory"}
			options={{
				headerShown: true,
			}}
			component={PostCategoryScreen}
		/>
		<FoodStack.Screen
			name={"PostDetail"}
			options={{
				headerShown: true,
			}}
			component={PostDetailScreen}
		/>
		<FoodStack.Screen
			name={"Support"}
			options={{
				headerShown: false,
			}}
			component={SupportStackScreen}
		/>
		<FoodStack.Screen
			name={"Cart"}
			options={{
				headerShown: false,
			}}
			component={CartStackScreen}
		/>
		<FoodStack.Screen name={"CustomerInformationFood"} component={CustomerInformationFood}/>
		<FoodStack.Screen name={"PaymentMethodFood"} component={PaymentMethodFood}/>
		<FoodStack.Screen name={"InvestmentPaymentMethod"} component={InvestmentPaymentMethod}/>
		<FoodStack.Screen name={"Home"}
		                     options={{
			                     headerShown: false,
		                     }} component={HomeStackScreen}/>
		<FoodStack.Screen name={"Orders"}
		                     options={{
			                     headerShown: false,
		                     }} component={OrdersScreen}/>
		<FoodStack.Screen name={"OrderDetail"}
		                     options={{
			                     headerShown: true,
		                     }} component={OrderDetailScreen}/>
	</FoodStack.Navigator>
)
