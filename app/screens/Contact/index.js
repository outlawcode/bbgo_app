import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from 'app/components';
;
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
import WebView from "react-native-webview";
import axios from "axios";
import apiConfig from "app/config/api-config";
import { showMessage } from "react-native-flash-message";

function ContactScreen(props) {
	const reason = props.route.params;
	const currentUser = useSelector(state => state.memberAuth.user);
	const settings = useSelector(state => state.SettingsReducer.options)
	const [showInfo, setShowInfo] = useState(false);

	const dispatch = useDispatch()
	useEffect(() => {
		props.navigation.setOptions({
			title: 'Liên hệ',
			headerStyle: {
				backgroundColor: '#008A97',
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

function handleContact(values, resetForm) {
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
			// Clear the form after successful submission
			try {
				resetForm && resetForm({
					values: { name: '', email: '', phone: '', message: '' }
				});
			} catch (e) {}
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
				onSubmit={(values, helpers) => handleContact(values, helpers.resetForm)}
				validationSchema={ContactSchema}
			>
				{({handleSubmit, values, setFieldValue, isValid}) => (
					<>
						<KeyboardAwareScrollView keyboardShouldPersistTaps={"always"}>
							<View style={tw`pb-20`}>
                                {/* Info blocks - modern cards (collapsible to save space) */}
                                <View style={tw`px-3 pt-3`}> 
                                    {/* Toggle */}
                                    <View style={tw`flex-row items-center justify-between mb-2`}>
                                        <Text style={tw`text-base font-semibold text-gray-800`}>Thông tin liên hệ</Text>
                                        <TouchableOpacity onPress={() => setShowInfo(!showInfo)} style={tw`px-2 py-1`}>
                                            <Text style={tw`text-cyan-700 font-medium`}>{showInfo ? 'Thu gọn' : 'Xem thêm'}</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {!showInfo && (
                                        <View style={tw`bg-white rounded-xl border border-gray-100 shadow-sm mb-3 p-4`}>
                                            <View style={tw`flex-row items-center mb-2`}>
                                                <Icon name="map-marker-outline" size={18} style={tw`text-cyan-700 mr-2`} />
                                                <Text style={[tw`text-gray-700`, { flex: 1 }]} numberOfLines={2} ellipsizeMode="tail">{settings && settings.contact_address}</Text>
                                            </View>
                                            <View style={tw`flex-row items-center mb-2`}>
                                                <Icon name="phone-outline" size={18} style={tw`text-cyan-700 mr-2`} />
                                                <Text style={[tw`text-gray-700`, { flex: 1 }]} numberOfLines={1} ellipsizeMode="tail">{settings && settings.contact_hotline}</Text>
                                            </View>
                                            <View style={tw`flex-row items-center`}>
                                                <Icon name="email-outline" size={18} style={tw`text-cyan-700 mr-2`} />
                                                <Text style={[tw`text-gray-700`, { flex: 1 }]} numberOfLines={1} ellipsizeMode="tail">{settings && settings.contact_email}</Text>
                                            </View>
                                        </View>
                                    )}

                                    {showInfo && (
                                        <>
                                        <View style={tw`bg-white rounded-xl border border-gray-100 shadow-sm mb-3 p-4 flex-row`}> 
                                        <View style={tw`w-10 h-10 rounded-full bg-cyan-50 items-center justify-center mr-3`}> 
                                            <Icon name="map-marker-outline" size={20} style={tw`text-cyan-700`} />
                                        </View>
                                        <View style={{ flex: 1, paddingRight: 8 }}>
                                            <Text style={tw`text-lg font-semibold text-gray-800 mb-1`}>Địa chỉ</Text>
                                            <Text style={tw`text-gray-700 leading-6`}>{settings && settings.contact_address}</Text>
                                        </View>
                                    </View>

                                         <View style={tw`bg-white rounded-xl border border-gray-100 shadow-sm mb-3 p-4 flex-row`}> 
                                        <View style={tw`w-10 h-10 rounded-full bg-cyan-50 items-center justify-center mr-3`}> 
                                            <Icon name="phone-outline" size={20} style={tw`text-cyan-700`} />
                                        </View>
                                        <View style={{ flex: 1, paddingRight: 8 }}>
                                            <Text style={tw`text-lg font-semibold text-gray-800 mb-1`}>Hotline</Text>
                                            <Text style={tw`text-gray-700 mb-1`}>Mobile: <Text style={tw`font-semibold text-gray-900`}>{settings && settings.contact_hotline}</Text></Text>
                                            <Text style={tw`text-gray-700`}>Email: <Text style={tw`font-semibold text-gray-900`}>{settings && settings.contact_email}</Text></Text>
                                        </View>
                                    </View>

                                         <View style={tw`bg-white rounded-xl border border-gray-100 shadow-sm mb-3 p-4 flex-row`}> 
                                        <View style={tw`w-10 h-10 rounded-full bg-cyan-50 items-center justify-center mr-3`}> 
                                            <Icon name="clock-outline" size={20} style={tw`text-cyan-700`} />
                                        </View>
                                        <View style={{ flex: 1, paddingRight: 8 }}>
                                            <Text style={tw`text-lg font-semibold text-gray-800 mb-1`}>Giờ làm việc</Text>
                                            <Text style={tw`text-gray-700 leading-6`}>
                                                Sáng: 8h30 - 11h30{"\n"}
                                                Chiều: 13h30 - 17h30{"\n"}
                                                Tất cả các ngày trong tuần.
                                            </Text>
                                        </View>
                                    </View>
                                        </>
                                    )}
                                </View>

								{/* Google Map embed if provided */}
                                {settings && settings.contact_googlemap && (
                                    <View style={tw`mx-3 my-4 rounded-lg overflow-hidden border border-gray-200`}>
                                        <WebView
                                            style={{ width: '100%', height: 200 }}
                                            originWhitelist={["*"]}
                                            source={{ html: `<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" /><iframe src=\"${settings.contact_googlemap}\" width=\"100%\" height=\"100%\" frameborder=\"0\" style=\"border:0;\" allowfullscreen=\"\" aria-hidden=\"false\" tabindex=\"0\"></iframe>` }}
                                        />
                                    </View>
                                )}

								{/* Contact form (keep existing) */}
								<View style={tw`bg-white p-3 mb-3`}>
									<View style={tw`mb-2`}>
										<View>
											<Field
												component={CustomInput}
												required
												name="name"
												label="Họ và tên"
											
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
