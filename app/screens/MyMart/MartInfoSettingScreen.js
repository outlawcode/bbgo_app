import React, { useEffect, useRef, useState } from "react";
import { Button, Image, Keyboard, Platform, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
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
import { launchImageLibrary } from "react-native-image-picker";
import { useIsFocused } from "@react-navigation/native";

function MartInfoSettingScreen(props) {
	const isFocused = useIsFocused();
	const dispatch = useDispatch()
	const currentUser = useSelector(state => state.memberAuth.user);
	const [result, setResult] = useState()

	useEffect(() => {
		props.navigation.setOptions({
			title: 'Cài đặt siêu thị',
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

	useEffect(() => {
		async function getMartInfo() {
			const token = await AsyncStorage.getItem('sme_user_token');
			axios({
				method: 'get',
				url: `${apiConfig.BASE_URL}/member/htm-mart/info`,
				headers: {Authorization: `Bearer ${token}`}
			}).then(function(response) {
				if(response.status === 200) {
					setResult(response.data)
				}
			}).catch((function(error) {
				console.log(error);
			}))
		}
		getMartInfo()
	}, [isFocused]);


	const settingValidationSchema = yup.object().shape({
		name: yup
			.string()
			.required('Vui lòng nhập tên'),
	})

	async function handleUpdate(values) {
		const token = await AsyncStorage.getItem('sme_user_token');
		return axios({
			method: 'put',
			url: `${apiConfig.BASE_URL}/member/htm-mart/update`,
			data: {
				...values
			},
			headers: {Authorization: `Bearer ${token}`}
		}).then(function (res) {
			showMessage({
				message: 'Cập nhật thành công!',
				type: 'success',
				icon: 'success',
				duration: 3000,
			});
		}).catch(function(error){
			showMessage({
				message: error.response.data.message,
				type: 'danger',
				icon: 'danger',
				duration: 3000,
			});
			console.log(error);
		})
	}

	let initialValues = {}
	if (result && result.martInfo) {
		initialValues = {
			name: result.martInfo.name,
			phone: result.martInfo.phone,
			address: result.martInfo.address,
		}
	}

	return (
		<View style={tw`flex bg-white p-2 h-full`}>
			<StatusBar barStyle={"dark-content"}/>
			<ScrollView
				showsVerticalScrollIndicator={false}
				scrollEnabled={true}
			>
				<Formik
					initialValues={initialValues}
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
								defaultValue={initialValues && initialValues.name}
								name="name"
								label="Tên siêu thị"
							/>
							<Field
								component={CustomInput}
								defaultValue={initialValues && initialValues.phone}
								name="phone"
								label="Số điện thoại"
								keyboardType={'phone-pad'}
							/>
							<Field
								component={CustomInput}
								defaultValue={initialValues && initialValues.address}
								name="address"
								label="Địa chỉ"
							/>
							<TouchableOpacity
								onPress={handleSubmit}
								style={tw`bg-green-600 p-4 rounded`}
								//disabled={!isValid}
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

export default MartInfoSettingScreen;
