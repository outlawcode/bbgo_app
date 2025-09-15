import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "app/screens/Home";
import AccountScreen from "app/screens/Account";
import { useSelector } from "react-redux";
import LoginScreen from "app/screens/Auth/LoginScreen";
import { AuthStackScreen } from "app/navigation/StackScreen/AuthStackScreen";
import AccountSettingScreen from "app/screens/Account/AccountSettingScreen";
import RewardWalletScreen from "app/screens/RewardWallet";
import CashWalletScreen from "app/screens/PointWallet";
import ProductWalletScreen from "app/screens/InvestmentWallet";
import StockWalletScreen from "app/screens/StockWallet";
import TransactionDetailScreen from "app/screens/TransactionDetail";
import OrdersScreen from "app/screens/Orders/index";
import SearchOrdersScreen from "app/screens/Orders/SearchOrders";
import OrderDetailScreen from "app/screens/Orders/OrderDetail";
import CartScreen from "app/screens/Cart";
import ChildOrderListScreen from "app/screens/Affiliate/ChildOrderList";
import AffiliateProgramScreen from "app/screens/Affiliate";
import SocialSettingScreen from "app/screens/Account/SocialSettingScreen";
import PasswordSettingScreen from "app/screens/Account/PasswordSettingScreen";
import PaymentSettingScreen from "app/screens/Account/PaymentSettingScreen";
import AccountLevelScreen from "app/screens/Level";
import MonthlyRewardScreen from "app/screens/Rewards/MonthlyReward";
import YearlyRewardScreen from "app/screens/Rewards/YearlyReward";
import ProductsScreen from "app/screens/Products";
import ProductDetailScreen from "app/screens/ProductDetail";
import ProductCategoryScreen from "app/screens/Products/ProductCategory";
import PostsScreen from "app/screens/Posts";
import PostCategoryScreen from "app/screens/Posts/PostCategory";
import PostDetailScreen from "app/screens/Posts/PostDetail";
import VideosScreen from "app/screens/Videos";
import { SupportStackScreen } from "app/navigation/StackScreen/SupportStackScreen";
import ContactScreen from "app/screens/Contact";
import DeleteMeScreen from "app/screens/Account/DeleteMeScreen";
import ProjectDetailScreen from "app/screens/ProjectDetail";
import UserKindScreen from "app/screens/UserKind";
import {StoreStackScreen} from "app/navigation/StackScreen/StoreStackScreen";
import ShopDetailScreen from "app/screens/ShopDetails";
import {FoodStackScreen} from "app/navigation/StackScreen/FoodStackScreen";
import RestaurantDetails from "app/screens/Food/RestaurantDetails";
import AffWalletScreen from "app/screens/AffWallet";
import VehicleSettingScreen from "app/screens/Account/Vehicles/VehicleSettingScreen.js";
import MyMart from "app/screens/MyMart/index.js";
import MartOrdersScreen from "app/screens/MyMart/MartOrders/index.js";
import MartOrderDetailScreen from "app/screens/MyMart/MartOrders/OrderDetail.js";
import MartSearchOrdersScreen from "app/screens/MyMart/MartOrders/SearchOrders.js";
import MartInfoSettingScreen from "app/screens/MyMart/MartInfoSettingScreen.js";
import MartWarehouse from "app/screens/MyMart/MartWarehouse.js";
import POSScreen from "app/screens/MyMart/POS/index.js";

// Import OnlineShop screens
import OnlineShop from "app/screens/OnlineShop/index.js";
import ShopStatistics from "app/screens/OnlineShop/ShopStatistics.js";
import ShopProducts from "app/screens/OnlineShop/ShopProducts.js";
import AddProduct from "app/screens/OnlineShop/AddProduct.js";
import EditProduct from "app/screens/OnlineShop/EditProduct.js";
import ShopInventory from "app/screens/OnlineShop/ShopInventory.js";
import InventoryReport from "app/screens/OnlineShop/InventoryReport.js";
import ShopOrders from "app/screens/OnlineShop/ShopOrders.js";
import ShopOrderDetail from "app/screens/OnlineShop/ShopOrderDetails.js";
import ShopServices from "app/screens/OnlineShop/ShopServices.js";
import EditService from "app/screens/OnlineShop/EditService.js";
import ShopSettings from "app/screens/OnlineShop/ShopSettings.js";
import POSServiceScreen from "app/screens/MyMart/POS/POSServiceScreen";

