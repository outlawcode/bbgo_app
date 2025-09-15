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
import SupportScreen from "app/screens/Support";
import FAQPageScreen from "app/screens/FAQPage";
import ContactScreen from "app/screens/Contact";
import ProjectDetailScreen from "app/screens/ProjectDetail";
import InvestmentPaymentMethod from "app/screens/InvestmentCheckout/PaymentMethod";

const SupportStack = createStackNavigator()
export const SupportStackScreen = () => (
	<SupportStack.Navigator
		screenOptions={{
			headerShown: true
		}}
	>
		<SupportStack.Screen name={"Support"} component={SupportScreen}/>
		<SupportStack.Screen name={"Home"} component={HomeScreen}/>
		<SupportStack.Screen name={"CustomerInformation"} component={CustomerInformation}/>
		<SupportStack.Screen name={"PaymentMethod"} component={PaymentMethod}/>
		<SupportStack.Screen name={"InvestmentPaymentMethod"} component={InvestmentPaymentMethod}/>
		<SupportStack.Screen name={"Products"} component={ProductsScreen}/>
		<SupportStack.Screen name={"ProductDetail"}
		                     options={{
			                     headerShown: false,
		                     }}
		                     component={ProductDetailScreen}/>
		<SupportStack.Screen name={"ProjectDetail"}
		                     options={{
			                     headerShown: false,
		                     }}
		                     component={ProjectDetailScreen}/>
		<SupportStack.Screen
			name={"ProductCategory"}
			component={ProductCategoryScreen}
		/>
		<SupportStack.Screen
			name={"CheckoutCompleted"}
			component={CheckoutCompleted}
			options={{
				headerShown: false,
				animationEnabled: false,
				gestureEnabled: false,
			}}
		/>
		<SupportStack.Screen
			name={"Login"}
			component={LoginScreen}
			options={{
				headerShown: true,
				animationEnabled: false,
				gestureEnabled: false,
			}}
		/>
		<SupportStack.Screen
			name={"Register"}
			component={RegisterScreen}
			options={{
				headerShown: true,
				animationEnabled: false,
				gestureEnabled: false,
			}}
		/>
		<SupportStack.Screen
			name={"ForgotPassword"}
			component={ForgotPasswordScreen}
			options={{
				headerShown: true,
				animationEnabled: false,
				gestureEnabled: false,
			}}
		/>
		<SupportStack.Screen
			name={"ResetPassword"}
			component={ResetPasswordScreen}
			options={{
				headerShown: true,
				animationEnabled: false,
				gestureEnabled: false,
			}}
		/>
		
		<SupportStack.Screen
			name={"Posts"}
			options={{
				headerShown: true,
			}}
			component={PostsScreen}
		/>
		<SupportStack.Screen
			name={"PostCategory"}
			options={{
				headerShown: true,
			}}
			component={PostCategoryScreen}
		/>
		<SupportStack.Screen
			name={"PostDetail"}
			options={{
				headerShown: true,
			}}
			component={PostDetailScreen}
		/>
		<SupportStack.Screen
			name={"Videos"}
			options={{
				headerShown: true,
			}}
			component={VideosScreen}
		/>
		<SupportStack.Screen
			name={"FAQScreen"}
			options={{
				headerShown: true,
			}}
			component={FAQPageScreen}
		/>
		<SupportStack.Screen
			name={"Contact"}
			options={{
				headerShown: true,
			}}
			component={ContactScreen}
		/>
	</SupportStack.Navigator>
)
