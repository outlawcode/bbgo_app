import React, {useRef} from "react";
import tw from "twrnc";
import {Image, ScrollView, Text, TouchableOpacity, View} from "react-native";
import { formatVND } from "app/utils/helper";
import BottomSheet from 'react-native-gesture-bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

function FoodItem(props) {
	const {item} = props;
	const bottomSheetInfo = useRef();

	console.log(item);

	return (
		<>
			<TouchableOpacity
				onPress={() => {
					item.serviceAddress.length > 1 ?
						bottomSheetInfo.current.show()
						:
						props.navigation.navigate('RestaurantDetails', {
							id: item.serviceAddress[0].id,
							cart: [{
								quantity: 1,
								serviceId: item.id,
								price: item.price,
								serviceName: item.name,
								serviceImage: item.image,
							}]
						})
				}}
				activeOpacity={1}
				style={tw`border border-gray-100 h-60 relative bg-white`}
			>
				<View>
					{item.image ?
						<Image source={{uri: item.image}} style={tw`h-40 w-full`}/>
						:
						<Image source={require('../assets/images/default-food.png')} style={tw`h-40 w-full`}/>
					}
				</View>
				<View style={tw`p-2 border-t border-gray-100`}>
					<Text style={tw`font-medium`} numberOfLines={2} ellipsizeMode='tail'>{item.name}</Text>
				</View>
				<View style={tw`absolute bottom-2 left-2`}>
					<Text style={tw`text-red-600 font-medium`}>{formatVND(item.price)}</Text>
				</View>
			</TouchableOpacity>
			<BottomSheet ref={bottomSheetInfo} height={400}>
				<View style={tw`bg-white h-full`}>
					<View style={tw`m-3 flex items-center flex-row justify-between`}>
						<Text style={tw`font-bold`}>Chọn Cửa hàng</Text>
						<TouchableOpacity
							onPress={() => bottomSheetInfo.current.close()}
						>
							<Icon name={"close-circle"} size={28} />
						</TouchableOpacity>
					</View>
					<ScrollView>
						<View
							style={tw`px-3 pb-5`}
						>
							{
								item.serviceAddress.map((el) => (
									<TouchableOpacity
										onPress={() => {
											props.navigation.navigate('RestaurantDetails', {
												id: el.id,
												cart: [{
													quantity: 1,
													serviceId: item.id,
													price: item.price,
													serviceName: item.name,
													serviceImage: item.image,
												}]
											})
											bottomSheetInfo.current.close()
										}}
										activeOpacity={1}
									>
										<View style={tw`my-2 p-2 bg-blue-100 border border-blue-300 rounded`}>
											<Text style={tw`text-green-600 text-base font-medium`}>
												<Icon name={"shield-check"} size={18} style={tw`mr-2 text-yellow-500`} /> {el.name}</Text>
											<View>
												<Text style={tw`text-xs text-gray-500`} numberOfLines={1}>{el.address}</Text>
											</View>
										</View>
									</TouchableOpacity>
								))
							}
						</View>
					</ScrollView>
				</View>

			</BottomSheet>
		</>

	);
}

export default FoodItem;
