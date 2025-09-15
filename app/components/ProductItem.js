import React from "react";
import tw from "twrnc";
import { Image, Text, TouchableOpacity, View } from "react-native";
import ApiConfig from "app/config/api-config";
import { formatVND } from "app/utils/helper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons.js";

function ProductItem(props) {
	const prices = props.item.prices;
	return (
		<TouchableOpacity
			activeOpacity={1}
			onPress={() => props.navigation.navigate('ProductDetail', {slug: props.item.productSlug, shopId: props.item.shop && props.item.shop.id})}
			style={tw`border border-gray-100 h-64 relative bg-white`}
		>
			<View>
				<Image source={{uri: props.item.image}} style={tw`${props.list ? 'h-32' : 'h-40'} w-full`} resizeMode={"contain"}/>
			</View>
			<View style={tw`p-2 border-t border-gray-100`}>
				<Text  style={tw`font-medium`} numberOfLines={2} ellipsizeMode='tail'>{props.item.productName}</Text>
			</View>
			<View style={tw`absolute bottom-2 left-2`}>
				{props.item && props.item.inStock > 0 ?
						<View>
							<Text style={tw`${Number(props.item.totalDiscountPercent) > 0 ? 'font-thin text-gray-500 line-through text-xs' : 'font-medium text-red-500'}`}>
								{formatVND(props.item.price)}
							</Text>
							{props.item && props.item.totalDiscountPercent > 0 &&
								<Text style={tw`text-red-500 font-medium`}>{formatVND(Number(props.item.salePrice))}</Text>
							}
						</View>
						:
						<View>
							<Text  style={tw`text-red-600 font-medium`}>Liên hệ</Text>
						</View>
				}
			</View>
			{props.item && props.item.totalDiscountPercent > 0 &&
				<View style={tw`absolute top-2 right-2`}>
					<View style={tw`bg-red-500 py-1 px-2 rounded`}>
						<Text style={tw`text-white text-xs`}>{props.item.totalDiscountPercent}%</Text>
					</View>
				</View>
			}
		</TouchableOpacity>
	);
}

export default ProductItem;
