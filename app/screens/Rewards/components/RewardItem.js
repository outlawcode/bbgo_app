import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import tw from "twrnc";
import { TransactionType } from "app/models/commons/transaction.model";
import { formatDateTime, formatVND } from "app/utils/helper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import moment from "moment";

function RewardItem(props) {
	return (
		<View style={tw`py-3 border-b border-gray-200`}>
			<View
				style={tw`flex flex-row items-center justify-between`}
			>
				<View>
					<View style={tw`flex flex-row items-center mb-1`}>
						<Icon name={"check-circle-outline"} style={tw`text-green-600`} size={18}/>
						<Text style={tw`font-medium text-gray-800 ml-1`}>
							Thưởng tháng {moment(props.item.startDate).format("MM/YYYY")} <Text style={tw`text-red-500`}>({props.item.percent}%)</Text>
						</Text>
					</View>
					<View>
						<Text  >Doanh số: <Text style={tw`font-medium`}>{formatVND(props.item.sales)}</Text></Text>
						{/*<Text  >+ {props.item.percent}% vào Ví tiền thưởng</Text>*/}
					</View>
					<Text style={tw`text-xs text-gray-500`}>{formatDateTime(props.item.createdAt)}</Text>
				</View>
				<Text style={tw`text-green-600 text-base`}>
					<Text  >+</Text> {formatVND(props.item.amount)}
				</Text>
			</View>
		</View>
	);
}

export default RewardItem;
