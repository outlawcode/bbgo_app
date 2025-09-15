import React from "react";
import tw from "twrnc";
import { Image, Text, TouchableOpacity, View } from "react-native";
import ApiConfig from "app/config/api-config";
import { formatVND } from "app/utils/helper";

function ProjectItem(props) {
	const item = props.item;
	const prices = props.item.prices;
	let listIRates = []
	let maxIRate = 0;
	if(prices && prices.length > 0) {
		listIRates = prices.map((el) => Number(el.interestedRate));
		listIRates.sort()
		maxIRate = listIRates[listIRates.length-1];
	}
	return (
		<TouchableOpacity
			activeOpacity={1}
			onPress={() => props.navigation.navigate('ProjectDetail', {slug: props.item.slug})}
			style={tw`border border-gray-100 h-60 relative bg-white`}
		>
			<View>
				<Image source={{uri: props.item.featureImage}} style={tw`h-32 w-full`} />
			</View>
			<View style={tw`p-2 border-t border-gray-100`}>
				<Text  style={tw`font-medium`} numberOfLines={2} ellipsizeMode='tail'>{props.item.name}</Text>
			</View>
			
			<View style={tw`p-2 border-t border-gray-100`}>
				<Text style={tw`mb-1 text-xs`}>Tổng đầu tư: <Text style={tw`text-orange-400 font-bold`}>{props.item.totalInvestment}</Text></Text>
				<View style={tw`flex items-center justify-between flex-row `}>
					{maxIRate > 0 &&
						<View style={tw`bg-red-600 px-2 py-1 rounded flex items-center`}>
							<Text style={tw`text-white text-xs`}>LN Kỳ vọng</Text>
							<Text style={tw`text-white font-bold`}>{maxIRate}%</Text>
						</View>
					}
					{item.chietkhauPercent > 0 &&
						<View style={tw`bg-green-600 px-2 py-1 rounded flex items-center`}>
							<Text style={tw`text-white text-xs`}>CK</Text>
							<Text style={tw`text-white font-bold`}>{item.chietkhauPercent}%</Text>
						</View>
					}
				</View>
				
			</View>
			
		</TouchableOpacity>
	);
}

export default ProjectItem;
