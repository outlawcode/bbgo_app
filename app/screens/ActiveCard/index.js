import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import { showMessage } from "react-native-flash-message";
import { useDispatch, useSelector } from "react-redux";
import { GetMe } from "app/screens/Auth/action";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Field, Formik } from "formik";
import tw from "twrnc";
import CustomInput from "app/components/CustomInput";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Yup from "yup";

function ActiveCard(props) {
	const dispatch = useDispatch()
	const [cardNumber, setCardNumber] = useState()
	const currentUser = useSelector(state => state.memberAuth.user);

	async function handleActiveCard(values) {
		const token = await AsyncStorage.getItem('sme_user_token');
		axios.post(apiConfig.BASE_URL+'/user/activecard', values,
			{headers: {Authorization: `Bearer ${token}`}})
			.then((response) => {
				showMessage({
					message: `Kích hoạt thành công mã thẻ ${values.cardNumber}`,
					type: 'success',
					icon: 'success',
					duration: 3000,
				});
				dispatch(GetMe(token))
				props.navigation.navigate(props.backScreen)
			}).catch(error => {
			showMessage({
				message: error.response.data.message,
				type: 'danger',
				icon: 'danger',
				duration: 3000,
			});
		})
	}

	const activeCardSchema = Yup.object().shape({
		cardNumber: Yup
			.string()
			.min(6, ({min}) => 'Vui lòng nhập mã thẻ')
			.max(6, ({max}) => 'Vui lòng nhập mã thẻ')
			.required('Vui lòng nhập mã thẻ'),
	})

	return (
		<View>
			<View style={tw`bg-white ios:pt-14 android:pt-4 pb-4 flex-row justify-between items-center`}>
				<Text style={tw`mr-3 ml-3 uppercase font-medium`}>Kích hoạt thẻ</Text>
				<TouchableOpacity
					onPress={() => props.navigation.navigate(props.backScreen)}
					style={tw`mr-3 ml-3`}
				>
					<Icon name="close" size={26}/>
				</TouchableOpacity>
			</View>

			<Formik
				initialValues={{
					refId: currentUser && currentUser.parent && currentUser.parent.refId
				}}
				onSubmit={values => handleActiveCard(values)}
				validationSchema={activeCardSchema}
			>
				{({handleSubmit, values, setFieldValue, isValid}) => (
					<KeyboardAwareScrollView
						keyboardShouldPersistTaps={"handled"}
					>
						<View style={tw`pb-32`}>
							<View style={tw`px-3 py-5 my-3 bg-white`}>
								<Field
									component={CustomInput}
									required
									name="cardNumber"
									label="Mã thẻ"
									keyboardType={"numeric"}
								/>
								{currentUser && !currentUser.parent &&
									<Field
										component={CustomInput}
										name="refId"
										label="Mã giới thiệu"
										keyboardType={"numeric"}
										required={!currentUser.parent}
									/>
								}
								<TouchableOpacity
									style={tw`bg-green-600 px-5 py-4 mt-3 rounded w-full flex items-center justify-between`}
									onPress={handleSubmit}
								>
									<Text  style={tw`text-white font-bold uppercase`}>Kích hoạt thẻ</Text>
								</TouchableOpacity>
							</View>
						</View>
					</KeyboardAwareScrollView>
				)}
			</Formik>
		</View>
	);
}

export default ActiveCard;
