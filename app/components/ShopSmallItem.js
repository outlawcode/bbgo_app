import React from "react";
import tw from "twrnc";
import { Image, Text, TouchableOpacity, View } from "react-native";

function ShopSmallItem(props) {
	return (
		<View style={tw`bg-white mb-3 p-3`}>
			<View style={tw`flex flex-row items-center justify-between`}>
				<View style={tw`flex flex-row justify-between`}>
					<View style={tw`flex flex-row`}>
						{props.shop.avatar ?
							<Image
								source={{uri: props.shop.avatar}}
								style={[tw`w-14 h-14 rounded-full`, { resizeMode: 'cover' }]}
							/>
							:
							<Image
								source={require('../assets/images/shop-default-avatar.png')}
								resizeMode='stretch'
								style={[tw`w-14 h-14 rounded-full`, { resizeMode: 'cover' }]}
							/>
						}
						<View style={tw`ml-2 w-3/5`}>
							<Text numberOfLines={1} ellipsizeMode={"tail"}>{props.shop.name}</Text>
							<Text style={tw`text-gray-500 text-xs`} numberOfLines={2}
									      ellipsizeMode='tail'>{props.shop.address}</Text>
						</View>
					</View>

				</View>
				<View>
					<TouchableOpacity
						onPress={() => props.navigation.navigate('StoreDetail', {name: props.shop.niceName})}
						style={tw`border border-red-600 px-2 py-1`}
					>
						<Text style={tw`text-red-600`}>Xem Shop</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}

export default ShopSmallItem;
