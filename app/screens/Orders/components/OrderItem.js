import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import OrderList from "app/screens/Orders/OrderList";
import tw from "twrnc";
import { formatDateTime, formatVND } from "app/utils/helper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { PaymentMethod } from "app/models/commons/order.model";

function OrderItem(props) {
	const order = props.item
	const items = JSON.parse(order.priceDetails);

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
			{order.type === 'Dịch vụ' ?
				<View>
					<View style={tw`mb-2`}>
						<View style={tw`my-2 p-2 bg-blue-100 border border-blue-300 rounded`}>
							<Text style={tw`text-green-600 text-base font-medium`}>
								<Icon name={"shield-check"} size={18} style={tw`mr-2 text-yellow-500`} /> {items.restaurant && items.restaurant.name}</Text>
							<View>
								<Text style={tw`text-xs text-gray-500`} numberOfLines={1}>{items.restaurant && items.restaurant.address}</Text>
							</View>
						</View>
					</View>
					{items && items.priceDetail.slice(0,1).map((el, index) => (
						<View style={tw`flex flex-row mb-2`}>
							<Image source={{ uri: el.serviceImage }} style={tw`w-12 h-12 object-cover mr-3 rounded`} />
							<View>
								<View>
									<Text style={tw`font-medium`}>{el.serviceName}</Text>
								</View>
								<View>
									<Text style={tw`text-xs text-gray-500`}>x{el.quantity}</Text>
								</View>
							</View>
						</View>
					))}
					{items && items.priceDetail.length > 1 &&
						<View style={tw`py-2 border-b border-t border-gray-100 mb-2`}>
							<Text style={tw`text-center text-gray-500`}>{items.priceDetail.length} sản phẩm</Text>
						</View>
					}
				</View>
				:
				<>
					{items && items.priceDetail.slice(0,1).map((el, index) => (
						<View style={tw`flex flex-row mb-2`}>
							<Image source={{ uri: el.product.featureImage }} style={tw`w-12 h-12 object-cover mr-3 rounded`} />
							<View>
								<View>
									<Text style={tw`font-medium`}>{el.product.name}</Text>
								</View>
								<View>
									<Text style={tw`text-xs text-gray-500`}>Phân loại hàng: {el.name}</Text>
								</View>
								<View>
									<Text style={tw`text-xs text-gray-500`}>x{el.quantity}</Text>
								</View>
							</View>
						</View>
					))}
					{items && items.priceDetail.length > 1 &&
						<View style={tw`py-2 border-b border-t border-gray-100 mb-2`}>
							<Text style={tw`text-center text-gray-500`}>{items.priceDetail.length} sản phẩm</Text>
						</View>
					}
				</>
			}

			<View style={tw`mb-2`}>
				<Text>
					Ngày tạo: <Text style={tw`text-gray-600`}>{formatDateTime(order.createdAt)}</Text>
				</Text>
			</View>
			<View style={tw`mb-2 justify-between pb-2 border-b border-gray-100`}>
				<Text>
					Phương thức thanh toán: <Text style={tw`font-medium text-gray-500`}>{PaymentMethod.map(el => el.code === order.paymentMethod && el.name)}</Text>
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
