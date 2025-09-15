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
import CustomerInformation from "app/screens/CheckOut/CustomerInformation";
import PaymentMethod from "app/screens/CheckOut/PaymentMethod";
import CheckoutCompleted from "app/screens/CheckOut/CheckoutCompleted";
import OrdersScreen from "app/screens/Orders";
import {AccountStackScreen} from "app/navigation/StackScreen/AccountStackScreen";
import VideosScreen from "app/screens/Videos";
import FAQPageScreen from "app/screens/FAQPage";
import {SupportStackScreen} from "app/navigation/StackScreen/SupportStackScreen";
import ContactScreen from "app/screens/Contact";
import OrderDetailScreen from "app/screens/Orders/OrderDetail";
import ProjectDetailScreen from "app/screens/ProjectDetail";
import InvestmentPaymentMethod from "app/screens/InvestmentCheckout/PaymentMethod";
import FoodScreen from "app/screens/Food/FoodScreen";
import {StoreStackScreen} from "app/navigation/StackScreen/StoreStackScreen";
import ShopDetailScreen from "app/screens/ShopDetails";
import {FoodStackScreen} from "app/navigation/StackScreen/FoodStackScreen";
import RestaurantDetails from "app/screens/Food/RestaurantDetails";
import CustomerInformationFood from "app/screens/Food/CheckOutFood/CustomerInformation";
import PaymentMethodFood from "app/screens/Food/CheckOutFood/PaymentMethod";
import Home from "app/screens/Home";
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
			name={"Stores"}
			options={{
				headerShown: false,
			}}
			component={StoreStackScreen}
		/>
		<HomeStack.Screen
			name={"StoreDetail"}
			options={{
				headerShown: false,
			}}
			component={ShopDetailScreen}
		/>
		<HomeStack.Screen
			name={"Foods"}
			options={{
				headerShown: false,
				animationEnabled: false,
			}}
			component={FoodStackScreen}
		/>
		<HomeStack.Screen
			name={"RestaurantDetails"}
			options={{
				headerShown: false,
			}}
			component={RestaurantDetails}
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
			name={"ProjectDetail"}
			options={{
				headerShown: false,
				animationEnabled: false,
			}}
			component={ProjectDetailScreen}
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
			name={"Videos"}
			options={{
				headerShown: true,
				animationEnabled: false,
			}}
			component={VideosScreen}
		/>
		<HomeStack.Screen
			name={"FAQScreen"}
			options={{
				headerShown: true,
				animationEnabled: false,
			}}
			component={FAQPageScreen}
		/>
		<HomeStack.Screen
			name={"Support"}
			options={{
				headerShown: false,
				animationEnabled: false,
			}}
			component={SupportStackScreen}
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
			name={"CustomerInformation"}
			component={CustomerInformation}
			options={{
				headerShown: true,
				animationEnabled: false,
				gestureEnabled: true,
			}}
		/>
		<HomeStack.Screen
			name={"PaymentMethod"}
			component={PaymentMethod}
			options={{
				headerShown: true,
				animationEnabled: true,
				gestureEnabled: true,
			}}
		/>
		<HomeStack.Screen
			name={"InvestmentPaymentMethod"}
			component={InvestmentPaymentMethod}
			options={{
				headerShown: true,
				animationEnabled: true,
				gestureEnabled: true,
			}}
		/>
		<HomeStack.Screen
			name={"CheckoutCompleted"}
			component={CheckoutCompleted}
			options={{
				headerShown: false,
				animationEnabled: false,
				gestureEnabled: false,
			}}
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
		<HomeStack.Screen name={"CustomerInformationFood"} component={CustomerInformationFood}
						  options={{
							  headerShown: true,
							  animationEnabled: false,
						  }}/>
		<HomeStack.Screen name={"PaymentMethodFood"} component={PaymentMethodFood}
						  options={{
							  headerShown: true,
							  animationEnabled: false,
						  }}/>
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
