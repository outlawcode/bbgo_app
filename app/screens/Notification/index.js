import React, { useEffect } from "react";
import { StatusBar, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import CartIcon from "app/screens/Cart/components/cartIcon";

function NotificationScreen(props) {
	useEffect(() => {
		props.navigation.setOptions({
			title: 'Thông báo',
			headerStyle: {
				backgroundColor: '#fff',
			},
			headerTintColor: '#000',
			headerRight: () => (
				<View style={tw`mr-3`}>
					<CartIcon navigation={props.navigation} dark={true} />
				</View>
			),
		})
	}, [])
	return (
		<View>
			<StatusBar barStyle={"dark-content"}/>
		
		</View>
	);
}

export default NotificationScreen;
