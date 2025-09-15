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

function AccountSettingScreen(props) {
	const dispatch = useDispatch()
	const currentUser = useSelector(state => state.memberAuth.user);
	const [photo, setPhoto] = React.useState(null);
	const [avatar, setAvatar] = React.useState(null);

	const createFormData = (photo, body = {}) => {
		let data = new FormData();
		data.append('files', {
			name: photo.fileName,
			type: photo.type,
			uri: Platform.OS === 'ios' ? photo.uri && photo.uri.replace("file://", "") : photo.uri,
		});
		Object.keys(body).forEach((key) => {
			data.append(key, body[key]);
		});
		return data;
	};

	const handleChoosePhoto = () => {
		launchImageLibrary({ noData: true }, (response) => {
			if (response) {
				setPhoto(response);
			}
		});
	};

	async function handleUploadPhoto() {
		const Token = await AsyncStorage.getItem('sme_user_token');
		fetch(`${apiConfig.BASE_URL}/media/member/upload`, {
			method: 'POST',
			body: createFormData(photo, { userId: currentUser && currentUser.refId }),
			headers: {Authorization: `Bearer ${Token}`},
		})
			.then((response) => response.json())
			.then((response) => {
				console.log(response);
				showMessage({
					message: "Upload ảnh thành công, nhấn nút Lưu thay đổi",
					type: 'success',
					icon: 'success',
					duration: 2000,
				});
				setAvatar(apiConfig.BASE_URL+response[0].url);
			})
			.catch((error) => {
				console.log('error', error);
				showMessage({
					message: error.response.data.message,
					type: 'danger',
					icon: 'danger',
					duration: 2000,
				});
			});
	}

	useEffect(() => {
		props.navigation.setOptions({
			title: 'Cài đặt tài khoản',
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
		name: yup
			.string()
			.required('Vui lòng nhập tên'),
		phone: yup
			.string(() => 'Vui lòng nhập đúng số điện thoại')
			.max(10, ({max}) => 'Vui lòng nhập đúng số điện thoại')
			.min(10, ({max}) => 'Vui lòng nhập đúng số điện thoại')
			.required('Vui lòng nhập số điện thoại'),
		email: yup
			.string()
			.email(() => 'Vui lòng nhập đúng email')
			.required('Vui lòng nhập email'),
	})

	function handleUpdate(values) {
		Keyboard.dismiss();
		dispatch(updateAccount( {
			...values,
			avatar
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
						name: currentUser && currentUser.name,
						phone: currentUser && currentUser.phone,
						email: currentUser && currentUser.email,
						address: currentUser && currentUser.address,
						company: currentUser && currentUser.company,
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
							<View style={tw`flex justify-center items-center`}>
								<TouchableOpacity
									onPress={handleChoosePhoto}
								>
									<View style={tw`flex justify-center items-center`} >
										<Icon name="camera-outline" size={30} style={tw`absolute z-50 text-gray-100`} />
										<View style={tw`bg-black bg-opacity-20 h-20 w-20 absolute z-30 rounded-full`} />
										<Image source={{uri: currentUser.avatar}} style={tw`w-20 h-20 rounded-full object-cover`} />
									</View>
								</TouchableOpacity>
							</View>
							{photo && (
								<View style={tw`my-5`}>
									<Text style={tw`mb-1 font-medium text-gray-600`}>Ảnh đại diện</Text>
									<View style={tw`flex items-center flex-row`}>
										<Image
											source={{ uri: photo.uri }}
											style={tw`w-14 h-14 object-cover`}
										/>
										<Button title="Upload" onPress={handleUploadPhoto} />
									</View>
								</View>
							)}
							<Field
								component={CustomInput}
								name="name"
								label="Họ và tên"
							/>
							<Field
								component={CustomInput}
								name="phone"
								label="Số điện thoại"
								keyboardType={'phone-pad'}
							/>
							<Field
								component={CustomInput}
								name="email"
								label="Email"
								keyboardType={'email-address'}
							/>
							<Field
								component={CustomInput}
								name="address"
								label="Địa chỉ"
							/>
							<Field
								component={CustomInput}
								name="company"
								label="Công ty"
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

export default AccountSettingScreen;
