import React, {useEffect, useState} from "react";
import {FlatList, Modal, Text, TextInput, TouchableOpacity, View,} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import * as Yup from "yup";
import apiConfig from "app/config/api-config";
import {showMessage} from "react-native-flash-message";
import {Field, Formik} from "formik";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import CustomInput from "app/components/CustomInput";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import {useSelector} from "react-redux";
import CurrencyInput from "react-native-currency-input";
import {formatVND} from "app/utils/helper";

function WithdrawBankScreen(props) {
	const currentUser = useSelector(state => state.memberAuth.user);
	const [bankName, setBankName] = useState(currentUser && currentUser.bankName);
	const [bankCode, setBankCode] = useState(currentUser && currentUser.bankCode);
	const [showBankModal, setShowBankModal] = useState(false);
	const [bankSearch, setBankSearch] = useState('');
	const [cashAmount, setCashAmount] = useState(null);
	const [listBank, setListBank] = useState([]);
	const [disabled, setDisabled] = useState(false)

	useEffect(() => {
		async function getData() {
			axios({
				method: 'get',
				url: 'https://api.vietqr.io/v2/banks',
			}).then(function (response) {
				if (response.status === 200) {
					setListBank(response.data.data);
				}
			}).catch(function(error){
				console.log(error);
			})
		}
		getData();
	}, [])

	const filteredBanks = listBank.filter(bank =>
		bank.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
		bank.code.toLowerCase().includes(bankSearch.toLowerCase())
	);

	const showBankPicker = () => {
		if (!listBank || listBank.length === 0) return;
		setBankSearch('');
		setShowBankModal(true);
	};

	const closeBankModal = () => {
		setShowBankModal(false);
		setBankSearch('');
	};

	const handleBankSelect = (selectedBank) => {
		setBankName(selectedBank.name);
		setBankCode(selectedBank.code);
		closeBankModal();
	};

	const InvestmentSchema = Yup.object().shape({
		bankAccount: Yup
			.string()
			.required('Vui lòng nhập thông tin'),
		bankOwner: Yup
			.string()
			.required('Vui lòng nhập thông tin'),
	})

	async function handleCreateInvest(values) {
		setDisabled(true)
		const token = await AsyncStorage.getItem('sme_user_token');
		axios.post(apiConfig.BASE_URL+'/member/transactions/withdraw', {
				amount: cashAmount,
				paymentInfo: JSON.stringify({
					bankName, bankCode, bankOwner: values.bankOwner, bankAccount: values.bankAccount
				}),
				wallet: props.wallet,
				token: values.verifyCode,
			},
			{headers: {Authorization: `Bearer ${token}`}})
			.then((response) => {
			showMessage({
				message: 'Tạo giao dịch thành công',
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
		var initialValues = {
			bankName: currentUser.bankName,
			bankOwner: currentUser.bankOwner,
			bankAccount: currentUser.bankAccount,
		}
	}

	return (
		<View>
			<View style={tw`bg-white ios:pt-4 android:pt-4 pb-4 flex-row items-center`}>
				<TouchableOpacity
					onPress={() => props.navigation.navigate(props.backScreen)}
					style={tw`mr-3 ml-3`}
				>
					<Icon name="close" size={26}/>
				</TouchableOpacity>
				<Text  style={tw`font-medium uppercase`}>Rút tiền về tài khoản ngân hàng</Text>
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
						<View style={tw`pb-32`}>
							<View style={tw`px-3 py-5 my-3 bg-white`}>
								<View style={tw`mb-4`}>
									<Text style={tw`mb-1 font-medium text-gray-700`}>Số tiền cần rút</Text>
									<CurrencyInput
										value={cashAmount}
										onChangeValue={setCashAmount}
										suffix="đ"
										delimiter=","
										separator="."
										precision={0}
										minValue={0}
										onChangeText={(formattedValue) => {
											console.log(formattedValue); // R$ +2.310,46
										}}
										style={tw`border border-gray-300 p-3 rounded text-base`}
									/>
									<View style={tw`mt-1`}>
										<Text style={tw`text-xs text-gray-500`}>Tối thiểu: {formatVND(props.minimum)} - Khả dụng: {formatVND(props.maximum)}</Text>
										<Text style={tw`text-xs text-gray-500`}>Chỉ được nhập số chẵn đơn vị 100,000</Text>
									</View>
								</View>

								<Field
									component={CustomInput}
									required
									name="verifyCode"
									label="Mã xác thực 2FA"
									keyboardType={"numeric"}
								/>

								<View style={tw`mb-2 flex flex-row items-center border-t border-gray-100 pt-4`}>
									<Icon name={"credit-card"} size={20} style={tw`mr-1 text-cyan-600`} />
									<Text style={tw`font-medium text-gray-700`}>Thông tin nhận tiền</Text>
								</View>

								<View style={tw`mb-4`}>
									<Text style={tw`text-gray-700 text-sm font-medium mb-2`}>
										Ngân hàng *
									</Text>
									<TouchableOpacity
										onPress={showBankPicker}
										style={tw`border border-gray-300 rounded p-3 bg-white flex flex-row items-center justify-between`}
									>
										<Text style={tw`text-base`}>
											{bankName || "Chọn ngân hàng"}
										</Text>
										<Icon name="chevron-down" size={20} style={tw`text-gray-500`} />
									</TouchableOpacity>
								</View>

								<Field
									component={CustomInput}
									required
									name="bankAccount"
									label="Số tài khoản"
									keyboardType={"numeric"}
								/>
								<Field
									component={CustomInput}
									required
									name="bankOwner"
									label="Chủ tài khoản"
								/>

								<TouchableOpacity
									disabled={disabled}
									style={tw`bg-cyan-600 px-5 py-4 mt-3 rounded w-full flex items-center justify-between`}
									onPress={handleSubmit}
								>
									<Text  style={tw`text-white font-bold uppercase`}>Đặt lệnh rút tiền</Text>
								</TouchableOpacity>
							</View>
						</View>

					</KeyboardAwareScrollView>
				)}
			</Formik>

			{/* Bank Selection Modal */}
			<Modal
				visible={showBankModal}
				animationType="slide"
				transparent={true}
				onRequestClose={closeBankModal}
			>
				<View style={tw`flex-1 bg-black bg-opacity-50 justify-end`}>
					<View style={tw`bg-white rounded-t-xl max-h-5/6`}>
						{/* Header */}
						<View style={tw`px-4 py-3 border-b border-gray-200 flex flex-row items-center justify-between`}>
							<Text style={tw`font-bold text-lg text-gray-800`}>Chọn ngân hàng</Text>
							<TouchableOpacity onPress={closeBankModal}>
								<Icon name="close" size={24} style={tw`text-gray-600`} />
							</TouchableOpacity>
						</View>

						{/* Search */}
						<View style={tw`px-4 py-3 border-b border-gray-100`}>
							<View style={tw`flex flex-row items-center border border-gray-300 rounded-lg px-3 py-2`}>
								<Icon name="magnify" size={20} style={tw`text-gray-500 mr-2`} />
								<TextInput
									style={tw`flex-1 text-gray-700`}
									placeholder="Tìm kiếm ngân hàng..."
									value={bankSearch}
									onChangeText={setBankSearch}
								/>
							</View>
						</View>

						{/* List */}
						<FlatList
							data={filteredBanks}
							keyExtractor={(item) => item.code}
							renderItem={({ item }) => (
								<TouchableOpacity
									onPress={() => handleBankSelect(item)}
									style={tw`px-4 py-3 border-b border-gray-100 ${
										item.code === bankCode ? 'bg-cyan-50' : 'bg-white'
									}`}
								>
									<Text style={tw`text-gray-800 font-medium ${
										item.code === bankCode ? 'text-cyan-700' : ''
									}`}>
										{item.name}
									</Text>
									<Text style={tw`text-sm text-gray-500 mt-1`}>
										Mã: {item.code}
									</Text>
								</TouchableOpacity>
							)}
							style={tw`max-h-96`}
							showsVerticalScrollIndicator={true}
						/>
					</View>
				</View>
			</Modal>
		</View>
	);
}

export default WithdrawBankScreen;
