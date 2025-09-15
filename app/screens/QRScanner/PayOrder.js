import React, {useEffect, useState} from 'react';
import {ActivityIndicator, RefreshControl, ScrollView, StatusBar, Text, TouchableOpacity, View} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import {useIsFocused} from "@react-navigation/native";
import { formatDateTime, formatVND, displayNumber } from "app/utils/helper.js";
import moment from "moment";
import {showMessage} from "react-native-flash-message";
import { useSelector } from "react-redux";

function PayOrder(props) {
    const isFocused = useIsFocused();
    const orderId = props.route.params.id;
    const [error, setError] = useState(false);
    const [result, setResult] = useState(true);
    const [disabled, setDisabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('RewardWallet')
    const currentUser = useSelector(state => state.memberAuth.user);
    const settings = useSelector(state => state.SettingsReducer.options);

    useEffect(() => {
        props.navigation.setOptions({
            title: 'Thanh toán đơn hàng',
            headerStyle: {
                backgroundColor: '#fff',
            },
            headerTintColor: '#000',
            headerLeft: () => (
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => props.navigation.goBack()}>
                    <Icon name="chevron-left"
                          size={32}
                          style={tw`ml-3`}
                    />
                </TouchableOpacity>
            ),
        })
    }, [])

    useEffect(() => {
        if (isFocused) {
            async function getData() {
                const Token = await AsyncStorage.getItem('sme_user_token');
                axios({
                    method: 'get',
                    url: `${apiConfig.BASE_URL}/member/order/${orderId}`,
                    headers: { Authorization: `Bearer ${Token}` }
                }).then(function(response) {
                    if (response.status === 200) {
                        setResult(response.data)
                    }
                }).catch(function(error) {
                    //history.push('/404')
                    console.log(error);
                    setError(true)
                })
            }

            getData();
        }
    }, [isFocused, orderId])

    let receiver = {};
    if (result && result.order) {
        receiver = JSON.parse(result.order.receiver)
    }

    async function handlePayment() {
        setLoading(true)
        const token = await AsyncStorage.getItem('sme_user_token');
        return axios({
            method: 'post',
            url: `${apiConfig.BASE_URL}/member/order/payorder`,
            data: {
                orderId,
                paymentMethod
            },
            headers: {Authorization: `Bearer ${token}`}
        }).then(function (response) {
            if (response.status === 201) {
                setLoading(false)
                props.navigation.navigate('Home')
                showMessage({
                    message: 'Thanh toán đơn hàng thành công!',
                    type: 'success',
                    icon: 'success',
                    duration: 3000,
                });
            }
        }).catch(function(error){
            setLoading(false)
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
        !result ? <ActivityIndicator /> :
            <View>
                <StatusBar barStyle={"dark-content"}/>
                <View style={tw`flex bg-white min-h-full content-between`}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        overScrollMode={'never'}
                        scrollEventThrottle={16}
                    >
                        <View style={tw`pb-32`}>
                            <View style={tw`mb-3 bg-white p-3`}>
                                {error ?
                                    <View style={tw`flex items-center my-5`}>
                                        <Icon name={"layers-search"} size={50} style={tw`mb-3 text-gray-300`} />
                                        <Text  style={tw`text-gray-600`}>Không tìm thấy đơn hàng!</Text>
                                    </View>
                                    :
                                    <View style={tw`py-3`}>
                                        <View style={tw`mx-3 my-5 border-blue-200 border bg-blue-50 p-3 flex items-center rounded`}>
                                            <Icon name={'credit-card-outline'} size={32} style={tw`text-green-600`} />
                                            <Text>Thanh toán đơn hàng #{orderId}</Text>
                                            <Text style={tw`mt-3 font-medium`}>Tạm tính: {formatVND(result && result.order && Number(result.order.amount))}</Text>
                                            {result && result.paymentDiscount > 0 &&
                                              <Text style={tw`mt-3 font-medium text-red-500`}>E-voucher giảm
                                                  giá: -{formatVND(result && result.paymentDiscount)}</Text>
                                            }
                                            <Text style={tw`mt-3 font-medium text-base text-green-600`}>Tổng tiền: {formatVND(result && result.order && Number(result.order.amount) - Number(result.paymentDiscount))}</Text>
                                        </View>

                                        <View style={tw`m-3`}>
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

                                        <View>
                                            <TouchableOpacity
                                                disabled={loading}
                                                onPress={() => handlePayment()}
                                                style={tw`${loading ? 'bg-gray-300' :'bg-green-600'} w-full block py-3 rounded flex items-center`}
                                            >
                                                <Text style={tw`text-white uppercase font-medium text-lg`}>Xác nhận</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                }
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
    );
}

export default PayOrder;
