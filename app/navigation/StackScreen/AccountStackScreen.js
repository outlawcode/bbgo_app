import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AccountScreen from "app/screens/Account";
import { useSelector } from "react-redux";
import { AuthStackScreen } from "app/navigation/StackScreen/AuthStackScreen";
import AccountSettingScreen from "app/screens/Account/AccountSettingScreen";
import RewardWalletScreen from "app/screens/RewardWallet";
import TransactionDetailScreen from "app/screens/TransactionDetail";
import OrdersScreen from "app/screens/Orders/index";
import SearchOrdersScreen from "app/screens/Orders/SearchOrders";
import OrderDetailScreen from "app/screens/Orders/OrderDetail";
import CartScreen from "app/screens/Cart";
import ChildOrderListScreen from "app/screens/Affiliate/ChildOrderList";
import AffiliateProgramScreen from "app/screens/Affiliate";
import PasswordSettingScreen from "app/screens/Account/PasswordSettingScreen";
import PaymentSettingScreen from "app/screens/Account/PaymentSettingScreen";
import ProductsScreen from "app/screens/Products";
import ProductDetailScreen from "app/screens/ProductDetail";
import ProductCategoryScreen from "app/screens/Products/ProductCategory";
import PostsScreen from "app/screens/Posts";
import PostCategoryScreen from "app/screens/Posts/PostCategory";
import PostDetailScreen from "app/screens/Posts/PostDetail";
import ContactScreen from "app/screens/Contact";
import DeleteMeScreen from "app/screens/Account/DeleteMeScreen";
import AddressScreen from "app/screens/Address";
import KYCScreen from "app/screens/KYC";
import TwoFAScreen from "app/screens/TwoFA";
import TrainingScreen from "app/screens/Training";
import TrainingCategoryScreen from "app/screens/Training/Category";
import TrainingPostModal from "app/screens/Training/PostModal";
import SavingWalletScreen from "app/screens/SavingWallet";
import PointWalletScreen from "app/screens/PointWallet";

const AccountStack = createStackNavigator()

export function AccountStackScreen() {
	const currentUser = useSelector(state => state.memberAuth.user);

	return <AccountStack.Navigator
		initialRouteName={"Account"}
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
					name={"Training"}
					component={TrainingScreen}
					options={{
						headerShown: true,
					}}
				/>
				<AccountStack.Screen
					name={"TrainingCategory"}
					component={TrainingCategoryScreen}
					options={{
						headerShown: true,
					}}
				/>
				<AccountStack.Screen
					name={"TrainingPostModal"}
					component={TrainingPostModal}
					options={{
						headerShown: false,
						presentation: 'transparentModal'
					}}
				/>
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
					name={"AccountSetting"}
					component={AccountSettingScreen}
					options={{
						headerShown: true,
					}}
				/>
				<AccountStack.Screen
					name={"Address"}
					component={AddressScreen}
					options={{
						headerShown: true,
					}}
				/>
				<AccountStack.Screen
					name={"KYC"}
					component={KYCScreen}
					options={{
						headerShown: true,
					}}
				/>
				<AccountStack.Screen
					name={"TwoFA"}
					component={TwoFAScreen}
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
					name={"SavingWallet"}
					component={SavingWalletScreen}
					options={{
						headerShown: false,
					}}
				/>
				<AccountStack.Screen
					name={"PointWallet"}
					component={PointWalletScreen}
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
				<AccountStack.Screen name={"Products"} component={ProductsScreen}/>
				<AccountStack.Screen
					name={"ProductDetail"}
					options={{
						headerShown: false,
					}}
					component={ProductDetailScreen}
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
			</>
		}
	</AccountStack.Navigator>
}
