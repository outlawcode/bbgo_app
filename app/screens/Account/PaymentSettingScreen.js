import React, { useEffect, useRef, useState } from "react";
import { Image, Keyboard, Platform, ScrollView, StatusBar, Text, TouchableOpacity, View, Modal, TextInput, FlatList } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import CartIcon from "app/screens/Cart/components/cartIcon";
import { useDispatch, useSelector } from "react-redux";
import * as ImagePicker from "react-native-image-picker"
import ActionSheet from 'react-native-actionsheet';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as yup from 'yup';
import apiConfig from "app/config/api-config";
import { showMessage } from "react-native-flash-message";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Field, Formik } from "formik";
import CustomInput from "app/components/CustomInput";
import { updateAccount } from "app/screens/Auth/action";
import { banks } from "app/utils/bankList";

function PaymentSettingScreen(props) {
	const dispatch = useDispatch()
	const currentUser = useSelector(state => state.memberAuth.user);
	const [loading, setLoading] = useState(true);
	const [bankName, setBankName] = useState(currentUser && currentUser.bankName)
	const [bankCode, setBankCode] = useState(currentUser && currentUser.bankCode)
	const [showBankModal, setShowBankModal] = useState(false);
	const [bankSearch, setBankSearch] = useState('');

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

	// Filtered banks based on search
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
							{/* Bank Selection */}
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
								style={tw`${!isValid ? 'bg-gray-300' : 'bg-cyan-600'} p-4 rounded`}
								disabled={!isValid}
							>
								<Text  style={tw`text-white text-center font-medium uppercase`}>Lưu thay đổi</Text>
							</TouchableOpacity>
						</KeyboardAwareScrollView>
					)}
				</Formik>
			</ScrollView>

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

export default PaymentSettingScreen;
