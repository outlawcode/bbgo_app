import React, { useEffect } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import { Field, Formik } from "formik";
import * as Yup from 'yup';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CustomInput from "app/components/CustomInput";
import { formatVND } from "app/utils/helper";
import { useDispatch, useSelector } from "react-redux";
import { memberLogin } from "app/screens/Auth/action";
import DynamicWebView from "app/components/DynamicWebView";
import axios from "axios";
import apiConfig from "app/config/api-config";
import { showMessage } from "react-native-flash-message";

function ContactScreen(props) {
	const reason = props.route.params;
	const currentUser = useSelector(state => state.memberAuth.user);
	const settings = useSelector(state => state.SettingsReducer.options)

	const dispatch = useDispatch()
	useEffect(() => {
		props.navigation.setOptions({
			title: 'Liên hệ',
			headerStyle: {
				backgroundColor: '#2ea65d',
			},
			headerTintColor: '#fff',
		})
	}, [])

	const ContactSchema = Yup.object().shape({
		name: Yup
			.string()
			.required('Vui lòng nhập thông tin'),
		message: Yup
			.string()
			.required('Vui lòng nhập thông tin'),
		email: Yup
			.string()
			.email("Nhập đúng địa chỉ email")
			.required('Vui lòng nhập email'),
		phone: Yup
			.string()
			.max(10, ({max}) => 'Vui lòng nhập đúng số điện thoại')
			.min(10, ({min}) => 'Vui lòng nhập đúng số điện thoại')
			.required('Vui lòng nhập số điện thoại'),
	})

	function handleContact(values) {
		axios.post(
			`${apiConfig.BASE_URL}/contact`,
			values
		).then(function(response) {
			showMessage({
				message: 'Tin nhắn đã được gửi đi, bộ phận hỗ trợ sẽ liên hệ với bạn trong thời gian sớm nhất. Xin cảm ơn!',
				type: 'success',
				icon: 'success',
				duration: 3000,
			});
		}).catch(function(error) {
			showMessage({
				message: 'Có lỗi xảy ra, vui lòng thử lại sau!',
				type: 'danger',
				icon: 'danger',
				duration: 3000,
			});
		})
		//dispatch(memberLogin({...values, navigation: props.navigation, backScreen: 'Account'}))
	}

	return (
		<View style={tw`flex bg-white min-h-full content-between`}>
			<Formik
				enableReinitialize
				initialValues={{
					name: currentUser && currentUser.name ? currentUser.name : '',
					email: currentUser && currentUser.email ? currentUser.email : '',
					phone: currentUser && currentUser.phone ? currentUser.phone : '',
					message: ''
					//username: props && props.route && props.route.params && props.route.params.values && props.route.params.values.email,
					//password: props && props.route && props.route.params && props.route.params.values && props.route.params.values.password,
				}}
				onSubmit={values => handleContact(values)}
				validationSchema={ContactSchema}
			>
				{({handleSubmit, values, setFieldValue, isValid}) => (
					<>
						<KeyboardAwareScrollView keyboardShouldPersistTaps={"always"}>
							<View style={tw`pb-20`}>
								<View style={tw`bg-white p-3 mb-3`}>
									<View style={tw`mb-2`}>
										<View>
											<Field
												component={CustomInput}
												required
												name="name"
												label="Họ và tên"
												autoFocus
											/>
											<Field
												component={CustomInput}
												required
												name="email"
												label="Email"
												autoCapitalize = 'none'
											/>
											<Field
												component={CustomInput}
												required
												name="phone"
												label="Số điện thoại"
												number
											/>
											<Field
												component={CustomInput}
												required
												name="message"
												label="Tin nhắn"
												textarea
												multiline={true}
												numberOfLines={12}
												textAlignVertical="top"
											/>
										</View>
										<TouchableOpacity
											style={tw`bg-green-600 px-5 py-4 mt-3 rounded w-full flex items-center justify-between`}
											onPress={handleSubmit}
										>
											<Text  style={tw`text-white font-bold uppercase`}>Gửi đi</Text>
										</TouchableOpacity>
									</View>

									{reason && reason === 'deleteRequest' &&
										<View style={tw`mt-3 p-2 bg-red-50 border border-red-200 rounded`}>
											<Text style={tw`text-red-700`}>
												<Icon name={"alert"}/>
												Xin chào! Bạn đang yêu cầu chúng tôi xoá tài khoản của bạn khỏi hệ thống, vui lòng viết lý do vào phần nội dung tin nhắn phía trên để chúng tôi có thể hỗ trợ bạn tốt nhất!
											</Text>
										</View>
									}
								</View>
							</View>

						</KeyboardAwareScrollView>
					</>
				)}
			</Formik>
		</View>
	);
}

export default ContactScreen;
