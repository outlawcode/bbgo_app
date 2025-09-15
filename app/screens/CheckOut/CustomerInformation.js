import React, {useEffect, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import { formatVND } from "app/utils/helper";
import { Field, Formik } from "formik";
import * as Yup from 'yup';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CustomInput from "app/components/CustomInput";

function CustomerInformation(props) {
	const dispatch = useDispatch();
	const [refresh, setRefresh] = useState(false);
	const [flag, setFlag] = useState(false);
	const state = props.route && props.route.params;
	const [showDetail, setShowDetail] = useState(false)
	const currentUser = useSelector(state => state.memberAuth.user);

	useEffect(() => {
		props.navigation.setOptions({
			title: 'Thông tin đặt hàng',
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
		})
	}, [])

	let initialValues;
	if (currentUser && currentUser) {
		initialValues = {
			name: currentUser && currentUser.name,
			email: currentUser && currentUser.email,
			phone: currentUser && currentUser.phone,
			address: currentUser && currentUser.address,
			referrer: currentUser && currentUser.parent && currentUser.parent.id,
		}
	} else {
		initialValues = {
			name: '',
			email: '',
			phone: '',
			address: '',
			referrer: null,
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

	function handleCheckout(values) {
		const data = {
			orderItems: state && state.orderParams,
			name: values.name,
			phone: values.phone,
			email:values.email,
			address: values.address,
			note: values.note,
			type: state && state.type,
			referrer: state && state.referrer
		}

		props.navigation.navigate('PaymentMethod', {
			checkoutParams: data,
			prices: state.prices,
			subTotal: state.subTotal,
			totalDiscount: state.totalDiscount,
			totalProductDiscount: state.totalProductDiscount,
			discountPercent: state.discountPercent,
			totalAmount: state.subTotal - state.totalDiscount,
		})
	}

	console.log(state);

	return (
		!state ? <Text  >Đang tải</Text> :
		<View style={tw`flex bg-gray-100 min-h-full content-between`}>
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
							<View style={tw`pb-52`}>
								<KeyboardAwareScrollView>
									<View style={tw`bg-white p-3 mb-3`}>
										<View style={tw`mb-2`}>
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

						<View style={tw`absolute bottom-0 android:bottom-14 bg-white w-full pb-5 pt-1 shadow-lg px-3`}>
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
										{/*{state && state.prices && state.prices.length > 0 && state.prices.map((item, index) => (
											<View style={tw`flex flex-row justify-between border-b border-gray-100 pb-2 mb-2`} key={index}>
												<Text style={tw`text-gray-500 w-2/3`}>
													{item.priceDetail.product.name} - {item.priceDetail.name} <Text style={tw`font-bold`}>x {item.quantity}</Text>
												</Text>
												<Text  >{formatVND(item.price)}</Text>
											</View>
										))}*/}
										<View
											style={tw`flex flex-row items-center justify-between mb-2 border-b border-gray-100 pb-2`}>
											<Text>Tạm tính</Text>
											<Text>{formatVND(state.subTotal)}</Text>
										</View>
										{state.totalDiscount > 0 &&
											<View
												style={tw`flex flex-row items-center justify-between mb-2 border-b border-gray-100 pb-2`}>
												<Text>Giảm giá</Text>
												<Text  style={tw`text-red-500`}>-{formatVND(state.totalDiscount)}</Text>
											</View>
										}
										{state.totalProductDiscount > 0 &&
											<View
												style={tw`flex flex-row items-center justify-between mb-2 border-b border-gray-100 pb-2`}>
												<Text>Giảm giá</Text>
												<Text  style={tw`text-red-500`}>-{formatVND(state.totalProductDiscount)}</Text>
											</View>
										}
										{state.totalRewardPoint > 0 &&
											<View
												style={tw`flex flex-row items-center justify-between mb-2 border-b border-gray-100 pb-2`}>
												<Text>Thưởng điểm</Text>
												<Text  style={tw`text-green-500`}>+{formatVND(state.totalRewardPoint)}</Text>
											</View>
										}
									</View>
								}
								<View style={tw`flex flex-row items-center justify-between mb-1`}>
									<Text  >Tổng tiền</Text>
									<Text style={tw`text-green-600 text-base font-bold`}>{formatVND(state.subTotal - state.totalDiscount - state.totalUserKindDiscount - state.totalProductDiscount)}</Text>
								</View>
							</View>
							{state && state.checkOutType && state.checkOutType === 'buynow' &&
								<TouchableOpacity
									style={tw`bg-green-600 px-5 py-3 mb-3 rounded w-full flex items-center justify-between`}
									onPress={() => props.navigation.navigate('ProductDetail', {id: state.prices[0] && state.prices[0].priceDetail && state.prices[0].priceDetail.product && state.prices[0].priceDetail.product.id})}
								>
									<Text style={tw`text-white font-bold uppercase`}>Thay đổi lựa chọn</Text>
								</TouchableOpacity>
							}
							<TouchableOpacity
								style={tw`bg-orange-500 px-5 py-3 rounded w-full flex items-center justify-between`}
								onPress={handleSubmit}
							>
								<Text style={tw`text-white font-bold uppercase`}>Thanh toán</Text>
							</TouchableOpacity>
						</View>
					</>
				)}
			</Formik>
		</View>
	);
}

export default CustomerInformation;
