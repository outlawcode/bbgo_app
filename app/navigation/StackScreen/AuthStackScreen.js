import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "app/screens/Home";
import AccountScreen from "app/screens/Account";
import { useSelector } from "react-redux";
import LoginScreen from "app/screens/Auth/LoginScreen";
import RegisterScreen from "app/screens/Auth/RegisterScreen";
import ForgotPasswordScreen from "app/screens/Auth/ForgotPasswordScreen";
import ResetPasswordScreen from "app/screens/Auth/ResetPasswordScreen";

const AuthStack = createStackNavigator()

export function AuthStackScreen() {
	return <AuthStack.Navigator
		screenOptions={{
			headerShown: true
		}}
	>
		<AuthStack.Screen
			name={"Login"}
            component={LoginScreen}
			options={{
				headerShown: true,
				animationEnabled: false,
				gestureEnabled: false,
			}}
		/>
		<AuthStack.Screen
			name={"Register"}
			component={RegisterScreen}
			options={{
				headerShown: true,
				animationEnabled: false,
				gestureEnabled: false,
			}}
		/>
		<AuthStack.Screen
			name={"ForgotPassword"}
			component={ForgotPasswordScreen}
			options={{
				headerShown: true,
				animationEnabled: false,
				gestureEnabled: false,
			}}
		/>
		<AuthStack.Screen
			name={"ResetPassword"}
			component={ResetPasswordScreen}
			options={{
				headerShown: true,
				animationEnabled: false,
				gestureEnabled: false,
			}}
		/>
		<AuthStack.Screen
			name={"Account"}
			component={AccountScreen}
			options={{
				headerShown: true,
				animationEnabled: false,
				gestureEnabled: false,
			}}
		/>
	</AuthStack.Navigator>
}
