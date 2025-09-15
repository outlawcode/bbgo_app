import React from "react";
import {Image, Text, TouchableOpacity, View} from "react-native";
import tw from "twrnc";
import {formatDateTime, formatVND} from "app/utils/helper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

function OrderItem(props) {
	const order = props.item
	let parsed;
	try {
		parsed = order && order.priceDetails ? JSON.parse(order.priceDetails) : [];
	} catch (e) {
		parsed = [];
	}
	// Normalize to an array list of line items
	const lineItems = Array.isArray(parsed) ? parsed : (parsed && parsed.priceDetail ? parsed.priceDetail : []);

	return (
		<TouchableOpacity
			onPress={() => props.navigation.navigate('OrderDetail', {id: order.id})}
			style={tw`bg-white my-1 p-3`}
		>
			<View style={tw`flex flex-row items-center justify-between pb-2 mb-2 border-b border-gray-100`}>
				<Text  style={tw`text-gray-500`}>
					Mã đơn hàng: <Text style={tw`font-bold text-gray-800`}>#{order.id}</Text>
				</Text>
				<Text>{order.status}</Text>
			</View>

			{lineItems && lineItems.slice(0,1).map((el, index) => (
				<View key={index} style={tw`flex flex-row mb-2`}>
					{el?.product?.featureImage ? (
						<Image source={{ uri: el.product.featureImage }} style={tw`w-12 h-12 object-cover mr-3 rounded`} />
					) : null}
					<View>
						<View>
							<Text style={tw`font-medium`}>{el?.product?.name || el?.name || 'Sản phẩm'}</Text>
						</View>
						{el?.name ? (
							<View>
								<Text style={tw`text-xs text-gray-500`}>Phân loại hàng: {el.name}</Text>
							</View>
						) : null}
						<View>
							<Text style={tw`text-xs text-gray-500`}>x{el?.quantity || 1}</Text>
						</View>
					</View>
				</View>
			))}
			{lineItems && lineItems.length > 1 && (
				<View style={tw`py-2 border-b border-t border-gray-100 mb-2`}>
					<Text style={tw`text-center text-gray-500`}>{lineItems.length} sản phẩm</Text>
				</View>
			)}

			<View style={tw`mb-2`}>
				<Text>
					Ngày tạo: <Text style={tw`text-gray-600`}>{formatDateTime(order.createdAt)}</Text>
				</Text>
			</View>
			<View style={tw`mb-2 justify-between pb-2 border-b border-gray-100`}>
				<Text>
					Phương thức thanh toán: <Text style={tw`font-medium text-gray-500`}>{order.paymentMethod}</Text>
				</Text>
			</View>
			<View style={tw`flex flex-row items-center justify-between`}>
				<Text>
					Tổng tiền: <Text style={tw`font-bold text-red-500`}>{formatVND(order.amount)}</Text>
				</Text>
				<View style={tw`flex flex-row items-center`}>
					<Text  style={tw`text-green-600`}>Chi tiết</Text>
					<Icon name={"chevron-right"} size={18} style={tw`text-green-600`} />
				</View>
			</View>
		</TouchableOpacity>
	);
}

export default OrderItem;
