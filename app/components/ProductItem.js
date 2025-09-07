import React from "react";
import tw from "twrnc";
import {Image, Text, TouchableOpacity, View} from "react-native";
import {formatVND} from "app/utils/helper";

function ProductItem(props) {

	return (
		<TouchableOpacity
			activeOpacity={1}
			onPress={() => props.navigation.navigate('ProductDetail', {slug: props.item.slug})}
			style={tw`border border-cyan-100 rounded-md h-64 relative bg-cyan-50`}
		>
			<View style={tw`bg-white rounded-md`}>
				<Image source={{uri: props.item.featureImage}} style={tw`${props.list ? 'h-32' : 'h-40'} w-full`} resizeMode={"contain"}/>
			</View>
			<View style={tw`p-2`}>
				<Text  style={tw`font-medium text-gray-800`} numberOfLines={2} ellipsizeMode="tail">{props.item.name}</Text>
			</View>
			<View style={tw`absolute bottom-7 left-2`}>
				{props.item.availableStock !== undefined && props.item.availableStock > 0 && (
					<View>
						<Text style={tw`text-xs text-gray-400`}>
							Kho: <Text style={tw`text-cyan-600`}>{props.item.availableStock}</Text> {props.item.unitName}
						</Text>
					</View>
				)}
			</View>
			<View style={tw`absolute bottom-2 left-2`}>
				{props.item && props.item.availableStock !== undefined ?
						<View>
							<Text style={tw`${Number(props.item.discountPercent) > 0 ? 'font-thin text-gray-500 line-through text-xs' : 'font-medium text-orange-500'}`}>
								{formatVND(props.item.price)}
							</Text>
							{props.item && props.item.discountPercent > 0 &&
								<Text style={tw`text-orange-500 font-medium`}>{formatVND(Number(props.item.price) * (100 - Number(props.item.discountPercent)) / 100)}</Text>
							}
						</View>
						:
						<View>
							<Text  style={tw`text-orange-500 font-medium`}>Liên hệ</Text>
						</View>
				}
			</View>
			{props.item && props.item.discountPercent > 0 &&
				<View style={tw`absolute top-2 right-2`}>
					<View style={tw`bg-red-500 py-1 px-2 rounded`}>
						<Text style={tw`text-white text-xs`}>{props.item.discountPercent}%</Text>
					</View>
				</View>
			}
		</TouchableOpacity>
	);
}

export default ProductItem;
