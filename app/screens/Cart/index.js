import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Image, RefreshControl, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { emptyCart, removeFromCart, updateCart } from "app/screens/Cart/action";
import { apiClient } from "app/services/client";
import apiConfig, { AppConfig } from "app/config/api-config";
import { formatVND } from "app/utils/helper";
import NumericInput from "react-native-numeric-input";
import { useFocusEffect } from "@react-navigation/native";
import InputSpinner from "react-native-input-spinner";
import axios from "axios";
import AsyncStorage from "@react-native-community/async-storage";
import {groupBy} from "lodash";
import ApiConfig from "app/config/api-config";
import { showMessage } from "react-native-flash-message";

function CartScreen(props) {
	const dispatch = useDispatch();
	const cart = useSelector(state => state.CartReducer);
	const settings = useSelector(state => state.SettingsReducer.options);
	const currentUser = useSelector(state => state.memberAuth.user);
	const [prices, setPrices] = useState([])
	const [refresh, setRefresh] = useState(false)
	const [flag, setFlag] = useState(false)
	const [showDetail, setShowDetail] = useState(false)
	let cartQuantity = 0
	if (cart) {
		var listPrice = cart.items;
		cart.items.map((el) => (
			cartQuantity += el.quantity
		))
	}

	async function getPriceCalc(productPrice, quantity, shopId) {
		const token = await AsyncStorage.getItem('sme_user_token');
		return axios({
			method: 'get',
			url: `${apiConfig.BASE_URL}/member/order/calcPrice`,
			params: {
				productPrice,
				quantity,
				shopId
			},
			headers: {Authorization: `Bearer ${token}`}
		}).then(function(response) {
			if (response.status === 200) {
				return response.data
			}
		}).catch((function(error) {
			console.log(error);
			dispatch(emptyCart())
		}))
	}

	useFocusEffect(
		React.useCallback(() => {
			if (currentUser) {
				async function calcPrice() {
					const totalListPrice = listPrice && listPrice.map((el) => {
						return getPriceCalc(el.productPrice, el.quantity, el.shopId);
					})
					setPrices(await Promise.all(totalListPrice))
					setRefresh(false)
				}
				calcPrice()
			}
		}, [dispatch, refresh, flag, cart])
	)

	function handleChangeQuantity(Item) {
		dispatch(updateCart(Item))
		setFlag(!flag)
	}

	useEffect(() => {
		props.navigation.setOptions({
			title: 'Giỏ hàng',
			headerStyle: {
				backgroundColor: '#2ea65d',
			},
			headerTintColor: '#fff',
			headerLeft: () => (
				<TouchableOpacity
					activeOpacity={1}
					onPress={() => props.navigation.goBack()}>
					<Icon name="chevron-left"
					      size={26}
					      style={tw`text-white ml-3`}
					/>
				</TouchableOpacity>
			),
			headerRight: () => (
				<View style={tw`flex flex-row items-center`}>
					<TouchableOpacity
						activeOpacity={1}
						onPress={handleEmptyCart}
					>
						<Icon name="delete-forever"
						      size={23}
						      style={tw`text-white mr-3`}
						/>
					</TouchableOpacity>
				</View>
			)
		})
	}, [])

	function handleEmptyCart() {
		Alert.alert(
			'Xoá tất cả sản phẩm trong giỏ hàng?',
			'',
			[
				{
					text: 'Huỷ',
					onPress: () => console.log('No, continue buying'),
				},
				{
					text: 'Xoá bỏ',
					onPress: () => dispatch(emptyCart()),
					style: 'cancel',
				},
			],
			{cancelable: false},
		)
	}

	let subTotal = 0;
	let quantity = 0;
	let discount = 0;
	let nccDiscount = 0;
	let totalAmount = 0;
	let vatAmount = 0;
	prices && prices.length > 0 && prices.map((el) => {
		if (Number(el.quantity) === 0) {
			dispatch(removeFromCart(el.id))
		}
		subTotal += Number(el.subTotal)
		quantity += Number(el.quantity)
		discount += Number(el.totalDiscount)
		nccDiscount += Number(el.nccDiscount)
		totalAmount += (Number(el.subTotal) - Number(el.totalDiscount))
		vatAmount += Number(el.vatAmount)
	})

	const lastAmount = Number(totalAmount) + Number(vatAmount)

	if (prices && prices.length > 0) {
		var grouped = groupBy(prices, price => price.shop && price.shop.name);
	}

	if (grouped) {
		var groupArr = Object.entries(grouped);
	}

	const checkoutCall = async (items) => {
		const token = await AsyncStorage.getItem('sme_user_token');
		return axios({
			method: 'post',
			url: `${apiConfig.BASE_URL}/member/order/create-online`,
			data: {
				items: JSON.stringify(items),
				shopId: Number(items[0].shop.id)
			},
			headers: {Authorization: `Bearer ${token}`}
		}).then(function (response) {
			if (response.status === 201) {
				return response.data
			}
		}).catch(function(error){
			showMessage({
				message: error.response.data.message,
				type: 'danger',
				icon: 'danger',
				duration: 3000,
			});
			console.log(error);
		})
	}

	async function handleCheckout() {
		const totalOrders = groupArr && groupArr.map((el) => {
			return checkoutCall(el[1]);
		})
		const resultArr = await Promise.all(totalOrders);

		if (resultArr.length > 0) {
			console.log(resultArr);
			props.navigation.navigate('CheckoutScreen', {
				result: resultArr
			})
		}
	}

	return (
		<>
			<StatusBar barStyle={"light-content"} backgroundColor={'#2ea65d'} />
			{!cart ? <Text>Đang tải</Text> :
				cart.items && cart.items.length > 0 ?
					<View style={tw`flex bg-gray-100 min-h-full content-between`}>
						<ScrollView
							showsVerticalScrollIndicator={false}
							overScrollMode={'never'}
							scrollEventThrottle={16}
							refreshControl={
								<RefreshControl
									refreshing={refresh}
									onRefresh={() => setRefresh(true)}
									title="đang tải"
									titleColor="#000"
									tintColor="#000"
								/>
							}
						>
							<View style={tw`pb-52`}>
								<View>
									{groupArr && groupArr.length > 0 &&
										<View>
											{groupArr.map((el, index) => (
												<View style={tw`mb-5 bg-white`}>
													{el[0] &&
														<View style={tw`border-b border-gray-100 p-3 flex flex-row items-center`}>
															<Icon name={"store"} size={16} style={tw`mr-2 text-green-600`} />
															<Text style={tw`font-medium`}>{el[0]}</Text>
														</View>
													}
													{el[1].length > 0 && el[1].map((item) => (
														<View style={tw`relative rounded mx-3 mb-3 bg-white p-3`}>
															<View style={tw`flex flex-row items-center`} key={index}>
																<View style={tw`mr-3`}>
																	<Image
																		source={{ uri: item.image }}
																		style={tw`w-26 h-26`}
																	/>
																</View>
																<View>
																	<View style={tw`mb-3`}>
																		<Text
																			style={tw`font-medium mb-1 mr-26`}
																			numberOfLines={2}
																			ellipsizeMode={"tail"}
																		>
																			{item.name}
																		</Text>
																		<Text
																			style={tw`font-medium text-red-600`}
																		>
																			{item.price && formatVND(item.price)}
																		</Text>
																		<Text
																			style={tw`text-xs italic`}>Kho: {item.inStock} sản
																			phẩm</Text>
																	</View>
																	<InputSpinner
																		max={item.inStock}
																		min={1}
																		step={1}
																		height={40}
																		width={150}
																		style={tw`shadow-none border border-gray-200`}
																		skin={"square"}
																		colorMax={"#f04048"}
																		colorMin={"#cbcbcb"}
																		value={Number(item.quantity)}
																		onChange={(num) => {
																			//handleChangeQuantity(item.id, num)
																			handleChangeQuantity({
																				productPrice: item.id,
																				quantity: num,
																				inStock: Number(item.inStock),
																				productId: item.productId,
																				shopId: item.shop.id
																			})
																		}}
																	/>

																</View>
															</View>
															<View style={tw`absolute top-0 left-0`}>
																<TouchableOpacity
																	style={tw`flex flex-row items-center bg-red-600 p-1 rounded-tl rounded-br`}
																	onPress={() => dispatch(removeFromCart(item.id))}
																>
																	<Icon name={"minus-circle"} style={tw`text-white`} />
																	<Text style={tw`text-white text-xs`}>Xoá</Text>
																</TouchableOpacity>
															</View>
														</View>
													))}
												</View>
											))}

										</View>
									}
								</View>
							</View>
						</ScrollView>

						{
							currentUser && currentUser ?

								<>
									<View
										style={tw`absolute bottom-0 android:bottom-14 bg-white w-full pt-1 pb-5 shadow-lg px-3`}>
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
														<Text>Tổng</Text>
														<Text>{formatVND(Number(subTotal) + Number(nccDiscount))}</Text>
													</View>
													{nccDiscount > 0 &&
														<View
															style={tw`flex flex-row items-center justify-between mb-2 border-b border-gray-100 pb-2`}>
															<Text>Khuyến mại từ Nhà cung cấp</Text>
															<Text
																style={tw`text-red-500`}>-{formatVND(nccDiscount)}</Text>
														</View>
													}
													<View
														style={tw`flex flex-row items-center justify-between mb-2 border-b border-gray-100 pb-2`}>
														<Text>Tạm tính (Đã bao gồm VAT)</Text>
														<Text>{formatVND(Number(subTotal) + Number(vatAmount))}</Text>
													</View>
													{discount > 0 &&
														<View
															style={tw`flex flex-row items-center justify-between mb-2 border-b border-gray-100 pb-2`}>
															<Text>E-voucher giảm giá</Text>
															<Text
																style={tw`text-red-500`}>-{formatVND(discount)}</Text>
														</View>
													}
												</View>
											}
											<View style={tw`flex flex-row items-center justify-between mb-1`}>
												<Text>Tổng tiền</Text>
												<Text
													style={tw`text-green-600 text-base font-bold`}>{formatVND(lastAmount)}</Text>
											</View>
										</View>
										<View>
											<TouchableOpacity
												style={tw`bg-green-600 px-5 py-3 rounded w-full flex items-center justify-between`}
												onPress={() => handleCheckout()}
											>
												<Text style={tw`text-white font-bold uppercase`}>đặt hàng</Text>
											</TouchableOpacity>
										</View>
									</View>
								</>

								:
								<>
									<View style={tw`absolute bottom-0 bg-white w-full py-3 shadow-lg px-3`}>
										<TouchableOpacity
											onPress={() => props.navigation.navigate('Login')}
											style={tw`bg-orange-500 px-5 py-3 rounded flex items-center`}
										>
											<Text style={tw`text-white uppercase font-medium`}>Đăng nhập để đặt
												hàng</Text>
										</TouchableOpacity>
									</View>
								</>
						}

					</View>
					:
					<View style={tw`flex items-center content-center py-30`}>
						<Icon name={"shopping-outline"} size={50} style={tw`mb-5 text-gray-500`} />
						<Text style={tw`mb-5`}>Chưa có sản phẩm trong giỏ hàng</Text>
						<TouchableOpacity
							onPress={() => props.navigation.navigate('Products')}
							style={tw`bg-green-600 px-5 py-2 rounded`}
						>
							<Text style={tw`text-white`}>Bắt đầu mua sắm</Text>
						</TouchableOpacity>
					</View>
			}
		</>

	);
}

export default CartScreen;
