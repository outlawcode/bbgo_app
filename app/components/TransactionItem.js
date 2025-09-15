import React from "react";
import tw from "twrnc";
import { Text, TouchableOpacity, View } from "react-native";
import { TransactionType } from "app/models/commons/transaction.model";
import { formatDateTime, formatVND } from "app/utils/helper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

function TransactionItem(props) {
	return (
		<View style={tw`py-3 border-b border-gray-200`}>
			<TouchableOpacity
				style={tw`flex flex-row items-center justify-between`}
				onPress={() => props.navigation.navigate('TransactionDetail', {id: props.item.id})}
			>
				<View>
					<View style={tw`flex flex-row items-center mb-1`}>
						<Text  style={tw`font-medium text-gray-800 text-base`}>{props.item.type}</Text>
					</View>
					<View style={tw`flex flex-row items-center mb-1`}>
						<Text  style={tw`font-medium text-gray-500 text-xs`}>{props.item.status}</Text>
					</View>
					<Text  style={tw`text-xs text-gray-500`}>{formatDateTime(props.item.createdAt)}</Text>
				</View>
				<Text  style={tw`${props.item.kind === 'IN' ? 'text-green-600' : 'text-red-600'} text-base`}>
					<Text>{props.item.kind === 'IN' ? '+' : '-'}</Text> {formatVND(props.item.amount)}
				</Text>
			</TouchableOpacity>
		</View>
	);
}

export default TransactionItem;
