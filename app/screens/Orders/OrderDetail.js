import React, { useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Image,
	RefreshControl,
	ScrollView,
	StatusBar,
	Text,
	TouchableOpacity,
	View,
	Modal,
	Platform,
	Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import { useIsFocused } from "@react-navigation/native";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import { PaymentMethod } from "app/models/commons/order.model";
import {formatBalance, formatDateTime, formatNumber, formatVND} from "app/utils/helper";
import DynamicWebView from "app/components/DynamicWebView";
import Clipboard from '@react-native-clipboard/clipboard';
import { showMessage } from "react-native-flash-message";
// import BottomSheet from 'react-native-gesture-bottom-sheet';
import CanceledOrderForm from "app/screens/Orders/components/CanceledOrderForm";
import PaymentScreen from "app/screens/Orders/components/PaymentScreen.js";
import { useBottomSafeArea } from "app/utils/safeAreaUtils";

function OrderDetailScreen(props) {
	const isFocused = useIsFocused();
	const settings = useSelector(state => state.SettingsReducer.options)
	const orderId = props.route.params.id;
	const [refresh, setRefresh] = useState(false);
	const [showSpinner, setShowSpinner] = useState(true);
	const [result, setResult] = useState();
	const [showCancelModal, setShowCancelModal] = useState(false);
	
	// Use proper safe area hook
	const { bottomWithExtra } = useBottomSafeArea();

	function handleCloseCancelModal() {
		setShowCancelModal(false);
	}

	useEffect(() => {
		props.navigation.setOptions({
			title: 'Thông tin đơn hàng',
			headerStyle: {
				backgroundColor: '#fff',
			},
			headerTintColor: '#000',
			headerLeft: () => (
				<TouchableOpacity
					activeOpacity={1}
					onPress={() => props.navigation.navigate("Orders")}>
					<Icon name="chevron-left"
					      size={26}
					      style={tw`ml-3`}
					/>
				</TouchableOpacity>
			),
		})
	}, [])

	useEffect(() => {
		if (isFocused) {
			async function getData() {
				if (!orderId) {
					console.log('No orderId provided');
					showMessage({
						message: 'Không tìm thấy đơn hàng!',
						type: 'danger',
						icon: 'danger',
						duration: 3000,
					});
					props.navigation.goBack();
					return;
				}

				const Token = await AsyncStorage.getItem('sme_user_token');
				console.log('Fetching order with id:', orderId);
				axios({
					method: 'get',
					url: `${apiConfig.BASE_URL}/member/order/${orderId}`,
					headers: { Authorization: `Bearer ${Token}` }
				}).then(function(response) {
					if (response.status === 200) {
						console.log('Order found:', response.data);
						setResult(response.data)
						setRefresh(false)
						setShowSpinner(false)
					}
				}).catch(function(error) {
					console.log('Error fetching order:', error.response?.data || error.message);
					setRefresh(false)
					setShowSpinner(false)
					showMessage({
						message: 'Không tìm thấy đơn hàng!',
						type: 'danger',
						icon: 'danger',
						duration: 3000,
					});
					setTimeout(() => {
						props.navigation.goBack();
					}, 2000);
				})
			}

			getData();
		}
	}, [refresh, isFocused, orderId])

	console.log(result);

	const copyToClipboard = (value) => {
		Clipboard.setString(value)
		showMessage({
			message: 'Đã sao chép vào bộ nhớ tạm',
			type: 'success',
			icon: 'success',
			duration: 1500,
		});
	}

	let priceDetails = [];
	let receiver = {};
	let orderItems = [];
	let totalRewardToken = 0;
	let paymentInfo = {
		bankName: settings && settings.bank_name,
		bankCode: settings && settings.bank_code,
		bankOwner: settings && settings.bank_owner,
		bankAccount: settings && settings.bank_account,
	}
	if (result) {
		try {
			priceDetails = result.order && result.order.priceDetails ? JSON.parse(result.order.priceDetails) : []
		} catch (e) {
			priceDetails = []
		}
		orderItems = Array.isArray(priceDetails) ? priceDetails : (priceDetails && priceDetails.priceDetail ? priceDetails.priceDetail : [])
		try {
			receiver = result.order && result.order.receiver ? JSON.parse(result.order.receiver) : {}
		} catch (e) {
			receiver = {}
		}
		// Calculate total reward token like web
		if (orderItems && orderItems.length > 0) {
			totalRewardToken = orderItems.reduce((sum, it) => sum + (Number(it?.rewardToken || 0) * Number(it?.quantity || 0)), 0);
		}
	}

	async function handleCancelOrder(data){
		const Token = await AsyncStorage.getItem('sme_user_token');
		axios({
			method: 'put',
			url: `${apiConfig.BASE_URL}/member/order/canceled/${orderId}`,
			data,
			headers: {Authorization: `Bearer ${Token}`},
		}).then(function (response) {
			setRefresh(!refresh);
			handleCloseBottomSheet()
			showMessage({
				message: `Đã cập nhật đơn hàng #${orderId}`,
				type: 'success',
				icon: 'success',
				duration: 3000,
			});
		}).catch(function(error){
			console.log(error);
		})
	}

	async function handleNhanHang() {
		const Token = await AsyncStorage.getItem('sme_user_token');
		axios({
			method: 'put',
			url: `${apiConfig.BASE_URL}/member/order/danhan/${orderId}`,
			headers: {Authorization: `Bearer ${Token}`},
		}).then(function (response) {
			setRefresh(!refresh);
			showMessage({
				message: `Đã cập nhật đơn hàng #${orderId}`,
				type: 'success',
				icon: 'success',
				duration: 3000,
			});
		}).catch(function(error){
			console.log(error);
		})
	}

	async function handleVerifyPayment() {
		const Token = await AsyncStorage.getItem('sme_user_token');
		axios({
			method: 'put',
			url: `${apiConfig.BASE_URL}/member/order/verify/${orderId}`,
			headers: {Authorization: `Bearer ${Token}`},
		}).then(function (response) {
			setRefresh(!refresh);
			showMessage({
				message: `Đã cập nhật trạng thái thanh toán #${orderId}`,
				type: 'success',
				icon: 'success',
				duration: 3000,
			});
		}).catch(function(error){
			console.log(error);
		})
	}

	return (
		!result ? <ActivityIndicator /> :
		<View>
			<StatusBar barStyle={"dark-content"}/>
			<View style={tw`flex bg-gray-100 min-h-full content-between`}>
				<ScrollView
					refreshControl={
						<RefreshControl
							refreshing={refresh}
							onRefresh={() => setRefresh(true)}
							title="đang tải"
							titleColor="#000"
							tintColor="#000"
						/>
					}
					showsVerticalScrollIndicator={false}
					overScrollMode={'never'}
					scrollEventThrottle={16}
				>
					<View style={tw`pb-32`}>
						<View style={tw`mb-3 bg-white p-3`}>
							<View style={tw`flex items-center justify-between mb-3 flex-row`}>
								<Text  style={tw`text-gray-500`}>Mã đơn hàng: <Text style={tw`font-bold text-gray-800`}>#{result.order.id}</Text></Text>
								<View style={tw`bg-blue-50 rounded-full py-1 px-2`}>
									<Text style={tw`text-green-600`}>{result && result.order.type}</Text>
								</View>
							</View>
							<View>
								<View style={tw`mb-2`}>
									<Text  style={tw`text-gray-500 mb-1`}>
										Trạng thái: <Text style={tw`text-gray-800`}>{result.order && result.order.status}</Text>
									</Text>
									<Text  style={tw`text-gray-500 mb-1`}>
										Giao hàng: <Text style={tw`text-gray-800`}>{result.order && result.order.process ? result.order.process : 'Chưa có'}</Text>
									</Text>
									<Text  style={tw`text-gray-500`}>
										Ngày tạo: <Text style={tw`text-gray-800`}>{formatDateTime(result.order.createdAt)}</Text>
									</Text>
								</View>
								{result.order.approvedAt &&
									<View style={tw`mb-2`}>
										<Text  style={tw`text-gray-500`}>
											Ngày cập nhật: <Text
											style={tw`text-gray-800`}>{formatDateTime(result.order.approvedAt)}</Text>
										</Text>
									</View>
								}
							</View>
						</View>
						<View style={tw`mb-3 bg-white p-3`}>
							<View style={tw`mb-5 flex items-center flex-row`}>
								<Icon name={"wallet-outline"} size={18} style={tw`text-red-600 mr-1`}/>
								<Text  style={tw`font-bold text-gray-600`}>Thông tin thanh toán</Text>
							</View>
							<View>
								<View style={tw`py-2 border-b border-gray-100`}>
									<Text>Phương thức thanh toán: <Text style={tw`font-medium`}>{result && result.order.paymentMethod}</Text></Text>
								</View>

								<View style={tw`py-2 border-b border-gray-100`}>
									<Text>Tổng tiền đơn hàng: <Text
										style={tw`font-medium text-blue-500`}>{result && formatVND(result.order.amount)}</Text></Text>
								</View>

								<View style={tw`py-2 border-b border-gray-100`}>
									<Text>Tổng tiền chuyển khoản: <Text
										style={tw`font-medium text-red-600`}>{result && formatVND(result.transaction.amount)}</Text></Text>
								</View>

								{result && result.order.paymentNote && result.order.status === 'Chờ thanh toán' &&
									<View>
										<Text  style={tw`py-2 mb-2`}>Quý khách vui lòng thanh toán theo thông tin bên dưới:</Text>
										<View style={tw`mb-5 flex items-center`}>
											<Image source={{uri: `https://qr.sepay.vn/img?acc=${settings &&
												settings.bank_account}&bank=${settings &&
												settings.bank_code}&amount=${
													result.transaction.amount
												}&des=${
													result.order.paymentNote
												}`}} style={tw`w-32 h-32`} />
										</View>
										<View style={tw`mb-3 border-b border-gray-100 pb-2`}>
											<View style={tw`flex flex-row items-center justify-between mb-2`}>
												<Text>Ngân hàng</Text>
												<Text style={tw`font-medium`} numberOfLines={2}>{paymentInfo.bankName}</Text>
											</View>
											<View style={tw`flex flex-row items-center justify-between mb-2`}>
												<Text>Chủ tài khoản</Text>
												<Text style={tw`font-medium`} numberOfLines={2}>{paymentInfo.bankOwner}</Text>
											</View>
											<View style={tw`flex flex-row items-center justify-between mb-2`}>
												<Text>Số tài khoản</Text>
												<View>
													<Text style={tw`font-medium`}>{paymentInfo.bankAccount}</Text>
													<TouchableOpacity
														onPress={() => copyToClipboard(paymentInfo.bankAccount)}
														style={tw`flex flex-row items-center`}
													>
														<Icon name="content-copy" style={tw`text-blue-400 mr-1`} />
														<Text style={tw`text-blue-400`}>Sao chép</Text>
													</TouchableOpacity>
												</View>
											</View>

											<View style={tw`flex flex-row items-center justify-between mb-2`}>
												<Text>Số tiền</Text>
												<View>
													<Text style={tw`font-medium`}>{result && formatVND(result.transaction.amount)}</Text>
													<TouchableOpacity
														onPress={() => copyToClipboard(result.transaction.amount)}
														style={tw`flex flex-row items-center`}
													>
														<Icon name="content-copy" style={tw`text-blue-400 mr-1`} />
														<Text style={tw`text-blue-400`}>Sao chép</Text>
													</TouchableOpacity>
												</View>
											</View>

											<View style={tw`flex flex-row items-center justify-between mb-2`}>
												<Text>Nội dung</Text>
												<View>
													<Text style={tw`font-medium`}>{result?.order?.paymentNote}</Text>
													<TouchableOpacity
														onPress={() => copyToClipboard(`${result?.order?.paymentNote}`)}
														style={tw`flex flex-row items-center`}
													>
														<Icon name="content-copy" style={tw`text-blue-400 mr-1`} />
														<Text style={tw`text-blue-400`}>Sao chép</Text>
													</TouchableOpacity>
												</View>
											</View>
										</View>
										{result && result.order.paymentVerified === 0 &&
											<View style={tw`flex items-center`}>
												<TouchableOpacity
													onPress={() => handleVerifyPayment()}
													style={tw`bg-green-500 py-2 px-3 rounded`}
												>
													<Text style={tw`text-white`}>Xác nhận thanh toán</Text>
												</TouchableOpacity>
											</View>
										}
									</View>
								}

							</View>

						</View>
						<View style={tw`mb-3 bg-white p-3`}>
							<View style={tw`mb-5 flex items-center flex-row`}>
								<Icon name={"cart-outline"} size={18} style={tw`text-green-600 mr-1`}/>
								<Text  style={tw`font-bold text-gray-600`}>Thông tin đơn hàng</Text>
							</View>
							<View>
								<View>
									{orderItems && orderItems.length > 0 && orderItems.map((item, idx) => (
										<View key={idx} style={tw`pb-2 mb-2 border-b border-gray-100`}>
											<Text>
												{item.product?.name || item.name} {item.product && item.name ? `- ${item.name}` : ''}
												<Text> x {item.quantity}</Text>
											</Text>
										</View>
									))}
								</View>

								<View style={tw`pb-2 mb-2 border-b border-gray-100 flex flex-row justify-between`}>
									<Text>Tạm tính</Text>
									<Text  style={tw`font-medium`}>{formatVND(result && Number(result.order.revenue))}</Text>
								</View>

								{/* Product discount */}
								{Number(result && result.order.productDiscount) > 0 && (
									<View style={tw`pb-2 mb-2 border-b border-gray-100 flex flex-row justify-between`}>
										<Text>Giảm giá sản phẩm</Text>
										<Text style={tw`text-red-500`}>- {formatVND(result.order.productDiscount)}</Text>
									</View>
								)}

								{/* Position discount (active discount) */}
								{Number(result && result.order.positionDiscount) > 0 && result.order.hasActiveDiscount && (
									<View style={tw`pb-2 mb-2 border-b border-gray-100 flex flex-row justify-between`}>
										<Text>Chiết khấu cấp bậc ({result.order.discountPercent}%)</Text>
										<Text style={tw`text-red-500`}>- {formatVND(result.order.positionDiscount)}</Text>
									</View>
								)}

								{/* Shipping fee */}
								{Number(result && result.order.shippingFee) > 0 && (
									<View style={tw`pb-2 mb-2 border-b border-gray-100 flex flex-row justify-between`}>
										<Text>Phí vận chuyển</Text>
										<Text style={tw`text-blue-600`}>+{formatVND(result.order.shippingFee)}</Text>
									</View>
								)}
								<View style={tw`flex flex-row justify-between`}>
									<Text>Tổng tiền</Text>
									<Text  style={tw`font-bold text-green-600 text-base`}>{formatVND(result && result.order.amount)}</Text>
								</View>

								{/* Total points if any */}
								{Number(result && result.order.point) > 0 && (
									<View style={tw`pt-2 flex flex-row justify-between`}>
										<Text>Tổng điểm</Text>
										<Text style={tw`font-bold text-blue-500`}>{formatBalance(result.order.point)} {settings && settings.point_code}</Text>
									</View>
								)}

								{/* Reward token gift */}
								{totalRewardToken > 0 && (
									<View style={tw`pt-2 flex flex-row justify-between`}>
										<Text style={tw`text-cyan-600`}>🎁 Tặng</Text>
										<Text style={tw`font-bold text-cyan-600`}>+{totalRewardToken} {settings && settings.point_code}</Text>
									</View>
								)}
							</View>

						</View>
						<View style={tw`mb-3 bg-white p-3`}>
							<View style={tw`mb-5 flex items-center flex-row`}>
								<Icon name={"account-box-outline"} size={18} style={tw`text-purple-500 mr-1`}/>
								<Text  style={tw`font-bold text-gray-600`}>Thông tin nhận hàng</Text>
							</View>
							<View>
								<View style={tw`pb-2 mb-2 border-b border-gray-100`}>
									<Text  style={tw`text-gray-500`}>Họ tên: <Text style={tw`font-medium text-black`}>{receiver.name}</Text></Text>
								</View>
								<View style={tw`pb-2 mb-2 border-b border-gray-100`}>
									<Text  style={tw`text-gray-500`}>Số điện thoại: <Text style={tw`font-medium text-black`}>{receiver.phone}</Text></Text>
								</View>
								<View style={tw`pb-2 mb-2 border-b border-gray-100`}>
									<Text  style={tw`text-gray-500`}>Email: <Text style={tw`font-medium text-black`}>{receiver.email}</Text></Text>
								</View>
								<View>
									<Text  style={tw`text-gray-500`}>Địa chỉ: <Text style={tw`font-medium text-black`}>{receiver.address}{receiver.city ? `, ${receiver.city}` : ''}{receiver.wardName ? `, ${receiver.wardName}` : ''}{receiver.districtName ? `, ${receiver.districtName}` : ''}{receiver.provinceName ? `, ${receiver.provinceName}` : ''}</Text></Text>
								</View>
							</View>
						</View>
						<View style={tw`mb-3 bg-white p-3 mb-5`}>
							<View style={tw`mb-5 flex items-center flex-row`}>
								<Icon name={"note-edit-outline"} size={18} style={tw`text-yellow-500 mr-1`}/>
								<Text  style={tw`font-bold text-gray-600`}>Ghi chú cho đơn hàng</Text>
							</View>
							{result.order.note ?
								<Text>{result.order.note}</Text>
								:
								<Text>Không có ghi chú.</Text>
							}
						</View>

						{result && (result.order.status === 'Chờ xác nhận' || result.order.status === 'Chờ thanh toán') &&
							<View style={tw`flex items-center`}>
								<TouchableOpacity
									onPress={() => setShowCancelModal(true)}
									style={tw`border border-gray-600 px-4 py-2`}
								>
									<Text style={tw`text-gray-600`}>Xác nhận Huỷ đơn hàng</Text>
								</TouchableOpacity>
							</View>
						}
					</View>
				</ScrollView>
				{result && (result.order.status === 'Chờ xác nhận') &&
					<View style={[tw`absolute bottom-0 bg-white w-full py-3 shadow-lg px-3`, { paddingBottom: bottomWithExtra }]}>
						<TouchableOpacity
							onPress={() => props.navigation.navigate("ModalOverlay", {
								content: <PaymentScreen
									receiver={receiver}
									orderId={result.order && result.order.id}
									amount={result.transaction && result.transaction.amount}
									navigation={props.navigation}
									backScreen={"OrderDetail"}
									onRefresh={() => setRefresh(!refresh)}
								/>
							})}
							style={tw`bg-orange-500 flex items-center w-full p-3 rounded`}
						>
							<Text style={tw`text-white font-medium uppercase`}>
								Thanh toán
							</Text>
						</TouchableOpacity>
					</View>
				}
				{result && (result.order.process === 'Đang giao') &&
					<View style={[tw`absolute bottom-0 bg-white w-full py-3 shadow-lg px-3`, { paddingBottom: bottomWithExtra }]}>
						<TouchableOpacity
							onPress={() => handleNhanHang()}
							style={tw`bg-orange-500 flex items-center w-full p-3 rounded`}
						>
							<Text style={tw`text-white font-medium uppercase`}>
								Đã nhận được hàng
							</Text>
						</TouchableOpacity>
					</View>
				}
			</View>
			<Modal
				visible={showCancelModal}
				animationType="slide"
				transparent={true}
				onRequestClose={handleCloseCancelModal}
			>
				<View style={tw`flex-1 bg-black bg-opacity-50 justify-center items-center px-4`}>
					<View style={tw`bg-white rounded-lg w-full max-w-md`}>
						<View style={tw`p-4 border-b border-gray-200`}>
							<View style={tw`flex-row justify-between items-center`}>
								<Text style={tw`text-lg font-bold`}>Huỷ đơn hàng</Text>
								<TouchableOpacity onPress={handleCloseCancelModal}>
									<Icon name="close" size={24} style={tw`text-gray-500`} />
								</TouchableOpacity>
							</View>
						</View>
						<View style={tw`p-4`}>
					<CanceledOrderForm
								onCancel={(values) => {
									handleCancelOrder(values);
									setShowCancelModal(false);
								}}
					/>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
}

export default OrderDetailScreen;
