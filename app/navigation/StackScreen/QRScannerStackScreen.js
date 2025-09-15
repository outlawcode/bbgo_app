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

const QRScannerStack = createStackNavigator()

export function QRScannerStackScreen() {
	const currentUser = useSelector(state => state.memberAuth.user);

	return <QRScannerStack.Navigator
		screenOptions={{
			headerShown: true
		}}
	>
		{!currentUser ?
			<QRScannerStack.Screen
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
				<QRScannerStack.Screen
					name={"QRScan"}
					component={QRScanner}
					options={{
						headerShown: true,
						animationEnabled: false,
						gestureEnabled: false,
					}}
				/>
				<QRScannerStack.Screen
					name={"Home"}
					options={{
						headerShown: false,
					}}
					component={HomeScreen}
				/>
				<QRScannerStack.Screen
					name={"ClassroomRollup"}
					component={ClassroomRollup}
					options={{
						headerShown: true,
					}}
				/>
				<QRScannerStack.Screen
					name={"ParkingCheckin"}
					component={ParkingCheckin}
					options={{
						headerShown: true,
					}}
				/>
				<QRScannerStack.Screen
					name={"CompanyCheckin"}
					component={CompanyCheckin}
					options={{
						headerShown: true,
					}}
				/>
				<QRScannerStack.Screen
					name={"PayOrder"}
					component={PayOrder}
					options={{
						headerShown: true,
					}}
				/>
			</>
		}
	</QRScannerStack.Navigator>
}
