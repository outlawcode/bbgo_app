import React, {useEffect, useState} from "react";
import { Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from 'app/components';
;
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import * as Yup from "yup";
import apiConfig from "app/config/api-config";
import {showMessage} from "react-native-flash-message";
import {Field, Formik} from "formik";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {useDispatch, useSelector} from "react-redux";
import CurrencyInput from "react-native-currency-input";
import {emptyCart, removeFromCart} from "app/screens/Cart/action";
import {GetMe} from "app/screens/Auth/action";
import CustomInput from "app/components/CustomInput";
import AddressFields from "app/components/AddressFields";
import {formatVND} from "app/utils/helper";
import InputSpinner from "react-native-input-spinner";

function BuyNowScreen(props) {
	const dispatch = useDispatch();
	const [disabled, setDisabled] = useState(false)
	const [showDetail, setShowDetail] = useState(false)
	const [showOrders, setShowOrders] = useState(false)
	const [loading, setLoading] = useState(false)
	const [showSpinner, setShowSpinner] = useState(false);
	const currentUser = useSelector(state => state.memberAuth.user);
	const settings = useSelector(state => state.SettingsReducer.options)
	const [paymentMethod, setPaymentMethod] = useState('Chuyển khoản')

	const [provinceId, setProvinceId] = useState(null);
	const [districtId, setDistrictId] = useState(null);
	const [wardId, setWardId] = useState(null);
	const [provinceCode, setProvinceCode] = useState(currentUser && currentUser.provinceCode || null);
	const [provinceName, setProvinceName] = useState(currentUser && currentUser.provinceName || '');
	const [districtCode, setDistrictCode] = useState(currentUser && currentUser.districtCode || null);
	const [districtName, setDistrictName] = useState(currentUser && currentUser.districtName || '');
	const [wardCode, setWardCode] = useState(currentUser && currentUser.wardCode || null);
	const [wardName, setWardName] = useState(currentUser && currentUser.wardName || '');
	const [quantity, setQuantity] = useState(props.item.quantity ? props.item.quantity : 1)
	const [result, setResult] = useState(null)
	const [stockAlert, setStockAlert] = useState(null);

	let initialValues;
	if (currentUser && currentUser) {
		initialValues = {
			name: currentUser && currentUser.name,
			email: currentUser && currentUser.email,
			phone: currentUser && currentUser.phone,
			address: currentUser && currentUser.address,
		}
	} else {
		initialValues = {
			name: '',
			email: '',
			phone: '',
			address: '',
		}
	}

	const OrderSchema = Yup.object().shape({
		email: Yup
			.string()
			.email("Nhập đúng địa chỉ email")
			.required('Vui lòng nhập email'),
		name: Yup
			.string()
			.required('Vui lòng nhập tên'),
		address: Yup
			.string()
			.nullable()
			.required('Vui lòng nhập địa chỉ'),
		phone: Yup
			.string(() => 'Vui lòng nhập đúng số điện thoại')
			.max(10, ({max}) => 'Vui lòng nhập đúng số điện thoại')
			.min(10, ({min}) => 'Vui lòng nhập đúng số điện thoại')
			.required('Vui lòng nhập số điện thoại'),
	})

	const allPaymentMethods = [
		{
			icon: 'bank',
			name: 'Chuyển khoản',
			code: 'Chuyển khoản',
		},
		// tam an dk bct
		{
			icon: 'bank',
			name: `Chuyển khoản + Điểm ${settings && settings.point_code}`,
			code: `Điểm`,
		},
		{
			icon: 'piggy-bank',
			name: `Ví tiết kiệm`,
			code: `Ví tiết kiệm`,
		},
	]

	async function loadCart() {
		setLoading(true);
		// Calculate price using API
		const token = await AsyncStorage.getItem('sme_user_token');
		try {
			const response = await axios.post(`${apiConfig.BASE_URL}/member/order/calcPrice`, {
				orderItems: [{
					productId: props.item.productId,
					quantity,
				}],
			}, {
				headers: { Authorization: `Bearer ${token}` }
			});

			if (response.status === 201) {
				setResult(response.data);

				// Check stock issues from response
				if (response.data.stockInfo && response.data.stockInfo.hasStockIssues) {
					const { outOfStockItems, insufficientStockItems } = response.data.stockInfo;
					let alertMessage = 'Một số sản phẩm có vấn đề về tồn kho:';

					if (outOfStockItems.length > 0) {
						alertMessage += ` ${outOfStockItems.length} sản phẩm đã hết hàng.`;
					}

					if (insufficientStockItems.length > 0) {
						alertMessage += ` ${insufficientStockItems.length} sản phẩm không đủ số lượng.`;
					}

					setStockAlert({
						type: 'error',
						message: alertMessage,
						stockInfo: response.data.stockInfo,
					});
				}

				setLoading(false);
			}
		} catch (err) {
			console.log(err);
			setLoading(false);
		}
	}

	// Load cart when component mounts or cart items change
	useEffect(() => {
		if (quantity > 0) {
			loadCart();
		} else {
			setResult({ prices: [] });
			setLoading(false);
		}
	}, [quantity]);

	async function handleCheckout(values) {
		// Kiểm tra địa chỉ trước khi submit
		if (!provinceCode || !districtCode || !wardCode) {
			showMessage({
				message: 'Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện và Xã/Phường trước khi đặt hàng.',
				type: 'warning',
				icon: 'warning',
				duration: 4000,
			});
			return;
		}

		setLoading(true)
		setShowSpinner(true);
		const token = await AsyncStorage.getItem('sme_user_token');
		return axios({
			method: 'post',
			url: `${apiConfig.BASE_URL}/member/order/create`,
			data: {
				...values,
				orderItems: [{productId: props.item.productId, quantity}],
				paymentMethod,
				provinceCode,
				provinceName,
				districtCode,
				districtName,
				wardCode,
				wardName,
			},
			headers: {Authorization: `Bearer ${token}`}
		}).then(function (response) {
			if (response.status === 201) {
				setLoading(false)
				setShowSpinner(false);
				dispatch(emptyCart());
				dispatch(GetMe(token));
				props.navigation.navigate('OrderDetail', {id: response.data.order.id})
				showMessage({
					message: 'Đặt hàng thành công!',
					type: 'success',
					icon: 'success',
					duration: 3000,
				});
			}
		}).catch(function(error){
			setLoading(false)
			setShowSpinner(false);
			showMessage({
				message: error.response.data.message,
				type: 'danger',
				icon: 'danger',
				duration: 3000,
			});
			console.log(error);
		})
	}

	return (
		<View>
			<View style={tw`bg-white ios:pt-14 android:pt-10 pb-4 flex-row items-center`}>
				<TouchableOpacity
					onPress={() => props.navigation.navigate("ProductDetail", {slug: props.slug})}
					style={tw`mr-3 ml-3`}
				>
					<Icon name="close" size={26}/>
				</TouchableOpacity>
				<Text  style={tw`font-medium uppercase`}>Mua ngay</Text>
			</View>
			{!result ? <Text>Đang tải</Text> :
				<Formik
					initialValues={initialValues}
					onSubmit={values => handleCheckout(values)}
					validationSchema={OrderSchema}
				>
					{({handleSubmit, values, setFieldValue, isValid}) => (
						<>
							<ScrollView
								showsVerticalScrollIndicator={false}
								overScrollMode={'never'}
								scrollEventThrottle={16}
							>
								<View style={tw`pb-96`}>
									<KeyboardAwareScrollView>
										<View style={tw`bg-white rounded-lg shadow-sm border border-gray-200 mb-4`}>
											{result.prices && result.prices.map((item, index) => (
												<View key={index} style={tw`${result.prices.length > 1 && 'border-b border-gray-100'} p-2 relative`}>
													<View style={tw`flex-row items-center justify-between`}>
														<View style={tw`flex-row items-center flex-1`}>
															<Image
																source={{ uri: item.featureImage || 'https://via.placeholder.com/80' }}
																style={tw`w-12 h-12 rounded mr-3`}
															/>

															<View style={tw`flex-1`}>
																<Text style={tw`font-medium text-gray-800 mb-1`} numberOfLines={2}>
																	{item.name || 'Sản phẩm'}
																</Text>
																<Text style={tw`text-gray-500 text-sm mb-1`}>
																	Đơn giá: <Text style={tw`font-medium`}>{formatVND(item.price || 0)}</Text>
																</Text>

																{/* Stock Info */}
																{item.availableStock !== undefined && (
																	<Text style={tw`text-xs ${
																		item.stockStatus === 'OUT_OF_STOCK' ? 'text-red-600' :
																			item.stockStatus === 'LOW_STOCK' ? 'text-orange-600' : 'text-cyan-600'
																	}`}>
																		{item.stockStatus === 'OUT_OF_STOCK' ? '⚠️ Hết hàng' :
																			item.stockStatus === 'LOW_STOCK' ? '⚠️ Sắp hết hàng' : '✅ Còn hàng'}
																		{item.availableStock > 0 && ` (Còn ${item.availableStock})`}
																	</Text>
																)}
															</View>
														</View>

														<InputSpinner
															max={item.availableStock > 0 ? item.availableStock : undefined}
															min={1}
															step={1}
															height={36}
															width={112}
															style={tw`shadow-none`}
															skin="circle"
															colorMax="#f04048"
															colorMin="#cbcbcb"
															value={Number(item.quantity || 1)}
															inputStyle={{ fontSize: 16, paddingVertical: 0 }}
															buttonTextColor={'#000'}
															onChange={(num) => setQuantity(num)}
															disabled={item.stockStatus === 'OUT_OF_STOCK'}
														/>
													</View>
												</View>
											))}
										</View>

										<View style={tw`bg-white p-3 mb-5`}>
											<View>
												<Text style={tw`mb-3`}>Chọn một trong những phương thức thanh toán sau:</Text>
												{allPaymentMethods.map(method => (
													<TouchableOpacity
														activeOpacity={1}
														onPress={() => setPaymentMethod(method.code)}
														style={tw`border rounded px-5 py-3 my-2 border-gray-200 ${paymentMethod === method.code && 'bg-blue-100 border-blue-300'}`}
													>
														<View style={tw`flex flex-row items-center`}>
															<Icon name={paymentMethod === method.code ? 'radiobox-marked' : 'radiobox-blank'}
																  size={18} style={tw`mr-1 text-cyan-600`} />
															<Text style={tw`font-bold`}>
																{method.name}
															</Text>
														</View>
													</TouchableOpacity>
												))}
											</View>

											{paymentMethod === 'Ví tiết kiệm' && (
												<View>
													{result && result.paymentAmount && result.paymentAmount.find(el => el.method === 'Ví tiết kiệm',) && (
														<View style={tw`p-3 bg-white border border-gray-300 rounded mb-5`}>
															<View style={tw`mb-3`}>
																<Text style={tw`font-medium`}>💳 Thông tin thanh toán ví tiết kiệm</Text>
															</View>
															<View>
																<View style={tw`flex flex-row justify-between border-b border-gray-200 pb-2`}>
																	<Text style={tw`text-gray-600`}>Số tiền thanh toán order:</Text>
																	<Text style={tw`font-medium`}>{result.paymentAmount.find(el => el.method === 'Ví tiết kiệm').amount}</Text>
																</View>
																<View style={tw`flex flex-row justify-between pt-2`}>
																	<Text style={tw`text-gray-700`}>Số dư ví hiện tại:</Text>
																	<Text style={tw`font-medium`}>{result.paymentAmount.find(el => el.method === 'Ví tiết kiệm').balance}</Text>
																</View>
															</View>
															{result.paymentAmount.find(el => el.method === 'Ví tiết kiệm').insufficient && (
																<View style={tw`bg-red-50 border border-red-300 rounded mt-3 p-3`}>
																	<Text style={tw`text-red-600`}>⚠️ Số dư ví tiết kiệm không đủ để thanh toán!</Text>
																</View>
															)}
														</View>
													)}
												</View>
											)}

											{paymentMethod === 'Điểm' && (
												<View>
													{result && result.paymentInfo && result.paymentInfo.insufficientPoints && (
														<View style={tw`mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded`}>
															<Text style={tw`text-yellow-700 text-sm`}>
																⚠️ Số dư ví điểm không đủ. Bạn sẽ thanh toán 100% bằng tiền mặt.
															</Text>
														</View>
													)}
													
													{result && result.paymentAmount && result.paymentAmount.filter(el => el.method !== 'Ví tiết kiệm').length > 0 && (
														<View style={tw`p-3 bg-white border border-gray-300 rounded mb-5`}>
															<View style={tw`mb-3`}>
																<Text style={tw`font-medium`}>💳 Thông tin thanh toán Chuyển khoản + BBX</Text>
															</View>
															<View>
																{result.paymentAmount.filter(el => el.method !== 'Ví tiết kiệm').map((el, index) => (
																	<View key={index} style={tw`flex flex-row justify-between border-b border-gray-200 pb-2 mb-2`}>
																		<Text style={tw`text-gray-600`}>
																			{el.method === 'Chuyển khoản' ? 'Chuyển khoản' : el.method}:
																		</Text>
																		<Text style={tw`font-medium text-cyan-600`}>{el.amount}</Text>
																	</View>
																))}
															</View>
														</View>
													)}
												</View>
											)}
										</View>

										{/* Cảnh báo địa chỉ */}
										{(!provinceCode || !districtCode || !wardCode) && (
											<View style={tw`mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded`}>
												<Text style={tw`text-yellow-700 text-sm text-center`}>
													⚠️ Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện và Xã/Phường
												</Text>
											</View>
										)}

										<View style={tw`bg-white p-3 mb-3`}>
											<View style={tw`mb-2`}>
												<View style={tw`mb-2 flex flex-row items-center`}>
													<Icon name={"truck-delivery"} size={20} style={tw`mr-2 text-orange-500`} />
													<Text style={tw`font-medium`}>Thông tin nhận hàng</Text>
												</View>
												<View>
													<Field
														component={CustomInput}
														required
														name="name"
														label="Họ tên"
													/>
													<Field
														component={CustomInput}
														required
														name="phone"
														label="Số điện thoại"
														keyboardType={'numeric'}
													/>
													<Field
														component={CustomInput}
														required
														name="email"
														label="Email"
														keyboardType={'email-address'}
													/>
													<AddressFields
														currentData={{
															provinceCode: provinceCode,
															districtCode: districtCode,
															wardCode: wardCode
														}}
														onProvinceChange={(province) => {
															setProvinceId(province.id);
															setProvinceCode(province.code);
															setProvinceName(province.name);
															// Reset district and ward when province changes
															setDistrictId(null);
															setDistrictCode(null);
															setDistrictName('');
															setWardId(null);
															setWardCode(null);
															setWardName('');
														}}
														onDistrictChange={(district) => {
															setDistrictId(district.id);
															setDistrictCode(district.code);
															setDistrictName(district.name);
															// Reset ward when district changes
															setWardId(null);
															setWardCode(null);
															setWardName('');
														}}
														onWardChange={(ward) => {
															setWardId(ward.id);
															setWardCode(ward.code);
															setWardName(ward.name);
														}}
													/>
													<Field
														component={CustomInput}
														required
														name="address"
														label="Địa chỉ"
													/>
													<Field
														component={CustomInput}
														name="note"
														label="Ghi chú đơn hàng"
														textarea
														multiline={true}
														numberOfLines={12}
														textAlignVertical="top"
													/>
												</View>
											</View>
										</View>
									</KeyboardAwareScrollView>
								</View>
							</ScrollView>

							<View style={tw`absolute bottom-52 android:bottom-48 bg-white w-full pb-5 pt-1 shadow-lg px-3`}>
								<View style={tw`mb-2`}>
									<View style={tw`flex items-center content-center`}>
										<TouchableOpacity
											onPress={() => setShowDetail(!showDetail)}
										>
											<Icon name={showDetail ? 'chevron-down' : 'chevron-up'} size={30} />
										</TouchableOpacity>
									</View>
									{showDetail &&
										<View>
											<View
												style={tw`flex flex-row items-center justify-between mb-2 border-b border-gray-100 pb-2`}>
												<Text>Tạm tính</Text>
												<Text>{formatVND(Number(result.subTotal))}</Text>
											</View>
											{result.productDiscount &&
												result.productDiscount.amount > 0 > 0 &&
												<View
													style={tw`flex flex-row items-center justify-between mb-2 border-b border-gray-100 pb-2`}>
													<Text>{result.productDiscount
															.description ||
														'Giảm giá SP'}</Text>
													<Text  style={tw`text-red-500`}>-
														{formatVND(
															result.productDiscount
																.amount,
														)}</Text>
												</View>
											}
											{result.positionDiscount &&
												result.positionDiscount.amount > 0 &&
												<View
													style={tw`flex flex-row items-center justify-between mb-2 border-b border-gray-100 pb-2`}>
													<Text>{result.positionDiscount
															.description ||
														`Chiết khấu (${
															result
																.positionDiscount
																.percent
														}%)`}</Text>
													<Text  style={tw`text-red-600`}>-
														{formatVND(
															result.positionDiscount
																.amount,
														)}</Text>
												</View>
											}
											{result.totalRewardToken > 0 &&
												<View
													style={tw`flex flex-row items-center justify-between mb-2 border-b border-gray-100 pb-2`}>
													<Text>🎁 Tặng</Text>
													<Text  style={tw`text-cyan-600`}> +{result.totalRewardToken}{' '}
														{settings &&
															settings.point_code}</Text>
												</View>
											}
										</View>
									}
									<View style={tw`flex flex-row items-center justify-between mb-1`}>
										<Text>Tổng tiền</Text>
										<Text style={tw`text-green-600 text-base font-bold`}>{formatVND(
											Number(
												result.finalAmount ||
												result.lastAmount,
											),
										)}</Text>
									</View>
								</View>
								<TouchableOpacity
									disabled={loading || showSpinner || !provinceCode || !districtCode || !wardCode}
									style={tw`${loading || !provinceCode || !districtCode || !wardCode ? 'bg-gray-500' : 'bg-orange-500'} px-5 py-3 rounded w-full flex items-center justify-between`}
									onPress={handleSubmit}
								>
									<Text style={tw`text-white font-bold uppercase`}>
										{!provinceCode || !districtCode || !wardCode ? 'Chọn địa chỉ' : 'Thanh toán'}
									</Text>
								</TouchableOpacity>
							</View>
						</>
					)}
				</Formik>
			}
		</View>
	);
}

export default BuyNowScreen;
