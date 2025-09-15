import React, { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import tw from "twrnc";
import ApiConfig from "app/config/api-config";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

function PostCategoryList(props) {
	
	return (
		<View style={tw`bg-white py-3`}>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
			>
				{props.category && props.category.length > 0 && props.category.map((item, index) => (
					<TouchableOpacity
						activeOpacity={1}
						style={tw`flex items-center content-center border-r border-gray-200 px-3`}
						onPress={() => props.navigation.navigate('PostCategory', {catId: item.id, catSlug: item.slug})}
					>
						<View>
							<Text  style={tw`text-center font-medium text-gray-600`}>{item.name}</Text>
						</View>
					</TouchableOpacity>
				))}
			</ScrollView>
		</View>
	);
}

export default PostCategoryList;
