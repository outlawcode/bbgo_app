import React, { useEffect } from "react";
import { Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import { useSelector } from "react-redux";
import { formatNumber, formatVND } from "app/utils/helper";
import { PaymentMethod } from "app/models/commons/order.model";
import { WebView } from "react-native-webview";
import DynamicWebView from "app/components/DynamicWebView";
import Clipboard from "@react-native-community/clipboard";
import { showMessage } from "react-native-flash-message";

function CheckoutCompletedFood(props) {
	const result = props.result;
	const currentUser = useSelector(state => state.memberAuth.user);
	const settings = useSelector(state => state.SettingsReducer.options)
	const receiver = JSON.parse(result && result.receiver)
	const priceDetails = JSON.parse(result && result.priceDetails)

	console.log('result', result);

	const copyToClipboard = (value) => {
		Clipboard.setString(value)
		showMessage({
			message: 'Đã sao chép vào bộ nhớ tạm',
			type: 'success',
			icon: 'success',
			duration: 1500,
		});
	}

	let paymentInfo = {
		bankName: settings && settings.pc_bank_name,
		bankCode: settings && settings.pc_bank_code,
		bankOwner: settings && settings.pc_bank_owner,
		bankAccount: settings && settings.pc_bank_account,
		bankNotePrefix: 'SME',
	}

	if (result) {
		if (result && result.restaurant && result.restaurant.paymentInfo) {
			paymentInfo = {
				bankName: JSON.parse(result.restaurant.paymentInfo).bankName,
				bankCode: JSON.parse(result.restaurant.paymentInfo).bankCode,
				bankOwner: JSON.parse(result.restaurant.paymentInfo).bankOwner,
				bankAccount: JSON.parse(result.restaurant.paymentInfo).bankAccount,
				bankNotePrefix: `SME-${result.restaurant.id}`,
			}
		}
	}

	/*console.log(result);
	useEffect(() => {
		props.navigation.setOptions({
			title: 'Thông tin đơn hàng',
			headerStyle: {
				backgroundColor: '#2ea65d',
			},
			headerTintColor: '#fff',
			headerLeft: null
		})
	}, [])*/
	return (
		!result ? <Text>Đang tải</Text> :
			<View style={tw`flex bg-gray-100 min-h-full content-between`}>
				<ScrollView
					showsVerticalScrollIndicator={false}
					overScrollMode={'never'}
					scrollEventThrottle={16}
				>
					<View style={tw`pb-32`}>
						<View style={tw`mb-3 bg-white px-3 py-10`}>
							<View style={tw`flex items-center`}>
								<Icon name={"checkbox-marked-circle-outline"} size={50} style={tw`text-green-500 mb-2`} />
								<Text  style={tw`text-center`}>Cảm ơn <Text style={tw`font-bold`}>{receiver.name}</Text> đã đặt hàng, đơn hàng của quý khách đang ở trạng thái {result.status}!</Text>
							</View>
						</View>
						<View style={tw`mb-3 bg-white p-3`}>
							<View style={tw`mb-5 flex items-center flex-row`}>
								<Icon name={"wallet-outline"} size={18} style={tw`text-red-600 mr-1`}/>
								<Text  style={tw`font-bold text-gray-600`}>Thông tin thanh toán</Text>
							</View>
							<View>
								<View style={tw`py-2 border-b border-gray-100`}>
									<Text>Phương thức thanh toán: <Text style={tw`font-medium`}>{PaymentMethod.map(el => el.code === result.paymentMethod && el.name)}</Text></Text>
								</View>
								{result && result.paymentMethod !== 'BankTransfer' &&
									<View style={tw`py-2 border-b border-gray-100`}>
										<Text>Số tiền thanh toán: <Text
											style={tw`font-medium text-red-600`}>{result && formatVND(result.amount)}</Text></Text>
									</View>
								}

								{result && result.paymentMethod === 'BankTransfer' &&
									<View>
										<Text  style={tw`py-2 mb-2`}>Quý khách vui lòng thanh toán theo thông tin bên dưới:</Text>
										<View style={tw`mb-5 flex items-center`}>
											<Image source={{uri: `https://img.vietqr.io/image/${paymentInfo.bankCode}-${paymentInfo.bankAccount}-${settings && settings.mk_payment_qr_template}.jpg?amount=${result.amount}&addInfo=${paymentInfo.bankNotePrefix}+${result.id}+${receiver.phone}`}} style={tw`w-32 h-32`} />
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
													<Text style={tw`font-medium`}>{result && formatVND(result.amount)}</Text>
													<TouchableOpacity
														onPress={() => copyToClipboard(result.amount)}
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
													<Text style={tw`font-medium`}>{paymentInfo.bankNotePrefix}-{result.id}-{receiver.phone}</Text>
													<TouchableOpacity
														onPress={() => copyToClipboard(`${paymentInfo.bankNotePrefix}-${result.id}-${receiver.phone}`)}
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
								<View style={tw`pb-2 mb-2 border-b border-gray-100 flex flex-row justify-between`}>
									<Text>Tạm tính</Text>
									<Text  style={tw`font-medium`}>{formatVND(result && result.revenue)}</Text>
								</View>
								{Number(result && result.discount) > 0 &&
									<View style={tw`pb-2 mb-2 border-b border-gray-100 flex flex-row justify-between`}>
										<Text>Tiết kiệm</Text>
										<Text  style={tw`text-red-500`}>- {formatVND(result && result.discount)}</Text>
									</View>
								}
								<View style={tw`flex flex-row justify-between`}>
									<Text>Tổng tiền</Text>
									<Text  style={tw`font-bold text-green-600 text-base`}>{formatVND(result && result.amount)}</Text>
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
						<View style={tw`mb-3 bg-white p-3`}>
							<View style={tw`mb-5 flex items-center flex-row`}>
								<Icon name={"note-edit-outline"} size={18} style={tw`text-yellow-500 mr-1`}/>
								<Text  style={tw`font-bold text-gray-600`}>Ghi chú cho đơn hàng</Text>
							</View>
							{result.note ?
								<Text>{result.note}</Text>
								:
								<Text>Không có ghi chú.</Text>
							}
						</View>
					</View>
				</ScrollView>
				<View style={tw`absolute bottom-0 bg-white w-full pb-5 pt-3 shadow-lg px-3`}>
					<View style={tw`flex items-center justify-between flex-row`}>
						<TouchableOpacity
							style={tw`bg-green-600 px-3 py-2 ${!currentUser && 'w-full'} rounded flex items-center flex-row justify-between`}
							onPress={() => props.navigation.navigate('Home')}
						>
							<Icon name={"chevron-left"} style={tw`text-white mr-1`} size={18}/>
							<Text  style={tw`text-white font-bold uppercase`}>Trang chủ</Text>
						</TouchableOpacity>
						{currentUser &&
							<TouchableOpacity
								style={tw`bg-purple-500 px-3 py-2 rounded flex items-center justify-between flex-row`}
								onPress={() => props.navigation.navigate('Orders')}
							>
								<Icon name={"clipboard-text-outline"} style={tw`text-white mr-1`} size={18} />
								<Text  style={tw`text-white font-bold uppercase`}>Quản lý đơn hàng</Text>
							</TouchableOpacity>
						}
					</View>

				</View>
			</View>
	);
}

export default CheckoutCompletedFood;
