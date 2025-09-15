import React, { useEffect, useState } from "react";
import {
	KeyboardAvoidingView,
	RefreshControl,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import { apiClient } from "app/services/client";
import { FlatGrid } from "react-native-super-grid";
import ProductItem from "app/components/ProductItem";
import FeatureProductList from "app/screens/Home/components/FeatureProductList";
import * as Yup from "yup";
import apiConfig from "app/config/api-config";
import { showMessage } from "react-native-flash-message";
import { Field, Formik } from "formik";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CustomInput from "app/components/CustomInput";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import { formatNumber, formatVND } from "app/utils/helper";
import { useSelector } from "react-redux";
import SearchableDropdown from 'react-native-searchable-dropdown';
import { banks } from "app/utils/bankList";
import DropDownPicker from 'react-native-dropdown-picker';

function WithdrawBankScreen(props) {
	const currentUser = useSelector(state => state.memberAuth.user);
	const [bankName, setBankName] = useState(currentUser && currentUser.bankName);
	const [bankCode, setBankCode] = useState(currentUser && currentUser.bankCode);
	const [open, setOpen] = useState(false);
	const [listBank, setListBank] = useState([]);

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
		amount: Yup
			.string()
			.min(1, ({min}) => 'Vui lòng nhập số tiền')
			.required('Vui lòng nhập số lượng'),
		bankAccount: Yup
			.string()
			.required('Vui lòng nhập thông tin'),
		bankOwner: Yup
			.string()
			.required('Vui lòng nhập thông tin'),
	})

	async function handleCreateInvest(values) {
		const token = await AsyncStorage.getItem('sme_user_token');
		axios.post(apiConfig.BASE_URL+'/member/transactions/withdraw', {
				amount: values.amount,
				paymentInfo: JSON.stringify({
					bankName, bankCode, bankOwner: values.bankOwner, bankAccount: values.bankAccount
				})
			},
			{headers: {Authorization: `Bearer ${token}`}})
			.then((response) => {
			showMessage({
				message: 'Tạo giao dịch thành công',
				type: 'success',
				icon: 'success',
				duration: 3000,
			});
			props.navigation.navigate('TransactionDetail', {id: response.data.id})
		}).catch(error => {
			showMessage({
				message: error.response.data.message,
				type: 'danger',
				icon: 'danger',
				duration: 3000,
			});
		})
	}

	if (currentUser) {
		var initialValues = {
			amount: Number(currentUser.rewardWallet),
			bankName: currentUser.bankName,
			bankOwner: currentUser.bankOwner,
			bankAccount: currentUser.bankAccount,
		}
	}
	console.log('currentUser', currentUser);
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

								<Field
									component={CustomInput}
									required
									name="amount"
									label="Số tiền muốn rút"
									keyboardType={"numeric"}
								/>
								<TouchableOpacity
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
