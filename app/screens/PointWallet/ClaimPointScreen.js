import React, {useEffect, useState} from "react";
import {Text, TouchableOpacity, View,} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import * as Yup from "yup";
import apiConfig from "app/config/api-config";
import {showMessage} from "react-native-flash-message";
import {Formik} from "formik";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import {useSelector} from "react-redux";
import CurrencyInput from "react-native-currency-input";
import {useWalletConnectModal} from "@walletconnect/modal-react-native";
import {formatAddress} from "app/utils/helper";

function ClaimPointScreen(props) {
	const currentUser = useSelector(state => state.memberAuth.user);
	const [cashAmount, setCashAmount] = useState(null);
	const [disabled, setDisabled] = useState(false)
	const [loading, setLoading] = useState(false)
	const settings = useSelector(state => state.SettingsReducer.options);
	const [connecting, setConnecting] = useState(false);

	const [cryptoWallet, setCryptoWallet] = useState(null);

	const InvestmentSchema = Yup.object().shape({})

	async function handleCreateInvest(values) {
		setDisabled(true)
		const token = await AsyncStorage.getItem('sme_user_token');
		axios.post(apiConfig.BASE_URL+'/member/transactions/claim-point', {
				amount: cashAmount,
				token: values.verifyCode,
				cryptoWallet,
			},
			{headers: {Authorization: `Bearer ${token}`}})
			.then((response) => {
			showMessage({
				message: 'Đã tạo giao dịch nạp điểm, vui lòng thanh toán!',
				type: 'success',
				icon: 'success',
				duration: 3000,
			});
			props.navigation.navigate('TransactionDetail', {id: response.data.id});
			setDisabled(false)
		}).catch(error => {
			showMessage({
				message: error.response.data.message,
				type: 'danger',
				icon: 'danger',
				duration: 3000,
			});
			setDisabled(false)
		})
	}

	if (currentUser) {
		var initialValues = {}
	}

	const feePercent = Number(settings && settings.claimpoint_fee_percent);

	const [calculatedFee, setCalculatedFee] = useState(0);
	const [lastAmount, setLastAmount] = useState(0);

	// Calculate the fee dynamically
	useEffect(() => {
		if (settings && feePercent && cashAmount <= Number(props.balance)) {
			const fee = (cashAmount * feePercent) / 100;
			setCalculatedFee(fee);
			setLastAmount(cashAmount - fee)
		} else {
			setCalculatedFee(0);
			setLastAmount(cashAmount)
		}
	}, [settings, feePercent, cashAmount]);

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
			setCryptoWallet(address)
			setConnecting(false);
			showMessage({
				message: 'Ví đã được kết nối!',
				type: 'success',
				icon: 'success',
				duration: 3000,
			});
		}
	}, [isConnected, address]);

	return (
		<View>
			<View style={tw`bg-white ios:pt-4 android:pt-4 pb-4 flex-row items-center`}>
				<TouchableOpacity
					onPress={() => props.navigation.navigate(props.backScreen)}
					style={tw`mr-3 ml-3`}
				>
					<Icon name="close" size={26}/>
				</TouchableOpacity>
				<Text  style={tw`font-medium uppercase`}>Rút điểm</Text>
			</View>
			<Formik
				initialValues={initialValues}
				onSubmit={values => handleCreateInvest(values)}
				validationSchema={InvestmentSchema}
			>
				{({handleSubmit, values, setFieldValue, isValid}) => (
					<KeyboardAwareScrollView
						keyboardShouldPersistTaps={"handled"}
					>
						{!isConnected && !address ?
							<View style={tw`mb-5 bg-white px-3 pb-3`}>
								<View style={tw`mt-3 flex flex-row items-center`}>
									<Icon name={"wallet"} size={20} style={tw`text-yellow-400 mr-1`} />
									<Text style={tw`text-gray-500`}>Vui lòng kết nối ví để thực hiện giao dịch rút điểm</Text>
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
										}
									}}
								>
									<Text style={tw`text-white font-bold uppercase`}>
										{!isConnected
											? (connecting ? 'Đang kết nối...' : 'Kết nối ví')
											: 'Xác nhận'}
									</Text>
								</TouchableOpacity>
							</View>
							:

							<View style={tw`pb-32`}>

								<View style={tw`mt-5 mb-3 mx-3`}>
									<View style={tw`bg-cyan-50 rounded p-3 relative`}>
										<Icon name={"help-circle"} size={20} style={tw`text-cyan-700 absolute -top-2 -left-2`}/>
										<Text style={tw`text-cyan-700`}>Rút điểm về ví đã kết nối của bạn.</Text>
									</View>
								</View>

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

								<View style={tw`px-3 py-5 my-3 bg-white`}>
									<View style={tw`mb-4`}>
										<Text style={tw`mb-1 font-medium text-gray-700`}>Số điểm</Text>
										<CurrencyInput
											value={cashAmount}
											onChangeValue={setCashAmount}
											suffix={settings && settings.point_code}
											delimiter=","
											separator="."
											precision={2}
											minValue={0}
											onChangeText={(formattedValue) => {
												console.log(formattedValue); // R$ +2.310,46
											}}
											style={tw`border border-gray-300 p-3 rounded text-base`}
										/>
									</View>

									<TouchableOpacity
										disabled={disabled}
										style={tw`bg-cyan-600 px-5 py-4 mt-3 rounded w-full flex items-center justify-between`}
										onPress={handleSubmit}
									>
										<Text  style={tw`text-white font-bold uppercase`}>Xác nhận</Text>
									</TouchableOpacity>
								</View>
							</View>
						}

					</KeyboardAwareScrollView>
				)}
			</Formik>
		</View>
	);
}

export default ClaimPointScreen;
