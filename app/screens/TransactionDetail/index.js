import React, {useEffect, useState} from "react";
import {Clipboard, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import {useIsFocused} from "@react-navigation/native";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Spinner from "react-native-loading-spinner-overlay/src";
import {formatAddress, formatBalance, formatDateTime, formatVND} from "app/utils/helper";
import {useSelector} from "react-redux";
import {showMessage} from 'react-native-flash-message';
import {useWalletConnectModal} from "@walletconnect/modal-react-native";
import {ethers} from "ethers";

function TransactionDetailScreen(props) {
	const isFocused = useIsFocused();
	const settings = useSelector(state => state.SettingsReducer.options)
	const transactionId = props.route.params.id;
	const [refresh, setRefresh] = useState(false);
	const [showSpinner, setShowSpinner] = useState(true);
	const [transactionInfo, setTransactionInfo] = useState(false);
	const [loading, setLoading] = useState(false);
	const [connecting, setConnecting] = useState(false);
	const [disabled, setDisabled] = useState(false);

	const {signer, open, isConnected, provider, address} =
		useWalletConnectModal();

	const connect = async () => {
		try {
			setConnecting(true);
			console.log('Starting connection process...');

			// Only try to disconnect if we have an active session
			if (provider && isConnected) {
				try {
					console.log('Disconnecting active session');
					await provider.disconnect();
					console.log('Disconnected existing session');
					// Wait for disconnect to complete
					await new Promise(resolve => setTimeout(resolve, 1000));
				} catch (disconnectError) {
					console.log('Disconnect error:', disconnectError);
					// Continue anyway even if disconnect fails
				}
			} else {
				console.log('No active session to disconnect');
			}

			console.log('Opening wallet selector...');

			// Directly open the wallet selector
			await open();

			console.log('Wallet selector opened');

			// Monitor connection status with longer timeout
			const connectionTimer = setTimeout(() => {
				if (!isConnected && connecting) {
					console.log('Connection timeout');
					setConnecting(false);
					showMessage({
						message: 'Kết nối ví MetaMask bị hết thời gian. Vui lòng thử lại.',
						type: 'warning',
						icon: 'warning',
						duration: 3000,
					});
				}
			}, 60000); // Increase timeout to 1 minute

			return () => clearTimeout(connectionTimer);
		} catch (e) {
			console.error('Connection error:', e);
			setConnecting(false);
			showMessage({
				message: 'Không thể kết nối ví: ' + (e.message || 'Lỗi không xác định'),
				type: 'danger',
				icon: 'danger',
				duration: 3000,
			});
		}
	};

	const disconnect = async () => {
		try {
			if (isConnected) {
				await provider?.disconnect();
			}
		} catch (e) {
			console.error(e);
		}
	};

	// Add a separate effect to monitor connection changes with better debug info
	useEffect(() => {
		console.log('⭐️ Connection state changed:', isConnected ? 'CONNECTED' : 'DISCONNECTED');
		console.log('⭐️ Wallet address:', address || 'None');
		console.log('⭐️ Provider status:', provider ? 'Available' : 'Not available');

		if (isConnected) {
			setConnecting(false);
			showMessage({
				message: 'Ví đã được kết nối!',
				type: 'success',
				icon: 'success',
				duration: 3000,
			});
		}
	}, [isConnected, address]);

	useEffect(() => {
		props.navigation.setOptions({
			title: 'Chi tiết giao dịch',
			headerStyle: {
				backgroundColor: '#008A97',
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

	const sendToken = async () => {
		const transferABI = [
			{
				name: 'transfer',
				type: 'function',
				inputs: [
					{
						name: '_to',
						type: 'address'
					},
					{
						type: 'uint256',
						name: '_tokens'
					},
				],
				constant: false,
				outputs: [{
					name: 'success',
					type: 'bool'
				}],
				payable: false,
			},
		];
		const tokenContract = settings && settings.point_contract_address;
		const to = settings && settings.received_main_wallet;
		const amount = Math.floor(
			(Number(transactionInfo && transactionInfo.transaction.point)) *
			100,
		) / 100;

		try {
			console.log('Số lượng token cần chuyển:', amount);

			const token = new ethers.Contract(tokenContract, transferABI, signer);
			const data = token.interface.encodeFunctionData('transfer', [
				to,
				ethers.utils.parseUnits(amount, 18),
			]);

			// Use consistent chain ID format
			const chainId = '0x38'; // BSC Mainnet

			const transactionParameters = {
				from: address,
				to: tokenContract,
				data: data,
				chainId: chainId
			};

			setLoading(true);
			console.log('Đang gửi yêu cầu ký giao dịch...');

			// Add a timeout to provide fallback if MetaMask doesn't respond
			const txPromise = provider.request(
				{
					method: 'eth_sendTransaction',
					params: [transactionParameters],
				},
				'eip155:56'
			);

			// Set a timeout for the transaction
			const timeoutPromise = new Promise((_, reject) => {
				setTimeout(() => reject(new Error('Yêu cầu giao dịch đã hết thời gian')), 30000);
			});

			const txHash = await Promise.race([txPromise, timeoutPromise]);
			console.log('Giao dịch đã được gửi, hash:', txHash);

			setLoading(false);
			return txHash;
		} catch (e) {
			setLoading(false);
			console.error('Lỗi giao dịch:', e);

			// Xử lý thông báo lỗi người dùng thân thiện
			let errorMessage = 'Có lỗi xảy ra, vui lòng thử lại!';

			if (e.message) {
				if (e.message.includes('user rejected') || e.message.includes('User denied')) {
					errorMessage = 'Giao dịch đã bị từ chối.';
				} else if (e.message.includes('insufficient funds')) {
					errorMessage = 'Số dư không đủ để thực hiện giao dịch.';
				} else if (e.message.toLowerCase().includes('timeout')) {
					errorMessage = 'Yêu cầu giao dịch đã hết thời gian.';
				}
			}

			showMessage({
				message: errorMessage,
				type: 'danger',
				icon: 'danger',
				duration: 3000,
			});
		}
	};

	async function handlePayment() {
		try {
			console.log('Sending token transaction...');
			const txtHash = await sendToken();
			console.log('Transaction hash:', txtHash);

			if (txtHash) {
				const token = await AsyncStorage.getItem('sme_user_token');
				axios
					.post(
						apiConfig.BASE_URL + '/member/transactions/pay',
						{
							transactionId,
							hash: txtHash
						},
						{headers: {Authorization: `Bearer ${token}`}}
					)
					.then(response => {
						showMessage({
							message: 'Đang xác nhận thanh toán, vui lòng chờ xác thực từ blockchain!',
							type: 'success',
							icon: 'success',
							duration: 3000,
						});
						props.navigation.navigate('TransactionDetail', {
							id: response.data.id,
						});
						setDisabled(false);
					})
					.catch(error => {
						showMessage({
							message: error.response.data.message,
							type: 'danger',
							icon: 'danger',
							duration: 3000,
						});
						setDisabled(false);
					});
			}
		} catch (error) {
			console.error('Transaction error:', error);
			showMessage({
				message: 'Có lỗi xảy ra khi gửi giao dịch, vui lòng thử lại sau!',
				type: 'danger',
				icon: 'danger',
				duration: 3000,
			});
			setDisabled(false);
		}
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
				{transactionInfo && transactionInfo.transaction.status === 'Chờ thanh toán' && transactionInfo.transaction.type === 'Nạp điểm' &&
					<View style={tw`mb-5 bg-white px-3 pb-3`}>
						<View style={tw`mt-3 flex flex-row items-center`}>
							<Icon name={"wallet"} size={20} style={tw`text-yellow-400 mr-1`} />
							<Text style={tw`text-gray-500`}>Vui lòng kết nối ví và thanh toán giao dịch</Text>
						</View>


						{(loading || connecting) && (
							<View style={tw`p-2 mb-3 bg-yellow-50 rounded`}>
								<Text style={tw`text-yellow-800`}>
									{connecting ? 'Đang kết nối ví...' : 'Đang xử lý giao dịch...'}
								</Text>
							</View>
						)}

						<TouchableOpacity
							key={`connect-button-${isConnected ? 'connected' : 'disconnected'}-${connecting ? 'connecting' : 'idle'}`}
							disabled={loading || connecting}
							style={tw`bg-green-600 px-5 py-4 mt-3 rounded w-full flex items-center justify-between ${(loading || connecting) ? 'opacity-70' : ''}`}
							onPress={async () => {
								console.log('Button pressed, isConnected:', isConnected);

								if (!isConnected) {
									console.log('Initiating wallet connection');
									await connect();
								} else {
									console.log('Submitting form');
									handlePayment();
								}
							}}
						>
							<Text style={tw`text-white font-bold uppercase`}>
								{!isConnected
									? (connecting ? 'Đang kết nối...' : 'Kết nối ví')
									: 'Xác nhận'}
							</Text>
						</TouchableOpacity>
						{isConnected && (
							<View
								style={tw`flex items-center justify-between mt-5 flex-row bg-gray-700 p-2 rounded`}
							>
								<View style={tw`flex items-center flex-row`}>
									<Icon name="wallet"
										  size={24}
										  style={tw`text-white mr-3`}
									/>
									<View>
										<Text style={tw`text-gray-400`}>Đã kết nối</Text>
										<Text style={tw`text-white font-medium text-base`}>{formatAddress(address)}</Text>
									</View>
								</View>

								<TouchableOpacity
									style={tw`bg-red-500 rounded flex items-center justify-between p-2`}
									onPress={disconnect}
								>
									<Text style={tw`text-white font-bold uppercase`}>
										Ngắt kết nối
									</Text>
								</TouchableOpacity>
							</View>
						)}
					</View>
				}
				<View style={tw`mb-10 bg-white`}>
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
								style={tw`font-medium text-base ${transactionInfo.transaction.kind === 'IN' ? 'text-cyan-600' : 'text-red-600'}`}>
								{transactionInfo.transaction.kind === 'IN' ? '+' : '-'}{formatBalance(transactionInfo.transaction.point)} {settings && settings.point_code}
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
