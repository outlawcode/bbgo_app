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

function SocialSettingScreen(props) {
	const dispatch = useDispatch()
	const currentUser = useSelector(state => state.memberAuth.user);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		props.navigation.setOptions({
			title: 'Cài đặt Mạng xã hội',
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

	})

	function handleUpdate(values) {
		Keyboard.dismiss();
		dispatch(updateAccount( {
			zalo: values.zalo,
			zaloGroup: values.zaloGroup,
			facebook: values.facebook,
			whatsapp: values.whatsapp,
			youtube: values.youtube
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
						zalo: currentUser && currentUser.zalo,
						zaloGroup: currentUser && currentUser.zaloGroup,
						facebook: currentUser && currentUser.facebook,
						whatsapp: currentUser && currentUser.whatsapp,
						youtube: currentUser && currentUser.youtube,
					}}
					onSubmit={values => handleUpdate(values)}
					validationSchema={settingValidationSchema}
				>
					{({ handleSubmit, isValid }) => (
						<KeyboardAwareScrollView
							showsVerticalScrollIndicator={false}
							scrollEnabled={true}
							style={tw`mx-3`}
						>
							<Field
								component={CustomInput}
								name="zalo"
								label="Số điện thoại Zalo"
								keyboardType={'numeric'}
							/>
							<Field
								component={CustomInput}
								name="whatsapp"
								label="Số điện thoại Whatsapp"
								keyboardType={'numeric'}
							/>
							<Field
								component={CustomInput}
								name="zaloGroup"
								label="Đường dẫn nhóm Zalo"
								//keyboardType={'email-address'}
							/>
							<Field
								component={CustomInput}
								name="facebook"
								label="Đường dẫn Facebook"
								multiline
							/>
							<Field
								component={CustomInput}
								name="youtube"
								label="Đường dẫn Youtube"
								multiline
							/>

							<TouchableOpacity
								onPress={handleSubmit}
								style={tw`${!isValid ? 'bg-gray-300' : 'bg-green-600'} p-4 rounded`}
								disabled={!isValid}
							>
								<Text  style={tw`text-white text-center font-medium uppercase`}>Lưu thay đổi</Text>
							</TouchableOpacity>
						</KeyboardAwareScrollView>
					)}
				</Formik>
			</ScrollView>
		</View>
	);
}

export default SocialSettingScreen;
