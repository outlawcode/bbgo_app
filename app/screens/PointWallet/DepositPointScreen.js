import React, {useState} from "react";
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

function DepositPointScreen(props) {
	const currentUser = useSelector(state => state.memberAuth.user);
	const [cashAmount, setCashAmount] = useState(null);
	const [disabled, setDisabled] = useState(false)
	const settings = useSelector(state => state.SettingsReducer.options);

	const InvestmentSchema = Yup.object().shape({})

	async function handleCreateInvest(values) {
		setDisabled(true)
		const token = await AsyncStorage.getItem('sme_user_token');
		axios.post(apiConfig.BASE_URL+'/member/transactions/deposit', {
				point: cashAmount,
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

	return (
		<View>
			<View style={tw`bg-white ios:pt-4 android:pt-4 pb-4 flex-row items-center`}>
				<TouchableOpacity
					onPress={() => props.navigation.navigate(props.backScreen)}
					style={tw`mr-3 ml-3`}
				>
					<Icon name="close" size={26}/>
				</TouchableOpacity>
				<Text  style={tw`font-medium uppercase`}>Nạp điểm</Text>
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
							<View style={tw`mt-5 mb-3 mx-3`}>
								<View style={tw`bg-cyan-50 rounded p-3 relative`}>
									<Icon name={"help-circle"} size={20} style={tw`text-cyan-700 absolute -top-2 -left-2`}/>
									<Text style={tw`text-cyan-700`}>Tạo giao dịch nạp điểm sau đó kết nối ví và thanh toán</Text>
								</View>
							</View>
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

					</KeyboardAwareScrollView>
				)}
			</Formik>
		</View>
	);
}

export default DepositPointScreen;
