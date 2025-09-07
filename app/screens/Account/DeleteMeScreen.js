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
import { memberLogout, updateAccount } from "app/screens/Auth/action";
import * as Yup from "yup";

function DeleteMeScreen(props) {
	const dispatch = useDispatch()
	const currentUser = useSelector(state => state.memberAuth.user);
	const [loading, setLoading] = useState(true);
	const [accepted, setAccepted] = useState(false);
	
	useEffect(() => {
		props.navigation.setOptions({
			title: 'Đóng tài khoản',
			headerStyle: {
				backgroundColor: '#b2002a',
			},
			headerTintColor: '#fff',
			headerLeft: () => (
				<TouchableOpacity
					activeOpacity={1}
					onPress={() => props.navigation.goBack()}>
					<Icon name="chevron-left"
					      size={26}
					      style={tw`ml-3 text-white`}
					/>
				</TouchableOpacity>
			),
		})
	}, [])
	
	const settingValidationSchema = yup.object().shape({
		confirmWord: Yup
			.string()
			.required('Vui lòng nhập mã xác nhận'),
	})
	
	async function handleUpdate(values) {
		Keyboard.dismiss();
		if (!accepted) {
			showMessage({
				message: 'Vui lòng chọn vào ô xác nhận!',
				type: 'danger',
				icon: 'danger',
				duration: 3000,
			});
			return;
		} else {
			const token = await AsyncStorage.getItem('sme_user_token');
			axios.post(apiConfig.BASE_URL+'/user/delete', {
					confirmWord: values.confirmWord
				},
				{headers: {Authorization: `Bearer ${token}`}})
				.then((response) => {
					showMessage({
						message: 'Hệ thống đã đóng tài khoản của bạn!',
						type: 'success',
						icon: 'success',
						duration: 3000,
					});
					dispatch(memberLogout(props.navigation))
					// logout here
					//props.navigation.navigate('TransactionDetail', {id: response.data.id})
				}).catch(error => {
				showMessage({
					message: error.response.data.message,
					type: 'danger',
					icon: 'danger',
					duration: 3000,
				});
			})
		}
		
	}
	
	return (
		<View style={tw`flex bg-white p-2 h-full`}>
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
						<View style={tw`mx-3 my-3`}>
							<Text style={tw`mb-3`}>Vui lòng nhập <Text style={tw`text-red-600 font-medium`}>DELETE</Text> vào ô bên dưới</Text>
							<Field
								component={CustomInput}
								name="confirmWord"
								required
								label="Xác nhận"
							/>
							<View style={tw`mb-5`}>
								<TouchableOpacity
									style={tw`flex flex-row`}
									onPress={() => {
										setAccepted(!accepted)
									}}
								>
									<Icon name={accepted ? 'checkbox-marked' : 'checkbox-blank-outline'} size={22} style={tw`mr-1`}/>
									<Text>Tôi hiểu rằng khi nhấn nút Đóng tài khoản thì tôi không thể truy cập vào bằng tài khoản cũ nữa.</Text>
								</TouchableOpacity>
							</View>
							<TouchableOpacity
								onPress={handleSubmit}
								style={tw`${!isValid ? 'bg-gray-300' : 'bg-red-600'} p-3 rounded flex items-center`}
								disabled={!isValid}
							>
								<View style={tw`flex items-center flex-row`}>
									<Icon name={"lock"} style={tw`text-white -mt-1 mr-2`} size={18}/>
									<Text  style={tw`text-white font-medium uppercase`}>Đóng tài khoản</Text>
								</View>
							</TouchableOpacity>
						</View>
					)}
				</Formik>
			</ScrollView>
		</View>
	);
}

export default DeleteMeScreen;
