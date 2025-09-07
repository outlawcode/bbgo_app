import React, { useEffect, useRef, useState } from "react";
import { Image, Keyboard, Platform, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import CartIcon from "app/screens/Cart/components/cartIcon";
import { useDispatch, useSelector } from "react-redux";
import * as ImagePicker from "react-native-image-picker"
import ActionSheet from 'react-native-actionsheet';
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import * as yup from 'yup';
import apiConfig from "app/config/api-config";
import { showMessage } from "react-native-flash-message";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Field, Formik } from "formik";
import CustomInput from "app/components/CustomInput";
import { updateAccount } from "app/screens/Auth/action";

function PasswordSettingScreen(props) {
	const dispatch = useDispatch()
	const currentUser = useSelector(state => state.memberAuth.user);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		props.navigation.setOptions({
			title: 'Đổi mật khẩu',
			headerStyle: {
				backgroundColor: '#fff',
			},
			headerTintColor: '#000',
			headerLeft: () => (
				<TouchableOpacity
					activeOpacity={1}
					onPress={() => props.navigation.goBack()}>
					<Icon name="chevron-left"
					      size={26}
					      style={tw`ml-3`}
					/>
				</TouchableOpacity>
			),
		})
	}, [])

	const settingValidationSchema = yup.object().shape({
		password: yup
			.string()
			.min(6, ({ min }) => `Mật khẩu có ít nhất ${min} ký tự`),
	})

	function handleUpdate(values) {
		Keyboard.dismiss();
		dispatch(updateAccount( {
			password: values.password,
		}))
	}

	return (
		<View style={tw`flex bg-white p-2 h-full`}>
			<StatusBar barStyle={"dark-content"}/>
			<ScrollView
				showsVerticalScrollIndicator={false}
				scrollEnabled={true}
			>
				<Formik
					initialValues={{
					}}
					onSubmit={values => handleUpdate(values)}
					validationSchema={settingValidationSchema}
				>
					{({ handleSubmit, isValid }) => (
						<View style={tw`mx-3`}>
							<Field
								component={CustomInput}
								name="password"
								label="Mật khẩu mới"
								secureTextEntry
							/>
							<TouchableOpacity
								onPress={handleSubmit}
								style={tw`${!isValid ? 'bg-gray-300' : 'bg-green-600'} p-4 rounded`}
								disabled={!isValid}
							>
								<Text  style={tw`text-white text-center font-medium uppercase`}>Lưu thay đổi</Text>
							</TouchableOpacity>
						</View>
					)}
				</Formik>
			</ScrollView>
		</View>
	);
}

export default PasswordSettingScreen;
