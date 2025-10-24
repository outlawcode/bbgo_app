import React, {useState} from "react";
import {Text, TouchableOpacity, View} from "react-native";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {displayNumber, formatVND} from "app/utils/helper.js";
import {useSelector} from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import {showMessage} from "react-native-flash-message";

function PaymentScreen(props) {
  const {navigation, orderId, backScreen, amount, receiver, onRefresh} = props;
  const [paymentMethod, setPaymentMethod] = useState('RewardWallet')
  const currentUser = useSelector(state => state.memberAuth.user);
  const settings = useSelector(state => state.SettingsReducer.options);
  const [loading, setLoading] = useState(false)
  
  // Tính toán BBX và số tiền còn lại
  const calculateBBXPayment = () => {
    if (!currentUser || !settings) return { bbxToUse: 0, remainingAmount: amount };
    
    // Sử dụng pointWallet thay vì rewardWallet như trên web
    const userBBX = Number(currentUser.pointWallet) || 0;
    const bbxValue = Number(settings.point_value) || 1; // Giá trị 1 BBX = bao nhiêu VND
    const totalAmount = Number(amount) || 0;
    
    // Tính số BBX có thể sử dụng (không vượt quá số BBX user có)
    const maxBBXCanUse = Math.floor(userBBX);
    const bbxCanUse = Math.min(maxBBXCanUse, Math.floor(totalAmount / bbxValue));
    
    // Tính số tiền BBX sẽ trừ
    const bbxAmount = bbxCanUse * bbxValue;
    
    // Tính số tiền còn lại phải chuyển khoản
    const remainingAmount = totalAmount - bbxAmount;
    
    return {
      bbxToUse: bbxCanUse,
      bbxAmount: bbxAmount,
      remainingAmount: remainingAmount,
      userBBX: userBBX
    };
  };
  
  const bbxCalculation = calculateBBXPayment();

  async function handlePayment() {
    setLoading(true)
    const token = await AsyncStorage.getItem('sme_user_token');
    
    // Chuẩn bị data cho API
    let paymentData = {
      name: receiver && receiver.name,
      email: receiver && receiver.email,
      phone: receiver && receiver.phone,
      address: receiver && receiver.address,
      orderIds: JSON.stringify([orderId]),
      paymentMethod
    };
    
    // Nếu là phương thức Chuyển khoản + BBX, thêm thông tin BBX
    if (paymentMethod === 'BankTransferBBX') {
      paymentData = {
        ...paymentData,
        bbxToUse: bbxCalculation.bbxToUse,
        bbxAmount: bbxCalculation.bbxAmount,
        remainingAmount: bbxCalculation.remainingAmount,
        paymentMethod: 'BankTransfer' // Gửi BankTransfer cho API
      };
    }
    
    return axios({
      method: 'post',
      url: `${apiConfig.BASE_URL}/member/order/pay-online-order`,
      data: paymentData,
      headers: {Authorization: `Bearer ${token}`}
    }).then(function (response) {
      if (response.status === 201) {
        setLoading(false)
        navigation.navigate(backScreen, {
          id: orderId
        })
        onRefresh()
        
        let successMessage = 'Thanh toán đơn hàng thành công!';
        if (paymentMethod === 'BankTransferBBX') {
          successMessage = `Thanh toán thành công! Đã trừ ${bbxCalculation.bbxToUse} BBX, còn lại ${formatVND(bbxCalculation.remainingAmount)} cần chuyển khoản.`;
        }
        
        showMessage({
          message: successMessage,
          type: 'success',
          icon: 'success',
          duration: 4000,
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
          
          {/* Phương thức Chuyển khoản + BBX */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setPaymentMethod('BankTransferBBX')}
            style={tw`border rounded px-5 py-3 mb-3 border-gray-200 ${paymentMethod === 'BankTransferBBX' && 'bg-blue-100 border-blue-300'}`}
          >
            <View style={tw`flex flex-row items-center`}>
              <Icon name={paymentMethod === 'BankTransferBBX' ? 'radiobox-marked' : 'radiobox-blank'}
                    size={18} style={tw`mr-1 text-green-600`} />
              <Text style={tw`font-bold`}>
                Chuyển khoản + BBX
              </Text>
            </View>
            <Text style={tw`italic text-xs mb-2`}>
              Sử dụng kết hợp BBX và chuyển khoản ngân hàng.
            </Text>
            
            {/* Hiển thị chi tiết tính toán */}
            <View style={tw`bg-gray-50 p-3 rounded`}>
              {bbxCalculation.userBBX === 0 ? (
                <View style={tw`bg-red-50 p-2 rounded mb-2`}>
                  <Text style={tw`text-red-600 text-sm text-center`}>
                    ⚠️ Bạn chưa có BBX nào. Vui lòng chọn phương thức thanh toán khác.
                  </Text>
                </View>
              ) : (
                <>
                  <View style={tw`flex flex-row justify-between mb-1`}>
                    <Text style={tw`text-sm`}>Tổng tiền đơn hàng:</Text>
                    <Text style={tw`text-sm font-medium`}>{formatVND(amount)}</Text>
                  </View>
                  
                  <View style={tw`flex flex-row justify-between mb-1`}>
                    <Text style={tw`text-sm`}>BBX hiện có:</Text>
                    <Text style={tw`text-sm font-medium`}>{bbxCalculation.userBBX} BBX</Text>
                  </View>
                  
                  <View style={tw`flex flex-row justify-between mb-1`}>
                    <Text style={tw`text-sm`}>BBX sẽ sử dụng:</Text>
                    <Text style={tw`text-sm font-medium text-blue-600`}>{bbxCalculation.bbxToUse} BBX</Text>
                  </View>
                  
                  <View style={tw`flex flex-row justify-between mb-1`}>
                    <Text style={tw`text-sm`}>Giá trị BBX:</Text>
                    <Text style={tw`text-sm font-medium text-blue-600`}>{formatVND(bbxCalculation.bbxAmount)}</Text>
                  </View>
                  
                  <View style={tw`border-t border-gray-300 pt-1 mt-2`}>
                    <View style={tw`flex flex-row justify-between`}>
                      <Text style={tw`text-sm font-bold`}>Còn lại chuyển khoản:</Text>
                      <Text style={tw`text-sm font-bold text-red-600`}>{formatVND(bbxCalculation.remainingAmount)}</Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>
        <View style={tw`absolute bottom-0 bg-white w-full pb-10 pt-3 shadow-lg px-3`}>
          <View style={tw`flex items-center justify-between flex-row`}>
            <TouchableOpacity
              disabled={loading || (paymentMethod === 'BankTransferBBX' && bbxCalculation.bbxToUse === 0)}
              style={tw`${loading || (paymentMethod === 'BankTransferBBX' && bbxCalculation.bbxToUse === 0) ? 'bg-gray-300' :'bg-green-600'} px-3 py-2 rounded flex items-center flex-row justify-between`}
              onPress={() => handlePayment()}
            >
              <Text  style={tw`text-white font-bold uppercase`}>
                {paymentMethod === 'BankTransferBBX' && bbxCalculation.bbxToUse === 0 ? 'Không đủ BBX' : 'Xác nhận thanh toán'}
              </Text>
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
