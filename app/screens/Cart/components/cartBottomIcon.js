import React from "react";
import { useSelector } from "react-redux";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Text, View } from "react-native";

function CartBottomIcon(props) {
	const cart = useSelector(state => state.CartReducer);
	let cartQuantity = 0
	if (cart) {
		cart.items.map((el) => (
			cartQuantity += el.quantity
		))
	}
	
	return (
		<View style={tw`relative`}>
			<Icon name={"cart-outline"} size={props.size} color={props.color} />
			{cartQuantity > 0 &&
				<View style={tw`absolute -top-1 -right-1 bg-red-600 w-5 h-5 rounded-full flex items-center border-2 border-white`}>
					<Text style={tw`text-white text-xs`} allowFontScaling={false}>
						{cartQuantity}
					</Text>
				</View>
			}
		</View>
	);
}

export default CartBottomIcon;
