import React, { useEffect, useRef, useState } from "react";
import { Image, Keyboard, Platform, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import CartIcon from "app/screens/Cart/components/cartIcon";
import { useDispatch, useSelector } from "react-redux";
import * as ImagePicker from "react-native-image-picker"
import ActionSheet from 'react-native-actionsheet';
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import * as yup from 'yup';
import apiConfig from "app/config/api-config";
import { showMessage } from "react-native-flash-message";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Field, Formik } from "formik";
import CustomInput from "app/components/CustomInput";
import { updateAccount } from "app/screens/Auth/action";
import DropDownPicker from "react-native-dropdown-picker";
import { banks } from "app/utils/bankList";

function PaymentSettingScreen(props) {
	const dispatch = useDispatch()
	const currentUser = useSelector(state => state.memberAuth.user);
	const [loading, setLoading] = useState(true);
	const [bankName, setBankName] = useState(currentUser && currentUser.bankName)
	const [bankCode, setBankCode] = useState(currentUser && currentUser.bankCode)
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
	}, [dispatch])

	useEffect(() => {
		props.navigation.setOptions({
			title: 'Thông tin nhận thanh toán',
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

	const settingValidationSchema = yup.object().shape({

	})

	function handleUpdate(values) {
		Keyboard.dismiss();
		dispatch(updateAccount( {
			bankAccount: values.bankAccount,
			bankOwner: values.bankOwner,
			bankName,
			bankCode,
		}))
	}

	console.log(bankName);
	console.log(bankCode);

	return (
		<View style={tw`flex bg-white p-2 h-full`}>
			<StatusBar barStyle={"dark-content"}/>
			<ScrollView
				showsVerticalScrollIndicator={false}
				scrollEnabled={true}
			>
				<Formik
					initialValues={currentUser && currentUser}
					onSubmit={values => handleUpdate(values)}
					validationSchema={settingValidationSchema}
				>
					{({ handleSubmit, isValid }) => (
						<KeyboardAwareScrollView
							showsVerticalScrollIndicator={false}
							scrollEnabled={true}
							style={tw`mx-3`}
						>
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
								name="bankAccount"
								label="Số tài khoản"
								keyboardType={"numeric"}
							/>
							<Field
								component={CustomInput}
								name="bankOwner"
								label="Chủ tài khoản"
							/>

							<TouchableOpacity
								onPress={handleSubmit}
								style={tw`${!isValid ? 'bg-gray-300' : 'bg-green-600'} p-4 rounded`}
								disabled={!isValid}
							>
								<Text  style={tw`text-white text-center font-medium uppercase`}>Lưu thay đổi</Text>
							</TouchableOpacity>
						</KeyboardAwareScrollView>
					)}
				</Formik>
			</ScrollView>
		</View>
	);
}

export default PaymentSettingScreen;
