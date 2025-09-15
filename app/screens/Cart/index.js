import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Image, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { emptyCart, removeFromCart, updateCart } from "app/screens/Cart/action";
import apiConfig from "app/config/api-config";
import { formatVND, displayNumber, numberToWords } from "app/utils/helper";
import InputSpinner from "react-native-input-spinner";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showMessage } from "react-native-flash-message";
import { useFocusEffect } from '@react-navigation/native';

function CartScreen(props) {
	const dispatch = useDispatch();
	const cart = useSelector(state => state.CartReducer);
	const settings = useSelector(state => state.SettingsReducer.options);
	const currentUser = useSelector(state => state.memberAuth.user);
	const [result, setResult] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [stockAlert, setStockAlert] = useState(null);
	const [showDetail, setShowDetail] = useState(false);

	console.log('cartX', cart);

	// Get cart data safely
	const listPrice = cart ? cart.items : [];

	// Reset transient states whenever the screen comes back into focus
	useFocusEffect(
		React.useCallback(() => {
			// If cart is empty, ensure we show empty cart state
			if (!cart.items || cart.items.length === 0) {
				setResult({ prices: [] });
				setLoading(false);
			}
			// Always hide any previous order detail when re-entering cart
			setShowDetail(false);
		}, [cart.items])
	);

	// Load cart with calcPrice API
	async function loadCart() {
		setLoading(true);

		// Get current cart from Redux state
		const currentListPrice = cart.items || [];

		if (!currentListPrice || currentListPrice.length === 0) {
			setResult({ prices: [] });
			setLoading(false);
			return;
		}

		console.log(currentListPrice);

		// Calculate price using API
		const token = await AsyncStorage.getItem('sme_user_token');
		try {
			const response = await axios.post(`${apiConfig.BASE_URL}/member/order/calcPrice`, {
				orderItems: currentListPrice,
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
			setError(true);
			setLoading(false);
		}
	}

	// Load cart when component mounts or cart items change
	useEffect(() => {
		if (cart.items && cart.items.length > 0) {
			loadCart();
		} else {
			setResult({ prices: [] });
			setLoading(false);
		}
	}, [cart.items]);

	// Handle quantity change
	function handleChangeQuantity(id, qty) {
		const Item = {
			productId: id,
			quantity: qty,
		};
		if (qty > 0 && qty !== null && typeof qty !== 'undefined') {
			dispatch(updateCart(Item));
		} else {
			showMessage({
				message: 'Vui lòng chọn số lượng cho sản phẩm',
				type: 'danger',
				icon: 'danger',
				duration: 3000,
			});
		}
	}

	useEffect(() => {
		props.navigation.setOptions({
			title: 'Giỏ hàng',
			headerStyle: {
				backgroundColor: '#008A97',
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

	// Navigate to checkout
	function handleNextToCheckout() {
		if (!currentUser) {
			props.navigation.navigate('Login');
			return;
		}

		props.navigation.navigate('Checkout', {
			cartData: result,
			cartItems: listPrice
		});
	}

	// Check if cart is empty
	const isCartEmpty = !result || !result.prices || result.prices.length === 0;

	return (
		<>
			<StatusBar barStyle={"light-content"} backgroundColor={'#008A97'} />
				<View style={tw`flex-1 bg-gray-50`}>
					{/* Stock Alert */}
					{stockAlert && (
						<View style={tw`mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg`}>
							<Text style={tw`text-red-700 font-medium`}>{stockAlert.message}</Text>
							{stockAlert.stockInfo && (
								<View style={tw`mt-2`}>
									{stockAlert.stockInfo.outOfStockItems.map((item, idx) => (
										<Text key={idx} style={tw`text-red-600 text-sm`}>
											• {item.productName}: Đã hết hàng
										</Text>
									))}
									{stockAlert.stockInfo.insufficientStockItems.map((item, idx) => (
										<Text key={idx} style={tw`text-red-600 text-sm`}>
											• {item.productName}: Yêu cầu {item.requestedQuantity}, còn lại {item.availableStock}
										</Text>
									))}
								</View>
							)}
						</View>
					)}

					{!isCartEmpty ? (
						<>
							<ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
								<View style={tw`p-3`}>
									<Text style={tw`text-gray-600 mb-4`}>
										Bạn đang có <Text style={tw`font-medium`}>{result.prices.length}</Text> sản phẩm trong giỏ hàng
									</Text>

									{/* Cart Items */}
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
														onChange={(num) => handleChangeQuantity(item.id || item.productId, num)}
														disabled={item.stockStatus === 'OUT_OF_STOCK'}
													/>
												</View>

												<TouchableOpacity
													style={tw`absolute -top-2 -right-2`}
													onPress={() => dispatch(removeFromCart(item.id || item.productId))}
												>
													<Icon name="close-circle" size={20} style={tw`text-red-600`} />
												</TouchableOpacity>
											</View>
										))}
									</View>
								</View>
							</ScrollView>

							{/* Price Summary and Checkout */}
							<View style={tw`bg-white border-t border-gray-200 p-3`}>
								<View>
									<TouchableOpacity
										style={tw`flex-row items-center justify-center`}
										onPress={() => setShowDetail(!showDetail)}
									>
										<Icon name={showDetail ? 'chevron-down' : 'chevron-up'} size={24} style={tw`text-gray-500`} />
									</TouchableOpacity>

									{showDetail && (
										<View>
											<View style={tw`flex-row justify-between mb-2 pb-2 border-b border-gray-100`}>
												<Text>Tạm tính</Text>
												<Text>{formatVND(result.subTotal || 0)}</Text>
											</View>

											{result.productDiscount && result.productDiscount.amount > 0 && (
												<View style={tw`flex-row justify-between mb-2 pb-2 border-b border-gray-50`}>
													<Text>{result.productDiscount.description || 'Giảm giá SP'}</Text>
													<Text style={tw`text-red-600`}>-{formatVND(result.productDiscount.amount)}</Text>
												</View>
											)}

											{result.positionDiscount && result.positionDiscount.amount > 0 && (
												<View style={tw`flex-row justify-between mb-2 pb-2 border-b border-gray-50`}>
													<Text>{result.positionDiscount.description || `Chiết khấu (${result.positionDiscount.percent || 0}%)`}</Text>
													<Text style={tw`text-red-600`}>-{formatVND(result.positionDiscount.amount)}</Text>
												</View>
											)}

											{result.shipping && !result.shipping.isFree && (
												<View style={tw`flex-row justify-between mb-2 pb-2 border-b border-gray-50`}>
													<Text>Phí vận chuyển</Text>
													<Text style={tw`text-blue-600`}>+{formatVND(result.shipping.fee || 0)}</Text>
												</View>
											)}

											{result.totalRewardToken > 0 && (
												<View style={tw`flex-row justify-between mb-2 pb-2 border-b border-gray-100`}>
													<Text style={tw`text-gray-600`}>🎁 Tặng</Text>
													<Text style={tw`text-cyan-600 font-medium`}>
														+{result.totalRewardToken} {settings && settings.point_code}
													</Text>
												</View>
											)}
										</View>
									)}

									<View style={tw`flex-row justify-between mb-3`}>
										<Text style={tw`font-medium text-base text-gray-600`}>Tổng tiền</Text>
										<Text style={tw`text-cyan-600 font-bold text-base`}>
											{formatVND(Number(result.finalAmount || result.lastAmount))}
										</Text>
									</View>

									<TouchableOpacity
										style={tw`bg-red-500 py-3 rounded-lg flex items-center`}
										onPress={handleNextToCheckout}
									>
										<View style={tw`flex flex-row items-center`}>
											<Text style={tw`text-white font-medium uppercase`}>Tiếp theo</Text>
											<Icon name={"arrow-right"} style={tw`ml-2 text-white`} size={18} />
										</View>
									</TouchableOpacity>
								</View>
							</View>
						</>
					) : (
						<View style={tw`flex-1 justify-center items-center p-8`}>
							<Icon name="cart-off" size={80} style={tw`text-gray-200 mb-4`} />
							<Text style={tw`text-gray-500 text-lg mb-6 text-center`}>Chưa có sản phẩm trong giỏ hàng</Text>
							<TouchableOpacity
								onPress={() => props.navigation.navigate('Products')}
								style={tw`bg-cyan-600 px-6 py-3 rounded-md`}
							>
								<Text style={tw`text-white font-medium`}>Bắt đầu mua sắm</Text>
							</TouchableOpacity>
						</View>
					)}
				</View>
		</>
	);
}

export default CartScreen;
