import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import tw from "twrnc";
import ApiConfig from "app/config/api-config";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

function CategoryHorizontalList(props) {
	return (
		<ScrollView
			overScrollMode="never"
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={tw`px-4 pt-2`}
		>
			{props.category && props.category.length > 0 && props.category.map((item, index) => (
				<TouchableOpacity
					key={index}
					activeOpacity={0.7}
					style={tw`items-center mr-4`}
					onPress={() => props.navigation.navigate('ProductCategory', {catId: item.id, catSlug: item.slug})}
				>
					<View style={tw`rounded-full bg-white border border-gray-100 shadow-sm p-1 mb-2`}>
						<View style={tw`rounded-full bg-green-50 p-1 overflow-hidden`}>
							{item.featureImage ?
								<Image
									source={{ uri: item.featureImage }}
									style={tw`w-14 h-14 rounded-full`}
									resizeMode="cover"
								/>
								: <View style={tw`w-14 h-14 rounded-full items-center justify-center bg-green-100`}>
									<Icon name="package-variant" size={24} style={tw`text-green-700`} />
								</View>
							}
						</View>
					</View>
					<View style={tw`w-20`}>
						<Text 
							style={[tw`text-center font-medium text-gray-700`, { fontSize: 10, lineHeight: 12 }]}
							numberOfLines={2}
							ellipsizeMode="tail"
						>
							{item.name}
						</Text>
					</View>
				</TouchableOpacity>
			))}
		</ScrollView>
	);
}

export default CategoryHorizontalList;
