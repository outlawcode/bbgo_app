import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View, Clipboard, Image } from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import { useIsFocused } from "@react-navigation/native";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import CartIcon from "app/screens/Cart/components/cartIcon";
import Spinner from "react-native-loading-spinner-overlay/src";
import {displayNumber, formatBalance, formatDateTime, formatVND} from "app/utils/helper";
import { TransactionStatus, TransactionType } from "app/models/commons/transaction.model";
import { MemberWallet } from "app/models/commons/member.model";
import DynamicWebView from "app/components/DynamicWebView";
import { useSelector } from "react-redux";
import {showMessage} from 'react-native-flash-message';

function TransactionDetailScreen(props) {
	const isFocused = useIsFocused();
	const settings = useSelector(state => state.SettingsReducer.options)
	const transactionId = props.route.params.id;
	const [refresh, setRefresh] = useState(false);
	const [showSpinner, setShowSpinner] = useState(true);
	const [transactionInfo, setTransactionInfo] = useState(false);
	useEffect(() => {
		props.navigation.setOptions({
			title: 'Chi tiết giao dịch',
			headerStyle: {
				backgroundColor: '#2ea65d',
			},
			headerTintColor: '#fff',
			headerLeft: () => (
				<View style={tw`flex flex-row items-center`}>
					<TouchableOpacity
						activeOpacity={1}
						onPress={() => props.navigation.goBack()}
					>
						<Icon name="chevron-left"
						      size={23}
						      style={tw`text-white ml-3`}
						/>
					</TouchableOpacity>
				</View>
			),
		})
	}, [])
	useEffect(() => {
		if (isFocused) {
			async function getData() {
				const Token = await AsyncStorage.getItem('sme_user_token');
				axios({
					method: 'get',
					url: `${apiConfig.BASE_URL}/member/transactions/${transactionId}`,
					headers: { Authorization: `Bearer ${Token}` }
				}).then(function(response) {
					if (response.status === 200) {
						setTransactionInfo(response.data)
						setRefresh(false)
						setShowSpinner(false)
					}
				}).catch(function(error) {
					//history.push('/404')
					console.log(error);
					setRefresh(false)
					setShowSpinner(false)
				})
			}

			getData();
		}
	}, [refresh, isFocused, transactionId])

	console.log('transactionInfo', transactionInfo);

	if (transactionInfo && transactionInfo.transaction && transactionInfo.transaction.paymentInfo) {
		var paymentInfo = JSON.parse(transactionInfo.transaction.paymentInfo)
	}

	const copyToClipboard = (value) => {
		Clipboard.setString(value)
		showMessage({
			message: 'Đã sao chép vào bộ nhớ tạm',
			type: 'success',
			icon: 'success',
			duration: 1500,
		});
	}

	return (
		!transactionInfo ?
			<Spinner
				visible={showSpinner}
				textContent={'Đang tải..'}
				textStyle={{ color: '#FFF' }}
			/> :
		<View style={tw`h-full`}>
			<ScrollView
				showsVerticalScrollIndicator={false}
				overScrollMode={'never'}
				scrollEventThrottle={16}
				refreshControl={
					<RefreshControl
						refreshing={refresh}
						onRefresh={() => setRefresh(true)}
						title="đang tải"
						titleColor="#000"
						tintColor="#000"
					/>
				}
			>
				<View style={tw`mb-10 bg-white mt-5`}>
					{transactionInfo.transaction.amount > 0 &&
						<View style={tw`flex items-center justify-between flex-row px-3 py-3 border-b border-gray-200`}>
							<Text style={tw`font-medium`}>
								Số tiền
							</Text>
							<Text
								style={tw`font-medium text-base ${transactionInfo.transaction.kind === 'IN' ? 'text-blue-500' : 'text-red-600'}`}>
								{transactionInfo.transaction.kind === 'IN' ? '+' : '-'}{formatVND(transactionInfo.transaction.amount)}
							</Text>
						</View>
					}
					{transactionInfo.transaction.point > 0 &&
						<View style={tw`flex items-center justify-between flex-row px-3 py-3 border-b border-gray-200`}>
							<Text style={tw`font-medium`}>
								Số điểm
							</Text>
							<Text
								style={tw`font-medium text-base ${transactionInfo.transaction.kind === 'IN' ? 'text-blue-500' : 'text-red-600'}`}>
								{transactionInfo.transaction.kind === 'IN' ? '+' : '-'}{displayNumber(transactionInfo.transaction.point)}
							</Text>
						</View>
					}
					<View style={tw`flex items-center justify-between flex-row mx-3 py-3 border-b border-gray-100`}>
						<Text style={tw`font-medium`}>
							Loại giao dịch
						</Text>
						<Text  >
							{transactionInfo.transaction.type}
						</Text>
					</View>
					{transactionInfo.transaction.paymentMethod &&
						<View style={tw`flex items-center justify-between flex-row mx-3 py-3 border-b border-gray-100`}>
							<Text style={tw`font-medium`}>
								Hình thức thanh toán
							</Text>
							<Text>
								{transactionInfo.transaction.paymentMethod}
							</Text>
						</View>
					}
					{transactionInfo.transaction.coinAmount > 0 &&
						<View style={tw`flex items-center justify-between flex-row mx-3 py-3 border-b border-gray-100`}>
							<Text style={tw`font-medium`}>
								Coin Amount
							</Text>
							<Text>
								{transactionInfo.transaction.coinAmount}
							</Text>
						</View>
					}
					{transactionInfo.transaction.hash &&
						<View style={tw`mx-3 py-3 border-b border-gray-100`}>
							<Text style={tw`font-medium`}>
								Hash
							</Text>
							<Text>
								{transactionInfo.transaction.hash}
							</Text>
						</View>
					}
					{transactionInfo.transaction.type === 'Rút tiền' &&
						<View style={tw`bg-blue-50 m-3 border border-blue-500 rounded p-3`}>
							<Text style={tw`font-medium`}>Thông tin nhận tiền:</Text>
							<View style={tw`py-3 border-b border-green-200`}>
								<Text style={tw`font-medium`}>
									Ngân hàng: <Text style={tw`font-normal`}>{paymentInfo.bankName}</Text>
								</Text>
							</View>
							<View style={tw`py-3 border-b border-green-200`}>
								<Text style={tw`font-medium`}>
									Chủ tài khoản: <Text style={tw`font-normal`}>{paymentInfo.bankOwner}</Text>
								</Text>
							</View>
							<View style={tw`py-3 border-b border-green-200`}>
								<Text style={tw`font-medium`}>
									Số tài khoản: <Text style={tw`font-normal`}>{paymentInfo.bankAccount}</Text>
								</Text>
							</View>
						</View>
					}
					{((transactionInfo.transaction.type === 'Đầu tư') || (transactionInfo.transaction.type === 'Nâng cấp tài khoản') || (transactionInfo.transaction.type === 'Nạp tiền') || (transactionInfo.transaction.type === 'Nạp điểm')) && transactionInfo.transaction.status === 'Chờ xác nhận' && transactionInfo.transaction.paymentMethod === 'BankTransfer' &&
						<View style={tw`px-3 mt-5`}>
							<Text  style={tw`py-2 mb-2`}>Quý khách vui lòng thanh toán theo thông tin bên dưới:</Text>
							<View style={tw`mb-5 flex items-center`}>
								<Image source={{uri: `https://img.vietqr.io/image/${settings && settings.pc_bank_code}-${settings && settings.pc_bank_account}-${settings && settings.mk_payment_qr_template}.jpg?amount=${transactionInfo.transaction.bankAmount}&addInfo=SME+${transactionInfo.transaction.id}`}} style={tw`w-32 h-32`} />
							</View>
							<View style={tw`mb-3 border-b border-gray-100 pb-2`}>
								<View style={tw`flex flex-row items-center justify-between mb-2`}>
									<Text>Ngân hàng</Text>
									<Text style={tw`font-medium`} numberOfLines={2}>{settings && settings.pc_bank_name}</Text>
								</View>
								<View style={tw`flex flex-row items-center justify-between mb-2`}>
									<Text>Chủ tài khoản</Text>
									<Text style={tw`font-medium`} numberOfLines={2}>{settings && settings.pc_bank_owner}</Text>
								</View>
								<View style={tw`flex flex-row items-center justify-between mb-2`}>
									<Text>Số tài khoản</Text>
									<View>
										<Text style={tw`font-medium`}>{settings && settings.pc_bank_account}</Text>
										<TouchableOpacity
											onPress={() => copyToClipboard(settings && settings.pc_bank_account)}
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
										<Text
											style={tw`font-medium`}>{transactionInfo && formatVND(transactionInfo.transaction.bankAmount)}</Text>
										<TouchableOpacity
											onPress={() => copyToClipboard(transactionInfo.transaction.bankAmount)}
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
										<Text style={tw`font-medium`}>{transactionInfo.transaction.paymentNote ? transactionInfo.transaction.paymentNote : 'SME'}-{transactionInfo.transaction.id}</Text>
										<TouchableOpacity
											onPress={() => copyToClipboard(`${transactionInfo.transaction.paymentNote ? transactionInfo.transaction.paymentNote : 'SME'}-${transactionInfo.transaction.id}`)}
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
					{transactionInfo.transaction.wallet &&
						<View style={tw`flex items-center justify-between flex-row mx-3 py-3 border-b border-gray-100`}>
							<Text style={tw`font-medium`}>
								Ví
							</Text>
							<Text>
								{transactionInfo.transaction.wallet}
							</Text>
						</View>
					}
					{transactionInfo.transaction.order &&
						<View style={tw`flex items-center justify-between flex-row mx-3 py-3 border-b border-gray-100`}>
							<Text style={tw`font-medium`}>
								Tham chiếu đơn hàng
							</Text>
							<Text  >
								#{transactionInfo.transaction.order && transactionInfo.transaction.order.id}
							</Text>
						</View>
					}
					<View style={tw`flex items-center justify-between flex-row mx-3 py-3 border-b border-gray-100`}>
						<Text style={tw`font-medium`}>
							Trạng thái
						</Text>
						<Text  >
							{transactionInfo.transaction.status}
						</Text>
					</View>
					<View style={tw`flex items-center justify-between flex-row mx-3 py-3 border-b border-gray-100`}>
						<Text style={tw`font-medium`}>
							Thời gian tạo
						</Text>
						<Text  >
							{formatDateTime(transactionInfo.transaction.createdAt)}
						</Text>
					</View>
					{transactionInfo.transaction.updatedAt &&
						<View style={tw`flex items-center justify-between flex-row mx-3 py-3 border-b border-gray-100`}>
							<Text style={tw`font-medium`}>
								Thời gian cập nhật
							</Text>
							<Text  >
								{formatDateTime(transactionInfo.transaction.updatedAt)}
							</Text>
						</View>
					}
					{transactionInfo.transaction.note &&
						<View style={tw`mx-3 py-3`}>
							<Text style={tw`font-medium mb-1`}>
								Ghi chú
							</Text>
							<Text  >
								{transactionInfo.transaction.note}
							</Text>
						</View>
					}
				</View>
			</ScrollView>
		</View>
	);
}

export default TransactionDetailScreen;
