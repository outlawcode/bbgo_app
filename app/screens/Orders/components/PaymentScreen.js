import React, {useState} from "react";
import {Text, TouchableOpacity, View} from "react-native";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {displayNumber, formatVND} from "app/utils/helper.js";
import {useSelector} from "react-redux";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import {showMessage} from "react-native-flash-message";

function PaymentScreen(props) {
  const {navigation, orderId, backScreen, amount, receiver, onRefresh} = props;
  const [paymentMethod, setPaymentMethod] = useState('RewardWallet')
  const currentUser = useSelector(state => state.memberAuth.user);
  const settings = useSelector(state => state.SettingsReducer.options);
  const [loading, setLoading] = useState(false)

  async function handlePayment() {
    setLoading(true)
    const token = await AsyncStorage.getItem('sme_user_token');
    return axios({
      method: 'post',
      url: `${apiConfig.BASE_URL}/member/order/pay-online-order`,
      data: {
        name: receiver && receiver.name,
        email: receiver && receiver.email,
        phone: receiver && receiver.phone,
        address: receiver && receiver.address,
        orderIds: JSON.stringify([orderId]),
        paymentMethod
      },
      headers: {Authorization: `Bearer ${token}`}
    }).then(function (response) {
      if (response.status === 201) {
        setLoading(false)
        navigation.navigate(backScreen, {
          id: orderId
        })
        onRefresh()
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
    <View style={tw`bg-white h-full`}>
      <View style={tw`flex bg-gray-100 min-h-full content-between`}>
        <View style={tw`mx-3 my-5 border-blue-200 border bg-blue-50 p-3 flex items-center rounded`}>
          <Icon name={'credit-card-outline'} size={32} style={tw`text-green-600`} />
          <Text>Thanh toán đơn hàng #{orderId}</Text>
          <Text style={tw`mt-3 font-medium`}>Tổng tiền: {formatVND(amount)}</Text>
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
        <View style={tw`absolute bottom-0 bg-white w-full pb-10 pt-3 shadow-lg px-3`}>
          <View style={tw`flex items-center justify-between flex-row`}>
            <TouchableOpacity
              disabled={loading}
              style={tw`${loading ? 'bg-gray-300' :'bg-green-600'} px-3 py-2 rounded flex items-center flex-row justify-between`}
              onPress={() => handlePayment()}
            >
              <Text  style={tw`text-white font-bold uppercase`}>Xác nhận thanh toán</Text>
              <Icon name={"chevron-right"} style={tw`text-white mr-1`} size={18}/>
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`bg-red-50 px-3 py-2 rounded flex items-center justify-between flex-row`}
              onPress={() => props.navigation.navigate(backScreen, {
                id: orderId
              })}
            >
              <Text  style={tw`text-red-500 font-bold uppercase`}>Quay lại</Text>
            </TouchableOpacity>
          </View>

        </View>

      </View>
    </View>
  );
}

export default PaymentScreen;
