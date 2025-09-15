import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
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
import { formatVND } from "app/utils/helper";

function UpgradeAccount(props) {
	const dispatch = useDispatch()
	const [cardNumber, setCardNumber] = useState()
	const currentUser = useSelector(state => state.memberAuth.user);
	const [userKinds, setUserKinds] = useState([])
	const [priceId, setPriceId] = useState(null)

	useEffect(() => {
		async function getData() {
			axios({
				method: 'get',
				url: apiConfig.BASE_URL+'/user-kind',
			}).then(function (response) {
				if (response.status === 200) {
					setUserKinds(response.data);
				}
			}).catch(function(error){
				console.log(error);
			})
		}
		getData();
	}, [dispatch])

	async function handleUpgradeAccount(values) {
		const token = await AsyncStorage.getItem('sme_user_token');
		axios.post(apiConfig.BASE_URL+'/user/upgradeRequest', {
				priceId
			},
			{headers: {Authorization: `Bearer ${token}`}})
			.then((response) => {
				showMessage({
					message: `Đã gửi yêu cầu nâng cấp tài khoản`,
					type: 'success',
					icon: 'success',
					duration: 3000,
				});
				dispatch(GetMe(token))
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
			<View style={tw`bg-white ios:pt-14 android:pt-4 pb-4 flex-row justify-between items-center`}>
				<Text style={tw`mr-3 ml-3 uppercase font-medium`}>Nâng cấp tài khoản</Text>
				<TouchableOpacity
					onPress={() => props.navigation.navigate(props.backScreen)}
					style={tw`mr-3 ml-3`}
				>
					<Icon name="close" size={26}/>
				</TouchableOpacity>
			</View>
			<ScrollView
				showsHorizontalScrollIndicator={false}
			>
				<View style={tw`pb-32`}>
					<View style={tw`px-3 py-5 my-3 bg-white`}>
						<Text style={tw`font-bold text-gray-600 mb-5`}>Xin mời chọn loại thành viên</Text>
						{userKinds && userKinds.map((el, index) => (
							<TouchableOpacity
								onPress={() => setPriceId(el.id)}
								style={tw`flex items-center justify-between flex-row mb-3 bg-blue-50 rounded p-3`}
							>
								<View>
									<Text style={tw`font-medium text-lg`}>{el.name}</Text>
									<Text style={tw`mb-2`}>{formatVND(el.giaban)}</Text>
								</View>
								<View>
									<Icon
										name={el.id === priceId ? 'check-circle' : 'checkbox-blank-circle-outline'}
										size={32}
										style={tw`${el.id === priceId ? 'text-green-500' : 'text-blue-50'}`} />
								</View>
							</TouchableOpacity>
						))}
						{currentUser && !currentUser.userKind &&
							<TouchableOpacity
								style={tw`mt-5 bg-orange-500 flex items-center p-3 rounded`}
								onPress={() => handleUpgradeAccount()}
							>
								<Text style={tw`text-white font-bold uppercase text-base`}>Nâng cấp ngay</Text>
							</TouchableOpacity>
						}
					</View>
				</View>
			</ScrollView>
		</View>
	);
}

export default UpgradeAccount;
