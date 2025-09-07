import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {ScrollView, Text, TouchableOpacity, View} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import {displayNumber, formatVND} from "app/utils/helper";
import {Field, Formik} from "formik";
import * as Yup from 'yup';
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import CustomInput from "app/components/CustomInput";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import {showMessage} from "react-native-flash-message";
import {emptyCart} from "app/screens/Cart/action.js";
import {GetMe} from "app/screens/Auth/action.js";
import Spinner from "react-native-loading-spinner-overlay";
import AddressFields from "app/components/AddressFields";

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

  useEffect(() => {
    props.navigation.setOptions({
      title: 'Thông tin đặt hàng',
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

  const result = state.cartData

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

  async function handleCheckout(values) {
    setLoading(true)
    setShowSpinner(true);
    const token = await AsyncStorage.getItem('sme_user_token');
    return axios({
      method: 'post',
      url: `${apiConfig.BASE_URL}/member/order/create`,
      data: {
        ...values,
        orderItems: state.cartItems,
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
                        {allPaymentMethods.map(method => (
                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={() => setPaymentMethod(method.code)}
                                style={tw`border rounded px-5 py-3 mb-3 border-gray-200 ${paymentMethod === method.code && 'bg-blue-100 border-blue-300'}`}
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
                            {result && result.prices.map((item) => (
                                <View style={tw`flex flex-wrap items-center justify-between py-2 border-b border-gray-100 flex-row`}>
                                  <Text>{item.name} x{item.quantity}</Text>
                                </View>
                            ))}
                          </View>
                        }
                      </View>

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
