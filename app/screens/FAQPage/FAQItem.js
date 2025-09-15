import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import DynamicWebView from "app/components/DynamicWebView";

function FaqItem(props) {
	const [open, setOpen] = useState(props.index === 0)
	return (
		<View
			style={tw`mb-3 rounded bg-white border border-gray-200 p-3 ${open && 'border-blue-500'}`}
		>
			<TouchableOpacity
				style={tw`flex flex-row items-center justify-between`}
				onPress={() => setOpen(!open)}
			>
				<Text style={tw`font-bold text-gray-600`}>{props.index + 1}. {props.item.ask}</Text>
				<Icon name={open ? 'chevron-up' : 'chevron-down'} />
			</TouchableOpacity>
			{open &&
				<DynamicWebView
					style={tw`w-full h-full`}
					source={{
						html: `<head>
									<meta name="viewport" content="width=device-width, initial-scale=1">
									<title></title>
									</head>
									<body>${props.item.answer}</body>`,
					}}
				/>
			}
		</View>
	);
}

export default FaqItem;