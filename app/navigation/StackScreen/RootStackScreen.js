import * as React from "react";
import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import { AppTabsScreen } from "app/navigation/StackScreen/BottomNavStack";
import ModalScreen from "app/screens/Modal/Modal";
import ModalOverlayScreen from "app/screens/Modal/ModalOverlay";
import { Platform } from "react-native";

const RootStack = createStackNavigator()
export const RootStackScreen = () => {
	return (
		<RootStack.Navigator
			headerMode={"none"}
			screenOptions={{
				animationTypeForReplace: 'pop',
				animationEnabled: true
			}}
			mode={"modal"}
		>
			<RootStack.Screen
				name={"AppScreen"}
				component={AppTabsScreen}
			/>
			<RootStack.Screen
				name={"Modal"}
				component={ModalScreen}
				options={{
					animationEnabled: true,
					gestureEnabled: true,
				}}
			/>
			<RootStack.Screen
				name={"ModalOverlay"}
				component={ModalOverlayScreen}
				options={{
					animationEnabled: true,
					gestureEnabled: true,
					cardOverlayEnabled: true,
					...TransitionPresets.ModalPresentationIOS
				}}
			/>
		</RootStack.Navigator>
	)
}
