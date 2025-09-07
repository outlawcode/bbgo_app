import React from "react";
import { useSelector } from "react-redux";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Text, TouchableOpacity, View } from "react-native";

function CartIcon(props) {
	const cart = useSelector(state => state.CartReducer);
	let cartQuantity = 0
	if (cart) {
		cart.items.map((el) => (
			cartQuantity += el.quantity
		))
	}
	
	return (
		<TouchableOpacity
			onPress={() => props.navigation.navigate('Cart')}
			style={tw`relative`}>
			<Icon name={"cart"} size={22} style={tw`text-white ${props.dark && 'text-black'}`} />
			{cartQuantity > 0 &&
				<View style={tw`absolute -top-1 -right-2 bg-red-600 w-5 h-5 rounded-full flex items-center border-2 border-white`}>
					<Text  style={tw`text-white text-xs`}>
						{cartQuantity}
					</Text>
				</View>
			}
		</TouchableOpacity>
	);
}

export default CartIcon;
