import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import apiConfig from "app/config/api-config";

function UserAvatar(props) {
	const currentUser = props.currentUser;
	return (
		<TouchableOpacity
			onPress={() => props.navigation.navigate(!currentUser ? 'Login' : 'Account')}
		>
			{currentUser ?
				currentUser && currentUser.avatar ?
					<Image source={{uri: currentUser.avatar}}
				       style={tw`w-8 h-8 rounded-full border-2 border-white`} />
					:
					<Image source={require('../../../assets/images/logo.png')}
					       style={tw`w-8 h-8 rounded-full border-2 border-white`} />
				:
				<Icon name={"account-circle"} size={28} style={tw`text-white`} />
			}
			
		</TouchableOpacity>
	);
}

export default UserAvatar;
