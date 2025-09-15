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
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import { useIsFocused } from "@react-navigation/native";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import { PaymentMethod } from "app/models/commons/order.model";
import { formatDateTime, formatNumber, formatVND } from "app/utils/helper";
import DynamicWebView from "app/components/DynamicWebView";
import Clipboard from '@react-native-community/clipboard';
import { showMessage } from "react-native-flash-message";
import BottomSheet from 'react-native-gesture-bottom-sheet';
import CanceledOrderForm from "app/screens/Orders/components/CanceledOrderForm";
import CheckoutCompleted from "app/screens/CheckOut/CheckoutCompleted.js";
import PaymentScreen from "app/screens/Orders/components/PaymentScreen.js";

function OrderDetailScreen(props) {
	const isFocused = useIsFocused();
	const settings = useSelector(state => state.SettingsReducer.options)
	const orderId = props.route.params.id;
	const [refresh, setRefresh] = useState(false);
	const [showSpinner, setShowSpinner] = useState(true);
	const [result, setResult] = useState();

	const bottomSheet = useRef();
	function handleCloseBottomSheet() {
		bottomSheet.current.close()
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
	let paymentInfo = {
		bankName: settings && settings.pc_bank_name,
		bankCode: settings && settings.pc_bank_code,
		bankOwner: settings && settings.pc_bank_owner,
		bankAccount: settings && settings.pc_bank_account,
		bankNotePrefix: 'SME',
	}
	if (result) {
		priceDetails = JSON.parse(result.order.priceDetails)
		receiver = JSON.parse(result.order.receiver)
		console.log(priceDetails);
		if (priceDetails && priceDetails.restaurant && priceDetails.restaurant.paymentInfo) {
			paymentInfo = {
				bankName: JSON.parse(priceDetails.restaurant.paymentInfo).bankName,
				bankCode: JSON.parse(priceDetails.restaurant.paymentInfo).bankCode,
				bankOwner: JSON.parse(priceDetails.restaurant.paymentInfo).bankOwner,
				bankAccount: JSON.parse(priceDetails.restaurant.paymentInfo).bankAccount,
				bankNotePrefix: `SME-${priceDetails.restaurant.id}`,
			}
		}
		if (result && result.shop && result.shop.paymentInfo) {
			paymentInfo = {
				bankName: JSON.parse(result.shop.paymentInfo).bankName,
				bankCode: JSON.parse(result.shop.paymentInfo).bankCode,
				bankOwner: JSON.parse(result.shop.paymentInfo).bankOwner,
				bankAccount: JSON.parse(result.shop.paymentInfo).bankAccount,
				bankNotePrefix: `SME-${result.shop.id}`,
			}
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
									<Text>Phương thức thanh toán: <Text style={tw`font-medium`}>{PaymentMethod.map(el => el.code === result.order.paymentMethod && el.name)}</Text></Text>
								</View>

								<View style={tw`py-2 border-b border-gray-100`}>
									<Text>Số tiền thanh toán: <Text
										style={tw`font-medium text-red-600`}>{result && formatVND(result.order.amount)}</Text></Text>
								</View>

								{result && result.order.paymentMethod === 'BankTransfer' && result.order.status === 'Chờ xác nhận' &&
									<View>
										<Text  style={tw`py-2 mb-2`}>Quý khách vui lòng thanh toán theo thông tin bên dưới:</Text>
										<View style={tw`mb-5 flex items-center`}>
											<Image source={{uri: `https://img.vietqr.io/image/${paymentInfo.bankCode}-${paymentInfo.bankAccount}-${settings && settings.mk_payment_qr_template}.jpg?amount=${result.amount}&addInfo=${paymentInfo.bankNotePrefix}+${result.order.id}+${receiver.phone}`}} style={tw`w-32 h-32`} />
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
													<Text style={tw`font-medium`}>{result && formatVND(result.order.amount)}</Text>
													<TouchableOpacity
														onPress={() => copyToClipboard(result.order.amount)}
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
													<Text style={tw`font-medium`}>{paymentInfo.bankNotePrefix}-{result.order.id}-{receiver.phone}</Text>
													<TouchableOpacity
														onPress={() => copyToClipboard(`${paymentInfo.bankNotePrefix}-${result.order.id}-${receiver.phone}`)}
														style={tw`flex flex-row items-center`}
													>
														<Icon name="content-copy" style={tw`text-blue-400 mr-1`} />
														<Text style={tw`text-blue-400`}>Sao chép</Text>
													</TouchableOpacity>
												</View>
											</View>
										</View>
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
								{result && result.order && result.order.type === 'Dịch vụ' ?
									<View>
										<View style={tw`mb-2`}>
											<View style={tw`my-2 p-2 bg-blue-100 border border-blue-300 rounded`}>
												<Text style={tw`text-green-600 text-base font-medium`}>
													<Icon name={"shield-check"} size={18} style={tw`mr-2 text-yellow-500`} /> {priceDetails.restaurant && priceDetails.restaurant.name}</Text>
												<View>
													<Text style={tw`text-xs text-gray-500`} numberOfLines={1}>{priceDetails.restaurant && priceDetails.restaurant.address}</Text>
												</View>
											</View>
										</View>
										{priceDetails && priceDetails.priceDetail.length > 0 &&
											priceDetails.priceDetail.map((item) => (
												<View style={tw`pb-2 mb-2 border-b border-gray-100`}>
													<Text>
														{item.serviceName}
														<Text> (x {item.quantity})</Text>
													</Text>
												</View>
											))
										}
									</View>
									:
									<View>
										{priceDetails && priceDetails.priceDetail.length > 0 &&
											priceDetails.priceDetail.map((item) => (
												<View style={tw`pb-2 mb-2 border-b border-gray-100`}>
													<Text>
														{item.product.name} - {item.name}
														<Text> (x {item.quantity})</Text>
													</Text>
												</View>
											))
										}
									</View>
								}

								<View style={tw`pb-2 mb-2 border-b border-gray-100 flex flex-row justify-between`}>
									<Text>Tạm tính</Text>
									<Text  style={tw`font-medium`}>{formatVND(result && Number(result.order.revenue))}</Text>
								</View>

								<View style={tw`pb-2 mb-2 border-b border-gray-100 flex flex-row justify-between`}>
									<Text>VAT</Text>
									<Text  style={tw`font-medium text-gray-600`}>{formatVND(result && Number(result.order.VATAmount))}</Text>
								</View>
								{/*{Number(result && result.order.nccDiscount) > 0 &&
									<View style={tw`pb-2 mb-2 border-b border-gray-100 flex flex-row justify-between`}>
										<Text>Khuyến mại từ Nhà cung cấp</Text>
										<Text  style={tw`text-red-500`}>- {formatVND(result && result.order.nccDiscount)}</Text>
									</View>
								}*/}
								{Number(result && result.order.discount) > 0 &&
									<View style={tw`pb-2 mb-2 border-b border-gray-100 flex flex-row justify-between`}>
										<Text>E-voucher giảm giá</Text>
										<Text  style={tw`text-red-500`}>- {formatVND(result && result.order.discount)}</Text>
									</View>
								}
								{Number(result && result.order.thuongdiem) > 0 &&
									<View style={tw`pb-2 mb-2 border-b border-gray-100 flex flex-row justify-between`}>
										<Text>Thưởng điểm</Text>
										<Text  style={tw`text-green-500`}>+{formatNumber(result.order.thuongdiem)}</Text>
									</View>
								}
								<View style={tw`flex flex-row justify-between`}>
									<Text>Tổng tiền</Text>
									<Text  style={tw`font-bold text-green-600 text-base`}>{formatVND(result && result.order.amount)}</Text>
								</View>
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
									<Text  style={tw`text-gray-500`}>Địa chỉ: <Text style={tw`font-medium text-black`}>{receiver.address}</Text></Text>
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
									onPress={() => bottomSheet.current.show()}
									style={tw`border border-gray-600 px-4 py-2`}
								>
									<Text style={tw`text-gray-600`}>Xác nhận Huỷ đơn hàng</Text>
								</TouchableOpacity>
							</View>
						}
					</View>
				</ScrollView>
				{result && (result.order.status === 'Chờ thanh toán') &&
					<View style={tw`absolute bottom-0 android:bottom-14 bg-white w-full py-3 shadow-lg px-3`}>
						<TouchableOpacity
							onPress={() => props.navigation.navigate("ModalOverlay", {
								content: <PaymentScreen
									receiver={receiver}
									orderId={result.order && result.order.id}
									amount={result.order && result.order.amount}
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
					<View style={tw`absolute bottom-0 android:bottom-14 bg-white w-full py-3 shadow-lg px-3`}>
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
			<BottomSheet hasDraggableIcon ref={bottomSheet} height={300}>
				<View
					style={tw`p-5`}
				>
					<CanceledOrderForm
						onCancel={handleCancelOrder}
					/>
				</View>
			</BottomSheet>
		</View>
	);
}

export default OrderDetailScreen;
