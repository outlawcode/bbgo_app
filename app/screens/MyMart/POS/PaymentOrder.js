import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import { showMessage } from "react-native-flash-message";
import tw from "twrnc";
import QRCode from "react-native-qrcode-svg";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import messaging from "@react-native-firebase/messaging";

function PaymentOrder(props) {
  const {orderId, onClose, settings} = props;
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(null);

  useEffect(() => {
      let timeId = null;
      
      async function getData() {
        setIsChecking(true);
        const Token = await AsyncStorage.getItem('sme_user_token');
        try {
          const response = await axios({
            method: 'get',
            url: `${apiConfig.BASE_URL}/member/order/${orderId}`,
            headers: { Authorization: `Bearer ${Token}` }
          });
          
          if (response.status === 200) {
            if (response.data && response.data.order) {
              if (response.data.order.status === 'Hoàn thành') {
                showMessage({
                  message: 'Hoá đơn đã được thanh toán thành công!',
                  type: 'success',
                  icon: 'success',
                  duration: 3000,
                });
                onClose()
                return; // Exit early to prevent further polling
              }
            }
          }
          setLastCheckTime(new Date().toLocaleTimeString());
        } catch (error) {
          console.log(error);
          showMessage({
            message: 'Có lỗi xảy ra, vui lòng thử lại hoặc liên hệ hỗ trợ!',
            type: 'danger',
            icon: 'danger',
            duration: 3000,
          });
        } finally {
          setIsChecking(false);
        }
      }

    // Reduced polling interval from 5s to 2s for better responsiveness
    timeId = setInterval(() => {
      getData()
    }, 2000)

    // Initial check
    getData();

    return () => {
      if (timeId) {
        clearInterval(timeId);
      }
    };
  }, [orderId])

  // Handle push notification for immediate update
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('PaymentOrder received push notification:', remoteMessage);
      
      // Check if notification is for this order (type is 'order' and slug matches orderId)
      if (remoteMessage.data && 
          remoteMessage.data.type === 'order' && 
          remoteMessage.data.slug === orderId.toString()) {
        
        console.log('Notification matches current order:', orderId);
        
        // If it's an offline order completion notification, close modal immediately
        const title = remoteMessage.notification?.title || '';
        if (title.includes('offline hoàn thành') || title.includes('đã được thanh toán')) {
          console.log('Order payment completed via push notification');
          showMessage({
            message: 'Hoá đơn đã được thanh toán thành công!',
            type: 'success',
            icon: 'success',
            duration: 3000,
          });
          onClose();
        }
      }
    });

    return unsubscribe;
  }, [orderId, onClose]);

  return (
    <View style={tw`p-5`}>
      <View style={tw`bg-white py-3 flex items-center rounded relative`}>
        <QRCode
          size={150}
          value={settings && settings.mk_website_url + '/member/pay-order/' + orderId}
        />
        <Text style={tw`text-center mt-5`}>Sử dụng ứng dụng SME Mart để quét và thanh toán đơn hàng #{orderId}.</Text>
        
        {/* Loading indicator */}
        <View style={tw`mt-3 flex-row items-center`}>
          {isChecking ? (
            <>
              <Icon name="loading" size={16} style={tw`text-blue-500 mr-2`} />
              <Text style={tw`text-blue-500 text-sm`}>Đang kiểm tra thanh toán...</Text>
            </>
          ) : (
            lastCheckTime && (
              <Text style={tw`text-gray-400 text-xs`}>
                Kiểm tra lần cuối: {lastCheckTime}
              </Text>
            )
          )}
        </View>
      </View>
      <View style={tw`flex items-center mt-3`}>
        <TouchableOpacity
          onPress={() => onClose()}
          style={tw`flex items-center flex-row bg-red-50 border border-red-200 px-3 py-2 rounded`}
        >
          <Icon name={"close"} style={tw`text-red-500`} size={18} />
          <Text style={tw`font-medium text-red-500 ml-1`}>Đóng lại</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default PaymentOrder;
