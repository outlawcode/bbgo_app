import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "app/screens/Home";
import { useSelector } from "react-redux";
import { AuthStackScreen } from "app/navigation/StackScreen/AuthStackScreen";
import QRScanner from "app/screens/QRScanner/index.js";
import ClassroomRollup from "app/screens/QRScanner/ClassroomRollup.js";
import ParkingCheckin from "app/screens/QRScanner/ParkingCheckin.js";
import CompanyCheckin from "app/screens/QRScanner/CompanyCheckin.js";
import PayOrder from "app/screens/QRScanner/PayOrder.js";
import HTMMartScreen from "app/screens/HTM-Mart/index.js";
import ShopDetailScreen from "app/screens/ShopDetails/index.js";
import ProductDetailScreen from "app/screens/ProductDetail/index.js";
import ProjectDetailScreen from "app/screens/ProjectDetail/index.js";
import ProductCategoryScreen from "app/screens/Products/ProductCategory.js";
import CustomerInformation from "app/screens/CheckOut/CustomerInformation.js";
import LoginScreen from "app/screens/Auth/LoginScreen.js";
import RegisterScreen from "app/screens/Auth/RegisterScreen.js";
import ForgotPasswordScreen from "app/screens/Auth/ForgotPasswordScreen.js";
import AccountScreen from "app/screens/Account/index.js";
import PostsScreen from "app/screens/Posts/index.js";
import PostCategoryScreen from "app/screens/Posts/PostCategory.js";
import PostDetailScreen from "app/screens/Posts/PostDetail.js";
import VideosScreen from "app/screens/Videos/index.js";
import { SupportStackScreen } from "app/navigation/StackScreen/SupportStackScreen.js";
import { CartStackScreen } from "app/navigation/StackScreen/CartStackScreen.js";
import PaymentMethod from "app/screens/CheckOut/PaymentMethod.js";
import InvestmentPaymentMethod from "app/screens/InvestmentCheckout/PaymentMethod.js";
import { HomeStackScreen } from "app/navigation/StackScreen/HomeStackScreen.js";
import OrdersScreen from "app/screens/Orders/index.js";
import OrderDetailScreen from "app/screens/Orders/OrderDetail.js";
import { FoodStackScreen } from "app/navigation/StackScreen/FoodStackScreen.js";
import RestaurantDetails from "app/screens/Food/RestaurantDetails.js";
import SieuthiScreen from "app/screens/Mart";
import CheckoutScreen from "app/screens/CheckOut/Checkout";
import CheckoutCompleted from "app/screens/CheckOut/CheckoutCompleted";

const MartStack = createStackNavigator()

export function MartStackScreen() {
	const currentUser = useSelector(state => state.memberAuth.user);

	return <MartStack.Navigator
		screenOptions={{
			headerShown: true
		}}
	>
			<>
				<MartStack.Screen
					name={"Mart"}
					component={SieuthiScreen}
					options={{
						headerShown: true,
						animationEnabled: false,
						gestureEnabled: false,
					}}
				/>
				<MartStack.Screen
					name={"StoreDetail"}
					options={{
						headerShown: false,
					}}
					component={ShopDetailScreen}
				/>
				<MartStack.Screen
					name={"ProductDetail"}
					options={{
						headerShown: false,
					}}
					component={ProductDetailScreen}
				/>
				<MartStack.Screen
					name={"ProjectDetail"}
					options={{
						headerShown: false,
					}}
					component={ProjectDetailScreen}
				/>
				<MartStack.Screen
					name={"ProductCategory"}
					component={ProductCategoryScreen}
				/>
				<MartStack.Screen name={"CustomerInformation"} component={CustomerInformation}/>
				<MartStack.Screen
					name={"Login"}
					options={{
						headerShown: true,
						animationEnabled: false,
						gestureEnabled: false,
					}}
					component={LoginScreen}
				/>
				<MartStack.Screen
					name={"Register"}
					options={{
						headerShown: true,
						animationEnabled: false,
						gestureEnabled: false,
					}}
					component={RegisterScreen}
				/>
				<MartStack.Screen
					name={"ForgotPassword"}
					options={{
						headerShown: true,
						animationEnabled: false,
						gestureEnabled: false,
					}}
					component={ForgotPasswordScreen}
				/>
				<MartStack.Screen name={"Account"} component={AccountScreen}/>
				<MartStack.Screen
					name={"Posts"}
					options={{
						headerShown: true,
					}}
					component={PostsScreen}
				/>
				<MartStack.Screen
					name={"PostCategory"}
					options={{
						headerShown: true,
					}}
					component={PostCategoryScreen}
				/>
				<MartStack.Screen
					name={"PostDetail"}
					options={{
						headerShown: true,
					}}
					component={PostDetailScreen}
				/>
				<MartStack.Screen
					name={"Videos"}
					options={{
						headerShown: true,
					}}
					component={VideosScreen}
				/>
				<MartStack.Screen
					name={"Support"}
					options={{
						headerShown: false,
					}}
					component={SupportStackScreen}
				/>
				<MartStack.Screen
					name={"Cart"}
					options={{
						headerShown: false,
					}}
					component={CartStackScreen}
				/>
				<MartStack.Screen
					name={"CheckoutScreen"}
					component={CheckoutScreen}
				/>
				<MartStack.Screen
					name={"CheckoutCompleted"}
					component={CheckoutCompleted}
					options={{
						headerShown: false,
						animationEnabled: false,
						gestureEnabled: false,
					}}
				/>
				<MartStack.Screen name={"PaymentMethod"} component={PaymentMethod}/>
				<MartStack.Screen name={"InvestmentPaymentMethod"} component={InvestmentPaymentMethod}/>
				<MartStack.Screen name={"Home"}
													 options={{
														 headerShown: false,
													 }} component={HomeStackScreen}/>
				<MartStack.Screen name={"Orders"}
													 options={{
														 headerShown: false,
													 }} component={OrdersScreen}/>
				<MartStack.Screen name={"OrderDetail"}
													 options={{
														 headerShown: true,
													 }} component={OrderDetailScreen}/>
				<MartStack.Screen
					name={"Foods"}
					options={{
						headerShown: false,
						animationEnabled: false,
					}}
					component={FoodStackScreen}
				/>
				<MartStack.Screen
					name={"RestaurantDetails"}
					options={{
						headerShown: false,
					}}
					component={RestaurantDetails}
				/>
			</>
	</MartStack.Navigator>
}