const AccountStack = createStackNavigator()

export function AccountStackScreen() {
	const currentUser = useSelector(state => state.memberAuth.user);

	return <AccountStack.Navigator
		screenOptions={{
			headerShown: true
		}}
	>
		{!currentUser ?
			<AccountStack.Screen
				name={"Login"}
				component={AuthStackScreen}
				options={{
					headerShown: false,
					animationEnabled: false,
					gestureEnabled: false,
				}}
			/>
			:
			<>
				<AccountStack.Screen
					name={"Account"}
					component={AccountScreen}
					options={{
						headerShown: true,
						animationEnabled: false,
						gestureEnabled: false,
					}}
				/>
				<AccountStack.Screen
					name={"Stores"}
					options={{
						headerShown: false,
					}}
					component={StoreStackScreen}
				/>
				<AccountStack.Screen
					name={"StoreDetail"}
					options={{
						headerShown: false,
					}}
					component={ShopDetailScreen}
				/>
				<AccountStack.Screen
					name={"Foods"}
					options={{
						headerShown: false,
						animationEnabled: false,
					}}
					component={FoodStackScreen}
				/>
				<AccountStack.Screen
					name={"RestaurantDetails"}
					options={{
						headerShown: false,
					}}
					component={RestaurantDetails}
				/>
				<AccountStack.Screen
					name={"AccountSetting"}
					component={AccountSettingScreen}
					options={{
						headerShown: true,
					}}
				/>
				<AccountStack.Screen
					name={"VehicleSetting"}
					component={VehicleSettingScreen}
					options={{
						headerShown: true,
					}}
				/>
				<AccountStack.Screen
					name={"ChangeSocialInfo"}
					component={SocialSettingScreen}
					options={{
						headerShown: true,
					}}
				/>
				<AccountStack.Screen
					name={"ChangePassword"}
					component={PasswordSettingScreen}
					options={{
						headerShown: true,
					}}
				/>
				<AccountStack.Screen
					name={"ChangePaymentInfo"}
					component={PaymentSettingScreen}
					options={{
						headerShown: true,
					}}
				/>
				<AccountStack.Screen
					name={"RewardWallet"}
					component={RewardWalletScreen}
					options={{
						headerShown: false,
					}}
				/>
				<AccountStack.Screen
					name={"AffWallet"}
					component={AffWalletScreen}
					options={{
						headerShown: false,
					}}
				/>
				<AccountStack.Screen
					name={"UserKind"}
					component={UserKindScreen}
					options={{
						headerShown: false,
					}}
				/>
				<AccountStack.Screen
					name={"PointWallet"}
					component={CashWalletScreen}
					options={{
						headerShown: false,
					}}
				/>
				<AccountStack.Screen
					name={"InvestmentWallet"}
					component={ProductWalletScreen}
					options={{
						headerShown: false,
					}}
				/>
				<AccountStack.Screen
					name={"StockWallet"}
					component={StockWalletScreen}
					options={{
						headerShown: false,
					}}
				/>
				<AccountStack.Screen
					name={"TransactionDetail"}
					component={TransactionDetailScreen}
				/>
				<AccountStack.Screen
					name={"Orders"}
					component={OrdersScreen}
				/>
				<AccountStack.Screen
					name={"SearchOrders"}
					component={SearchOrdersScreen}
				/>
				<AccountStack.Screen
					name={"OrderDetail"}
					component={OrderDetailScreen}
				/>
				<AccountStack.Screen
					name={"Cart"}
					component={CartScreen}
				/>
				<AccountStack.Screen
					name={"ChildOrders"}
					component={ChildOrderListScreen}
				/>
				<AccountStack.Screen
					name={"AffiliateProgram"}
					component={AffiliateProgramScreen}
				/>
				<AccountStack.Screen
					name={"LevelInfo"}
					component={AccountLevelScreen}
					options={{
						headerShown: false,
					}}
				/>
				<AccountStack.Screen
					name={"MonthlyReward"}
					component={MonthlyRewardScreen}
					options={{
						headerShown: false,
					}}
				/>
				<AccountStack.Screen
					name={"YearlyReward"}
					component={YearlyRewardScreen}
					options={{
						headerShown: false,
					}}
				/>
				<AccountStack.Screen name={"Products"} component={ProductsScreen}/>
				<AccountStack.Screen
					name={"ProductDetail"}
					options={{
						headerShown: false,
					}}
					component={ProductDetailScreen}
				/>
				<AccountStack.Screen
					name={"ProjectDetail"}
					options={{
						headerShown: false,
					}}
					component={ProjectDetailScreen}
				/>
				<AccountStack.Screen
					name={"ProductCategory"}
					component={ProductCategoryScreen}
				/>
				<AccountStack.Screen
					name={"Posts"}
					options={{
						headerShown: true,
					}}
					component={PostsScreen}
				/>
				<AccountStack.Screen
					name={"PostCategory"}
					options={{
						headerShown: true,
					}}
					component={PostCategoryScreen}
				/>
				<AccountStack.Screen
					name={"PostDetail"}
					options={{
						headerShown: true,
					}}
					component={PostDetailScreen}
				/>
				<AccountStack.Screen
					name={"Videos"}
					options={{
						headerShown: true,
					}}
					component={VideosScreen}
				/>
				<AccountStack.Screen
					name={"Support"}
					options={{
						headerShown: false,
					}}
					component={SupportStackScreen}
				/>
				<AccountStack.Screen
					name={"Contact"}
					options={{
						headerShown: true,
					}}
					component={ContactScreen}
				/>
				<AccountStack.Screen
					name={"DeleteMe"}
					options={{
						headerShown: true,
					}}
					component={DeleteMeScreen}
				/>
				<AccountStack.Screen
					name={"MyMart"}
					options={{
						headerShown: true,
					}}
					component={MyMart}
				/>
				<AccountStack.Screen
					name={"MartOrders"}
					options={{
						headerShown: true,
					}}
					component={MartOrdersScreen}
				/>
				<AccountStack.Screen
					name={"MartOrderDetail"}
					options={{
						headerShown: true,
					}}
					component={MartOrderDetailScreen}
				/>
				<AccountStack.Screen
					name={"MartSearchOrder"}
					options={{
						headerShown: true,
					}}
					component={MartSearchOrdersScreen}
				/>
				<AccountStack.Screen
					name={"MartInfoSettings"}
					options={{
						headerShown: true,
					}}
					component={MartInfoSettingScreen}
				/>
				<AccountStack.Screen
					name={"MartWarehouse"}
					options={{
						headerShown: true,
					}}
					component={MartWarehouse}
				/>
				<AccountStack.Screen
					name={"POS"}
					options={{
						headerShown: true,
					}}
					component={POSScreen}
				/>
				<AccountStack.Screen
					name={"POSService"}
					options={{
						headerShown: true,
					}}
					component={POSServiceScreen}
				/>

				{/* OnlineShop Screen Routes */}
				<AccountStack.Screen
					name={"OnlineShop"}
					options={{
						headerShown: true,
					}}
					component={OnlineShop}
				/>
				<AccountStack.Screen
					name={"ShopStatistics"}
					options={{
						headerShown: true,
					}}
					component={ShopStatistics}
				/>
				<AccountStack.Screen
					name={"ShopProducts"}
					options={{
						headerShown: true,
					}}
					component={ShopProducts}
				/>
				<AccountStack.Screen
					name={"AddProduct"}
					options={{
						headerShown: true,
					}}
					component={AddProduct}
				/>
				<AccountStack.Screen
					name={"EditProduct"}
					options={{
						headerShown: true,
					}}
					component={EditProduct}
				/>
				<AccountStack.Screen
					name={"ShopInventory"}
					options={{
						headerShown: true,
					}}
					component={ShopInventory}
				/>
				<AccountStack.Screen
					name={"InventoryReport"}
					options={{
						headerShown: true,
					}}
					component={InventoryReport}
				/>
				<AccountStack.Screen
					name={"ShopOrders"}
					options={{
						headerShown: true,
					}}
					component={ShopOrders}
				/>
				<AccountStack.Screen
					name={"ShopOrderDetail"}
					options={{
						headerShown: true,
					}}
					component={ShopOrderDetail}
				/>
				<AccountStack.Screen
					name={"ShopServices"}
					options={{
						headerShown: true,
					}}
					component={ShopServices}
				/>
				<AccountStack.Screen
					name={"EditService"}
					options={{
						headerShown: true,
					}}
					component={EditService}
				/>
				<AccountStack.Screen
					name={"ShopSettings"}
					options={{
						headerShown: true,
					}}
					component={ShopSettings}
				/>
			</>
		}
	</AccountStack.Navigator>
}
