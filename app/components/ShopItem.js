import React from "react";
import tw from "twrnc";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

function ShopItem(props) {
	return (
		<TouchableOpacity
			activeOpacity={1}
			onPress={() => props.navigation.navigate('StoreDetail', {name: props.item.niceName})}
			style={tw`border border-gray-100 ${props.grid ? 'h-52' : 'h-52 w-64'} relative bg-white mr-2`}
		>
			<View>
				{props.item.coverImage ?
					<Image source={{uri: props.item.coverImage}} style={[tw`w-full h-32`, { resizeMode: 'cover' }]} />
					:
					<Image
						source={require('../assets/images/default-shop-cover.png')}
						resizeMode='stretch'
						style={[tw`w-full h-32`, { resizeMode: 'cover' }]}
					/>
				}
				{props.item.avatar ?
					<Image
						source={{uri: props.item.avatar}}
						style={[tw`w-14 h-14 rounded-full absolute -bottom-5 left-5 border-2 border-white`, { resizeMode: 'cover' }]}
					/>
					:
					<Image
						source={require('../assets/images/shop-default-avatar.png')}
						resizeMode='stretch'
						style={[tw`w-14 h-14 rounded-full absolute -bottom-5 left-5 border-2 border-white`, { resizeMode: 'cover' }]}
					/>
				}
			</View>
			<View style={tw`p-2 mt-4`}>
				<Text  style={tw`font-medium`} numberOfLines={1} ellipsizeMode='tail'>{props.item.name}</Text>
				<Text style={tw`text-gray-500 text-xs`}>{props.item.products} sản phẩm</Text>
			</View>
		</TouchableOpacity>
	);
}

export default ShopItem;
