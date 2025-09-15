import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import { formatVND, displayNumber } from "app/utils/helper";
import AsyncStorage from "@react-native-community/async-storage";
import { emptyCart } from "app/screens/Cart/action";
import axios from "axios";
import apiConfig from "app/config/api-config";
import { GetMe, LoadDataAction } from "app/screens/Auth/action";
import Spinner from 'react-native-loading-spinner-overlay';
import CheckoutCompleted from "app/screens/CheckOut/CheckoutCompleted";
import { showMessage } from "react-native-flash-message";
import CheckoutCompletedFood from "app/screens/Food/CheckOutFood/CheckoutCompleted";

function PaymentMethodFood(props) {
	const dispatch = useDispatch();
	const [refresh, setRefresh] = useState(false);
	const state = props.route && props.route.params;
	const [showSpinner, setShowSpinner] = useState(false);
	const [showDetail, setShowDetail] = useState(false)
	const currentUser = useSelector(state => state.memberAuth.user);
	const settings = useSelector(state => state.SettingsReducer.options);
	const [paymentMethod, setPaymentMethod] = useState('RewardWallet')

	useEffect(() => {
		props.navigation.setOptions({
			title: 'Phương thức thanh toán',
			headerStyle: {
				backgroundColor: '#2ea65d',
			},
			headerTintColor: '#fff',
			headerLeft: () => (
				<TouchableOpacity
					activeOpacity={1}
					onPress={() => props.navigation.goBack()}>
					<Icon name="chevron-left"
					      size={26}
					      style={tw`text-white ml-3`}
					/>
				</TouchableOpacity>
			),
		})
	}, [])

	async function handleCreateOrder() {
		setShowSpinner(true);
		const token = await AsyncStorage.getItem('sme_user_token')
		console.log(currentUser);
		axios.post(
			`${apiConfig.BASE_URL}/member/order/create-service`,
			{
				...state.checkoutData,
				paymentMethod,
			},
			{headers: {Authorization: `Bearer ${token}`}}
		).then(function (response) {
			console.log('response', response);
			setShowSpinner(false);
			dispatch(GetMe(token));
			props.navigation.navigate('ModalOverlay', {
				content: <CheckoutCompletedFood
					result={response.data}
					navigation={props.navigation}
				/>
			})
			showMessage({
				message: 'Đặt hàng thành công!',
				type: 'success',
				icon: 'success',
				duration: 3000,
			});
			/*props.navigation.navigate('Modal', {
				content: <CheckoutCompleted
					navigation={props.navigation}
					result={response.data}
				/>
			})*/
		}).catch(function (error) {
			console.log(error);
			showMessage({
				message: error.response.data.message,
				type: 'danger',
				icon: 'danger',
				duration: 3000,
			});
			setShowSpinner(false);
		})
	}

	return (
		!state ? <Text>Đang tải...</Text> :
			<>
				<Spinner
					visible={showSpinner}
					textContent={'Đang xác nhận đơn hàng...'}
					textStyle={{ color: '#FFF' }}
				/>
				<View style={tw`flex bg-gray-100 min-h-full content-between`}>

					<ScrollView
						showsVerticalScrollIndicator={false}
						overScrollMode={'never'}
						scrollEventThrottle={16}
					>
						<View style={tw`pb-52 pt-3 px-5`}>
							<Text style={tw`mb-3`}>Chọn một trong những phương thức thanh toán sau:</Text>
							<TouchableOpacity
								activeOpacity={1}
								onPress={() => setPaymentMethod('RewardWallet')}
								style={tw`border rounded px-5 py-3 mb-3 border-gray-200 ${paymentMethod === 'RewardWallet' && 'bg-blue-100 border-blue-300'}`}
							>
								<View style={tw`flex flex-row items-center`}>
									<Icon name={paymentMethod === 'RewardWallet' ? 'radiobox-marked' : 'radiobox-blank'}
									      size={18} style={tw`mr-1 text-green-600`} />
									<Text style={tw`font-bold`}>
										Ví tiền thưởng ({currentUser && currentUser && formatVND(currentUser.rewardWallet)})
									</Text>
								</View>
								<Text style={tw`italic text-xs`}>
									Sử dụng ví tiền thưởng để thanh toán.
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								activeOpacity={1}
								onPress={() => setPaymentMethod('PointWallet')}
								style={tw`border rounded px-5 py-3 mb-3 border-gray-200 ${paymentMethod === 'PointWallet' && 'bg-blue-100 border-blue-300'}`}
							>
								<View style={tw`flex flex-row items-center`}>
									<Icon name={paymentMethod === 'PointWallet' ? 'radiobox-marked' : 'radiobox-blank'}
									      size={18} style={tw`mr-1 text-green-600`} />
									<Text style={tw`font-bold`}>
										Ví điểm thưởng ({currentUser && displayNumber(currentUser.pointWallet)} điểm)
									</Text>
								</View>
								<Text style={tw`italic text-xs`}>
									Sử dụng ví điểm thưởng để thanh toán.
								</Text>
								{settings && currentUser && (
									<Text style={tw`italic text-xs text-gray-500`}>
										= {formatVND(Number(settings.point_value) * Number(currentUser.pointWallet))}
									</Text>
								)}
							</TouchableOpacity>

							{/*<TouchableOpacity
								activeOpacity={1}
								onPress={() => setPaymentMethod('COD')}
								style={tw`border rounded px-5 py-3 mb-3 border-gray-200 ${paymentMethod === 'COD' && 'bg-blue-100 border-blue-300'}`}
							>
								<View style={tw`flex flex-row items-center`}>
									<Icon name={paymentMethod === 'COD' ? 'radiobox-marked' : 'radiobox-blank'} size={18} style={tw`mr-1 text-green-600`} />
									<Text style={tw`font-bold`}>
										Thanh toán khi nhận hàng
									</Text>
								</View>
								<Text style={tw`italic text-xs`}>
									Quý khách sẽ thanh toán cho người vận chuyển sau khi nhận và kiểm tra hàng.
								</Text>

							</TouchableOpacity>

							<TouchableOpacity
								activeOpacity={1}
								onPress={() => setPaymentMethod('BankTransfer')}
								style={tw`border rounded px-5 py-3 mb-3 border-gray-200 ${paymentMethod === 'BankTransfer' && 'bg-blue-100 border-blue-300'}`}
							>
								<View style={tw`flex flex-row items-center`}>
									<Icon name={paymentMethod === 'BankTransfer' ? 'radiobox-marked' : 'radiobox-blank'} size={18} style={tw`mr-1 text-green-600`} />
									<Text style={tw`font-bold`}>
										Chuyển khoản ngân hàng
									</Text>
								</View>
								<Text style={tw`italic text-xs`}>
									Thực hiện chuyển khoản vào tài khoản ngân hàng của chúng tôi.
								</Text>
							</TouchableOpacity>*/}
						</View>
					</ScrollView>

					<View style={tw`absolute bottom-0 android:bottom-14 bg-white w-full pb-5 pt-1 shadow-lg px-3`}>
						<View style={tw`mb-2`}>
							<View style={tw`flex items-center content-center`}>
								<TouchableOpacity
									onPress={() => setShowDetail(!showDetail)}
								>
									<Icon name={showDetail ? 'chevron-down' : 'chevron-up'} size={30} />
								</TouchableOpacity>
							</View>
							{showDetail &&
								<View>
									{state && state.checkoutData.orderItems && state.checkoutData.orderItems.length > 0 && state.checkoutData.orderItems.map((item, index) => (
										<View style={tw`flex flex-row justify-between border-b border-gray-100 pb-2 mb-2`} key={index}>
											<Text style={tw`text-gray-500 w-2/3`}>
												{item.serviceName} <Text style={tw`font-bold`}>x {item.quantity}</Text>
											</Text>
											<Text>{formatVND(item.price)}</Text>
										</View>
									))}
									<View
										style={tw`flex flex-row items-center justify-between mb-2 border-b border-gray-100 pb-2`}>
										<Text>Tạm tính</Text>
										<Text>{formatVND(state.totalAmount)}</Text>
									</View>
									{state.discount > 0 &&
										<View
											style={tw`flex flex-row items-center justify-between mb-2 border-b border-gray-100 pb-2`}>
											<Text>Giảm giá</Text>
											<Text style={tw`text-red-500`}>-{formatVND(state.discount)}</Text>
										</View>
									}
								</View>
							}
							<View style={tw`flex flex-row items-center justify-between mb-1`}>
								<Text  >Tổng tiền</Text>
								<Text style={tw`text-green-600 text-base font-bold`}>{formatVND(state.totalAmount - state.discount)}</Text>
							</View>
						</View>
						<TouchableOpacity
							style={tw`${showSpinner ? 'bg-green-600': 'bg-orange-500'} px-5 py-3 rounded w-full flex items-center justify-between`}
							onPress={handleCreateOrder}
							disabled={showSpinner}
						>
							<Text style={tw`text-white font-bold uppercase`}>
								{showSpinner ? 'Đang đặt hàng...' : 'Đặt hàng'}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</>

	);
}

export default PaymentMethodFood;
