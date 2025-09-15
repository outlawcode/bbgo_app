import React from "react";
import tw from "twrnc";
import { Image, Text, TouchableOpacity, View } from "react-native";
import ApiConfig from "app/config/api-config";
import { formatVND } from "app/utils/helper";

function NewsItem(props) {
	return (
		<TouchableOpacity
			activeOpacity={1}
			onPress={() => props.navigation.navigate('PostDetail', {slug: props.item.slug})}
			style={tw`${props.horizontal && 'mx-3 w-48'}`}
		>
			<View>
				<Image
					source={{uri: props.item.featureImage}}
					style={[tw`w-full h-32 rounded-md`, {resizeMode: 'cover'}]}
				/>
			</View>
			<View style={tw`p-2 border-t border-gray-100`}>
				<Text style={tw`font-medium text-gray-600`} numberOfLines={2} ellipsizeMode='tail'>{props.item.title}</Text>
			</View>
		</TouchableOpacity>
	);
}

export default NewsItem;
