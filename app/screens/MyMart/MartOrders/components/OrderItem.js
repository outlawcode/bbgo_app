import React, { useRef } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import tw from "twrnc";
import { formatDateTime, formatVND } from "app/utils/helper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { PaymentMethod } from "app/models/commons/order.model";
import defaultImage from "app/assets/images/default-food.png";

function OrderItem(props) {
	const item = props.item;
	const items = JSON.parse(item.priceDetails);
	const receiver = item.receiver ? JSON.parse(item.receiver) : null;

	return (
		<TouchableOpacity
			onPress={() => props.navigation.navigate('MartOrderDetail', {id: item.id})}
			style={tw`bg-white my-1 p-3 border border-gray-200`}
		>
			{/* Header with order ID and status */}
			<View style={tw`flex flex-row items-center justify-between pb-3 mb-3 border-b border-gray-100`}>
				<Text style={tw`text-gray-500`}>
					Đơn hàng <Text style={tw`font-medium text-red-500`}>#{item.id}</Text>
				</Text>
				<View style={tw`flex flex-row items-center`}>
					<Text style={tw`bg-blue-50 px-2 py-1 rounded text-xs mr-2`}>{item.status}</Text>
					{item.process && (
						<Text style={tw`bg-red-50 px-2 py-1 rounded text-xs`}>{item.process}</Text>
					)}
				</View>
			</View>

			{/* Show restaurant info for service type orders */}
			{item.type === 'Dịch vụ' ? (
				<View>
					{items.restaurant && (
						<TouchableOpacity
							onPress={() => props.navigation.navigate('RestaurantDetail', {id: items.restaurant.id})}
							style={tw`bg-blue-50 border border-blue-200 p-3 rounded mb-3`}
						>
							<View style={tw`flex flex-row items-center`}>
								<Icon name="storefront-outline" size={28} style={tw`text-gray-400 mr-2`} />
								<View>
									<Text style={tw`font-medium text-blue-500`}>{items.restaurant.name}</Text>
									<View style={tw`flex flex-row items-center`}>
										<Icon name="map-marker" size={12} style={tw`text-gray-500 mr-1`} />
										<Text style={tw`text-xs text-gray-500 italic`}>{items.restaurant.address}</Text>
									</View>
								</View>
							</View>
						</TouchableOpacity>
					)}

					{/* Service items */}
					{items.priceDetail && items.priceDetail.map((el, index) => (
						<View key={index} style={tw`mb-3 pb-3 border-b border-gray-100 flex flex-row justify-between`}>
							<View style={tw`flex flex-row`}>
								<Image
									source={el.serviceImage ? {uri: el.serviceImage} : defaultImage}
									style={tw`w-16 h-16 object-cover mr-3`}
								/>
								<View>
									<Text style={tw`font-medium text-gray-600`}>{el.serviceName}</Text>
									<Text>x{el.quantity}</Text>
								</View>
							</View>
							<View>
								<Text style={tw`text-red-500`}>{formatVND(Number(el.price)*Number(el.quantity))}</Text>
							</View>
						</View>
					))}
				</View>
			) : (
				/* Product items */
				<View>
					{items && items.priceDetail.map((el, index) => (
						<View key={index} style={tw`mb-3 pb-3 border-b border-gray-100 flex flex-row justify-between`}>
							<View style={tw`flex flex-row`}>
								<Image
									source={{uri: el.product.featureImage}}
									style={tw`w-16 h-16 object-cover mr-3`}
								/>
								<View>
									<Text style={tw`font-medium text-gray-600`}>{el.product.name}</Text>
									<Text style={tw`text-gray-400 text-xs`}>Phân loại hàng: {el.name}</Text>
									<Text>x{el.quantity}</Text>
								</View>
							</View>
							<View>
								{el.discount > 0 && (
									<Text style={tw`text-xs text-gray-400 line-through`}>{formatVND(el.subTotal)}</Text>
								)}
								<Text style={tw`text-red-500`}>{formatVND(el.price)}</Text>
							</View>
						</View>
					))}
				</View>
			)}

			{/* Footer with payment method and total amount */}
			<View style={tw`flex flex-row items-center justify-between`}>
				<Text style={tw`text-purple-500 text-xs font-medium`}>
					{item.paymentMethod ?
						PaymentMethod.find(el => el.code === item.paymentMethod)?.name :
						item.paymentMethod
					}
				</Text>
				<Text>
					Tổng số tiền: <Text style={tw`font-medium text-lg text-red-500`}>{formatVND(item.amount)}</Text>
				</Text>
			</View>
		</TouchableOpacity>
	);
}

export default OrderItem;
