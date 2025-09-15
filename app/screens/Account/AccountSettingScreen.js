import React, { useEffect, useRef, useState } from "react";
import { Button, Image, Keyboard, Platform, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import CartIcon from "app/screens/Cart/components/cartIcon";
import { useDispatch, useSelector } from "react-redux";
import * as ImagePicker from "react-native-image-picker"
import ActionSheet from 'react-native-actionsheet';
import AsyncStorage from "@react-native-async-storage/async-storage";
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
	const [idFront, setIdFront] = useState(props.initialValues && props.initialValues.idImageFront ? props.initialValues.idImageFront : null);
	const [idBack, setIdBack] = useState(props.initialValues && props.initialValues.idImageBack ? props.initialValues.idImageBack : null);
	const [idFrontPhoto, setIdFrontPhoto] = React.useState(null);
	const [idBackPhoto, setIdBackPhoto] = React.useState(null);
	const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
	const [uploadingIdFront, setUploadingIdFront] = React.useState(false);
	const [uploadingIdBack, setUploadingIdBack] = React.useState(false);

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
				setUploadingAvatar(true);
				// Auto upload after selection
				handleUploadPhoto(response);
			}
		});
	};

	const handleChooseIdFront = () => {
		launchImageLibrary({ noData: true }, (response) => {
			if (response) {
				setIdFrontPhoto(response);
				setUploadingIdFront(true);
				// Auto upload after selection
				handleUploadIdFront(response);
			}
		});
	};

	const handleChooseIdBack = () => {
		launchImageLibrary({ noData: true }, (response) => {
			if (response) {
				setIdBackPhoto(response);
				setUploadingIdBack(true);
				// Auto upload after selection
				handleUploadIdBack(response);
			}
		});
	};

	async function handleUploadPhoto(photoToUpload = photo) {
		if (!photoToUpload) return;

		const Token = await AsyncStorage.getItem('sme_user_token');
		fetch(`${apiConfig.BASE_URL}/media/member/upload`, {
			method: 'POST',
			body: createFormData(photoToUpload, { userId: currentUser && currentUser.refId }),
			headers: {Authorization: `Bearer ${Token}`},
		})
			.then((response) => response.json())
			.then((response) => {
				console.log(response);
				showMessage({
					message: "Upload ảnh đại diện thành công!",
					type: 'success',
					icon: 'success',
					duration: 2000,
				});
				setAvatar(apiConfig.BASE_URL+response[0].url);
				setUploadingAvatar(false);
			})
			.catch((error) => {
				console.log('error', error);
				showMessage({
					message: error.response?.data?.message || "Upload ảnh thất bại",
					type: 'danger',
					icon: 'danger',
					duration: 2000,
				});
				setUploadingAvatar(false);
			});
	}

	async function handleUploadIdFront(photoToUpload = idFrontPhoto) {
		if (!photoToUpload) return;

		const Token = await AsyncStorage.getItem('sme_user_token');
		fetch(`${apiConfig.BASE_URL}/media/member/upload`, {
			method: 'POST',
			body: createFormData(photoToUpload, { userId: currentUser && currentUser.refId }),
			headers: {Authorization: `Bearer ${Token}`},
		})
			.then((response) => response.json())
			.then((response) => {
				console.log(response);
				showMessage({
					message: "Upload ảnh mặt trước CCCD thành công!",
					type: 'success',
					icon: 'success',
					duration: 2000,
				});
				setIdFront(apiConfig.BASE_URL+response[0].url);
				setUploadingIdFront(false);
			})
			.catch((error) => {
				console.log('error', error);
				showMessage({
					message: error.response?.data?.message || "Upload ảnh thất bại",
					type: 'danger',
					icon: 'danger',
					duration: 2000,
				});
				setUploadingIdFront(false);
			});
	}

	async function handleUploadIdBack(photoToUpload = idBackPhoto) {
		if (!photoToUpload) return;

		const Token = await AsyncStorage.getItem('sme_user_token');
		fetch(`${apiConfig.BASE_URL}/media/member/upload`, {
			method: 'POST',
			body: createFormData(photoToUpload, { userId: currentUser && currentUser.refId }),
			headers: {Authorization: `Bearer ${Token}`},
		})
			.then((response) => response.json())
			.then((response) => {
				console.log(response);
				showMessage({
					message: "Upload ảnh mặt sau CCCD thành công!",
					type: 'success',
					icon: 'success',
					duration: 2000,
				});
				setIdBack(apiConfig.BASE_URL+response[0].url);
				setUploadingIdBack(false);
			})
			.catch((error) => {
				console.log('error', error);
				showMessage({
					message: error.response?.data?.message || "Upload ảnh thất bại",
					type: 'danger',
					icon: 'danger',
					duration: 2000,
				});
				setUploadingIdBack(false);
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

	// Initialize ID images from current user data
	useEffect(() => {
		if (currentUser) {
			if (currentUser.idImageFront) {
				setIdFront(currentUser.idImageFront);
			}
			if (currentUser.idImageBack) {
				setIdBack(currentUser.idImageBack);
			}
		}
	}, [currentUser])

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
			avatar: avatar || currentUser.avatar, // Preserve current avatar if no new one uploaded
			idImageFront: idFront,
			idImageBack: idBack
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
						personalID: currentUser && currentUser.personalID,
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
									disabled={uploadingAvatar}
								>
									<View style={tw`flex justify-center items-center`} >
										{uploadingAvatar ? (
											<View style={tw`w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center`}>
												<Text style={tw`text-sm text-gray-500`}>Đang upload...</Text>
											</View>
										) : (
											<>
												<Icon name="camera-outline" size={30} style={tw`absolute z-50 text-gray-100`} />
												<View style={tw`bg-black bg-opacity-20 h-20 w-20 absolute z-30 rounded-full`} />
												<Image
													source={{uri: avatar || currentUser.avatar}}
													style={tw`w-20 h-20 rounded-full object-cover`}
												/>
											</>
										)}
									</View>
								</TouchableOpacity>
							</View>

							{/* ID Card Front Upload */}
							<View style={tw`my-5`}>
								<Text style={tw`mb-3 font-medium text-gray-600`}>Ảnh mặt trước CCCD</Text>
								<TouchableOpacity
									onPress={handleChooseIdFront}
									disabled={uploadingIdFront}
									style={tw`border-2 border-dashed border-gray-300 rounded-lg p-4 items-center`}
								>
									{uploadingIdFront ? (
										<View style={tw`items-center`}>
											<View style={tw`w-32 h-20 bg-gray-100 rounded flex items-center justify-center`}>
												<Text style={tw`text-sm text-gray-500`}>Đang upload...</Text>
											</View>
										</View>
									) : idFront ? (
										<View style={tw`items-center`}>
											<Image
												source={{ uri: idFront }}
												style={tw`w-32 h-20 object-cover rounded`}
											/>
											<Text style={tw`text-sm text-gray-500 mt-2`}>Nhấn để thay đổi ảnh</Text>
										</View>
									) : (
										<View style={tw`items-center`}>
											<Icon name="camera-outline" size={30} style={tw`text-gray-400 mb-2`} />
											<Text style={tw`text-gray-500`}>Nhấn để chọn ảnh mặt trước CCCD</Text>
										</View>
									)}
								</TouchableOpacity>
							</View>

							{/* ID Card Back Upload */}
							<View style={tw`my-5`}>
								<Text style={tw`mb-3 font-medium text-gray-600`}>Ảnh mặt sau CCCD</Text>
								<TouchableOpacity
									onPress={handleChooseIdBack}
									disabled={uploadingIdBack}
									style={tw`border-2 border-dashed border-gray-300 rounded-lg p-4 items-center`}
								>
									{uploadingIdBack ? (
										<View style={tw`items-center`}>
											<View style={tw`w-32 h-20 bg-gray-100 rounded flex items-center justify-center`}>
												<Text style={tw`text-sm text-gray-500`}>Đang upload...</Text>
											</View>
										</View>
									) : idBack ? (
										<View style={tw`items-center`}>
											<Image
												source={{ uri: idBack }}
												style={tw`w-32 h-20 object-cover rounded`}
											/>
											<Text style={tw`text-sm text-gray-500 mt-2`}>Nhấn để thay đổi ảnh</Text>
										</View>
									) : (
										<View style={tw`items-center`}>
											<Icon name="camera-outline" size={30} style={tw`text-gray-400 mb-2`} />
											<Text style={tw`text-gray-500`}>Nhấn để chọn ảnh mặt sau CCCD</Text>
										</View>
									)}
								</TouchableOpacity>
							</View>
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
								name="personalID"
								label="Số CCCD"
							/>
							<TouchableOpacity
								onPress={handleSubmit}
								style={tw`${!isValid ? 'bg-gray-300' : 'bg-cyan-600'} p-4 rounded`}
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
