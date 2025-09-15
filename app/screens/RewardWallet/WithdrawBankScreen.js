import React, {useEffect, useState} from "react";
import {Text, TouchableOpacity, View,} from "react-native";
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
import DropDownPicker from 'react-native-dropdown-picker';
import CurrencyInput from "react-native-currency-input";

function WithdrawBankScreen(props) {
	const currentUser = useSelector(state => state.memberAuth.user);
	const [bankName, setBankName] = useState(currentUser && currentUser.bankName);
	const [bankCode, setBankCode] = useState(currentUser && currentUser.bankCode);
	const [open, setOpen] = useState(false);
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
				wallet: props.wallet
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
			<View style={tw`bg-white ios:pt-14 android:pt-4 pb-4 flex-row items-center`}>
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
								<DropDownPicker
									style={tw`rounded border border-gray-300 mb-3`}
									open={open}
									value={bankCode}
									items={listBank}
									setOpen={setOpen}
									//setValue={setBankName}
									onSelectItem={(e) =>{
										setBankName(e.name)
										setBankCode(e.code)
									}}
									searchable={true}
									searchPlaceholder="Tìm kiếm..."
									placeholder="Chọn ngân hàng"
									schema={{
										label: 'name',
										value: 'code'
									}}
									searchTextInputStyle={{
										color: "#000",
										borderRadius: 0,
										height: 30
									}}
								/>

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

								{/*<Field
									component={CustomInput}
									required
									name="amount"
									label="Số tiền muốn rút"
									keyboardType={"numeric"}
								/>*/}

								<View style={tw`mb-5`}>
									<Text style={tw`mb-1 font-medium text-gray-500`}>Số tiền cần rút</Text>
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
								</View>

								<TouchableOpacity
									disabled={disabled}
									style={tw`bg-green-600 px-5 py-4 mt-3 rounded w-full flex items-center justify-between`}
									onPress={handleSubmit}
								>
									<Text  style={tw`text-white font-bold uppercase`}>Đặt lệnh rút tiền</Text>
								</TouchableOpacity>
							</View>
						</View>

					</KeyboardAwareScrollView>
				)}
			</Formik>
		</View>
	);
}

export default WithdrawBankScreen;
