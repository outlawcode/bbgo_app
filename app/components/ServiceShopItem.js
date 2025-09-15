import React from "react";
import tw from "twrnc";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

function ServiceShopItem(props) {
	return (
		<TouchableOpacity
			activeOpacity={1}
			onPress={() => props.navigation.navigate('RestaurantDetails', {
				id: props.item.id
			})}
			style={tw`border border-gray-100 ${props.grid ? 'h-52' : 'h-52 w-64'} relative bg-white mr-2`}
		>
			<View>
				{props.item.image ?
					<Image source={{uri: props.item.image}} style={[tw`w-full h-32`, { resizeMode: 'cover' }]} />
					:
					<Image
						source={require('../assets/images/default-food.png')}
						resizeMode='stretch'
						style={[tw`w-full h-32`, { resizeMode: 'cover' }]}
					/>
				}
			</View>
			<View style={tw`p-2 mt-4`}>
				<Text  style={tw`font-medium`} numberOfLines={1} ellipsizeMode='tail'>{props.item.name}</Text>
				{props.item.address &&
					<View style={tw`flex flex-row items-center`}>
						<Icon name={"map-marker"} style={tw`text-gray-500 mr-1`} />
						<Text style={tw`text-gray-500 text-xs`} numberOfLines={1}
						      ellipsizeMode='tail'>{props.item.address}</Text>
					</View>
				}
			</View>
		</TouchableOpacity>
	);
}

export default ServiceShopItem;
