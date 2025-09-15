import React, {useEffect, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import { formatVND, displayNumber } from "app/utils/helper";
import { Field, Formik } from "formik";
import * as Yup from 'yup';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CustomInput from "app/components/CustomInput";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import { showMessage } from "react-native-flash-message";
import { emptyCart } from "app/screens/Cart/action.js";
import { GetMe } from "app/screens/Auth/action.js";
import CheckoutCompleted from "app/screens/CheckOut/CheckoutCompleted.js";
import Spinner from "react-native-loading-spinner-overlay";

function CheckoutScreen(props) {
  const dispatch = useDispatch();
  const [refresh, setRefresh] = useState(false);
  const [flag, setFlag] = useState(false);
  const state = props.route && props.route.params;
  const [showDetail, setShowDetail] = useState(false)
  const [showOrders, setShowOrders] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showSpinner, setShowSpinner] = useState(false);
  const currentUser = useSelector(state => state.memberAuth.user);
  const settings = useSelector(state => state.SettingsReducer.options)
  const [paymentMethod, setPaymentMethod] = useState('RewardWallet')

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

  const result = state.result

  console.log(result);

  let subTotal = 0;
  let discount = 0;
  let nccDiscount = 0;
  let VATAmount = 0;
  let totalAmount = 0;
  let orderIds = []

  if (result) {
    result.map((el) => {
      subTotal += Number(el.revenue);
      discount += Number(el.discount);
      nccDiscount += Number(el.nccDiscount);
      VATAmount += Number(el.VATAmount);
      totalAmount += Number(el.amount);
    })
    orderIds = result.map((el) => {
      return el.id
    })
  }

  async function handleCheckout(values) {
    setLoading(true)
    setShowSpinner(true);
    const token = await AsyncStorage.getItem('sme_user_token');
    return axios({
      method: 'post',
      url: `${apiConfig.BASE_URL}/member/order/pay-online-order`,
      data: {
        ...values,
        orderIds: JSON.stringify(orderIds),
        paymentMethod
      },
      headers: {Authorization: `Bearer ${token}`}
    }).then(function (response) {
      if (response.status === 201) {
        setLoading(false)
        setShowSpinner(false);
        dispatch(emptyCart());
        dispatch(GetMe(token));
        props.navigation.navigate('ModalOverlay', {
          content: <CheckoutCompleted
            result={response.data}
            navigation={props.navigation}
          />
        })
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
    !state ? <Text  >Đang tải</Text> :
      <View style={tw`flex bg-gray-100 min-h-full content-between`}>
        <Spinner
          visible={showSpinner}
          textContent={'Đang xác nhận thanh toán...'}
          textStyle={{ color: '#FFF' }}
        />
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
                      <View style={tw`mb-3`}>
                        <Text style={tw`mb-3`}>Chọn một trong những phương thức thanh toán sau:</Text>
                        <TouchableOpacity
                          activeOpacity={1}
                          onPress={() => setPaymentMethod('RewardWallet')}
                          style={tw`border rounded px-5 py-3 mb-3 border-gray-200 ${paymentMethod === 'RewardWallet' && 'bg-blue-100 border-blue-300'}`}
                        >
                          <View style={tw`flex flex-row items-center`}>
                            <Icon name={paymentMethod === 'RewardWallet' ? 'radiobox-marked' : 'radiobox-blank'}
                                  size={18} style={tw`mr-1 text-green-600`} />
                            <Text style={tw`font-bold`}>
                              Ví tiền thưởng ({currentUser && currentUser && formatVND(currentUser.rewardWallet)})
                            </Text>
                          </View>
                          <Text style={tw`italic text-xs`}>
                            Sử dụng ví tiền thưởng để thanh toán.
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          activeOpacity={1}
                          onPress={() => setPaymentMethod('PointWallet')}
                          style={tw`border rounded px-5 py-3 mb-3 border-gray-200 ${paymentMethod === 'PointWallet' && 'bg-blue-100 border-blue-300'}`}
                        >
                          <View style={tw`flex flex-row items-center`}>
                            <Icon name={paymentMethod === 'PointWallet' ? 'radiobox-marked' : 'radiobox-blank'}
                                  size={18} style={tw`mr-1 text-green-600`} />
                            <Text style={tw`font-bold`}>
                              Ví điểm thưởng ({currentUser && displayNumber(currentUser.pointWallet)} điểm)
                            </Text>
                          </View>
                          <Text style={tw`italic text-xs`}>
                            Sử dụng ví điểm thưởng để thanh toán.
                          </Text>
                          {settings && currentUser && (
                            <Text style={tw`italic text-xs text-gray-500`}>
                              = {formatVND(Number(settings.point_value) * Number(currentUser.pointWallet))}
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>

                      <View style={tw`mb-5`}>
                        <TouchableOpacity
                          onPress={() => setShowOrders(!showOrders)}
                          style={tw`p-3 border border-gray-200 rounded flex flex-row items-center justify-between`}
                        >
                          <Text>
                            Thông tin đơn hàng
                          </Text>
                          <Icon name={showOrders ? 'chevron-down' : 'chevron-right'} />
                        </TouchableOpacity>
                        {showOrders &&
                          <View style={tw`rounded-br rounded-bl p-3 border-r border-l border-b border-gray-200`}>
                            {result && result.map((item) => (
                              <View style={tw`mt-2 border-b border-gray-100`}>
                                <View style={tw`mb-1 flex items-center justify-between flex-row`}>
                                  <Text style={tw`font-medium text-green-600`}>{item.shop && item.shop.name}</Text>
                                  <Text style={tw`font-medium`}>{formatVND(item.revenue)}</Text>
                                </View>
                                <View>
                                  {JSON.parse(item.priceDetails).priceDetail.map((el)=> (
                                    <View style={tw`flex flex-wrap items-center justify-between py-2 border-b border-gray-100 flex-row`}>
                                      <Text>{el.product && el.product.name} x{el.quantity}</Text>
                                      <Text>{formatVND(el.subTotal)}</Text>
                                    </View>
                                  ))}
                                </View>
                              </View>
                            ))}
                          </View>
                        }
                      </View>

                      <View style={tw`mb-2`}>
                        <View style={tw`mb-2`}>
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
                        <Text>{formatVND(Number(subTotal))}</Text>
                      </View>
                      {/*{nccDiscount > 0 &&
                        <View
                          style={tw`flex flex-row items-center justify-between mb-2 border-b border-gray-100 pb-2`}>
                          <Text>Khuyến mãi từ Nhà cung cấp</Text>
                          <Text  style={tw`text-red-500`}>-{formatVND(nccDiscount)}</Text>
                        </View>
                      }*/}
                      {discount > 0 &&
                        <View
                          style={tw`flex flex-row items-center justify-between mb-2 border-b border-gray-100 pb-2`}>
                          <Text>E-voucher giảm giá</Text>
                          <Text  style={tw`text-red-500`}>-{formatVND(discount)}</Text>
                        </View>
                      }
                      {VATAmount > 0 &&
                        <View
                          style={tw`flex flex-row items-center justify-between mb-2 border-b border-gray-100 pb-2`}>
                          <Text>VAT</Text>
                          <Text  style={tw`text-gray-700`}>{formatVND(VATAmount)}</Text>
                        </View>
                      }
                    </View>
                  }
                  <View style={tw`flex flex-row items-center justify-between mb-1`}>
                    <Text>Tổng tiền</Text>
                    <Text style={tw`text-green-600 text-base font-bold`}>{formatVND(totalAmount)}</Text>
                  </View>
                </View>
                {/*{state && state.checkOutType && state.checkOutType === 'buynow' &&
                  <TouchableOpacity
                    style={tw`bg-green-600 px-5 py-3 mb-3 rounded w-full flex items-center justify-between`}
                    onPress={() => props.navigation.navigate('ProductDetail', {id: state.prices[0] && state.prices[0].priceDetail && state.prices[0].priceDetail.product && state.prices[0].priceDetail.product.id})}
                  >
                    <Text style={tw`text-white font-bold uppercase`}>Thay đổi lựa chọn</Text>
                  </TouchableOpacity>
                }*/}
                <TouchableOpacity
                  disabled={loading || showSpinner}
                  style={tw`${loading ? 'bg-gray-500' : 'bg-orange-500'} px-5 py-3 rounded w-full flex items-center justify-between`}
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

export default CheckoutScreen;
