import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
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

function CreateInvestmentScreen(props) {
	const InvestmentSchema = Yup.object().shape({
		quantity: Yup
			.string()
			.min(1, ({min}) => 'Vui lòng nhập số lượng')
			.required('Vui lòng nhập số lượng'),
	})

	async function handleCreateInvest(values) {
		const token = await AsyncStorage.getItem('sme_user_token');
		axios.post(apiConfig.BASE_URL+'/customer/transaction/investment', {
				quantity: values.quantity
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
	return (
		<View>
			<View style={tw`bg-white ios:pt-14 android:pt-4 pb-4 flex-row items-center`}>
				<TouchableOpacity
					onPress={() => props.navigation.navigate(props.backScreen)}
					style={tw`mr-3 ml-3`}
				>
					<Icon name="close" size={26}/>
				</TouchableOpacity>
				<Text  style={tw`font-medium uppercase`}>Đầu tư Cổ phần</Text>
			</View>
			<Formik
				initialValues={{}}
				onSubmit={values => handleCreateInvest(values)}
				validationSchema={InvestmentSchema}
			>
				{({handleSubmit, values, setFieldValue, isValid}) => (
					<ScrollView keyboardShouldPersistTaps={"always"}>
						<View style={tw`pb-32`}>
							<View style={tw`px-3 py-5 my-3 bg-white`}>
								<Field
									component={CustomInput}
									required
									name="quantity"
									label="Số lượng cổ phần"
									keyboardType={"numeric"}
									autoFocus
								/>
								<TouchableOpacity
									style={tw`bg-green-600 px-5 py-4 mt-3 rounded w-full flex items-center justify-between`}
									onPress={handleSubmit}
								>
									<Text  style={tw`text-white font-bold uppercase`}>Đầu tư</Text>
								</TouchableOpacity>
								<View style={tw`mt-5`}>
									<Text  style={tw`mb-2`}>Giá trị cổ phần hiện tại: <Text style={tw`font-bold`}>{props.settings && formatVND(props.settings.stock_price)}</Text></Text>
									<Text>Số cổ phần có thể mua: <Text style={tw`font-bold`}>{props.settings && formatNumber(props.settings.stock_available)}</Text></Text>
								</View>
							</View>
						</View>

					</ScrollView>
				)}
			</Formik>
		</View>
	);
}

export default CreateInvestmentScreen;
