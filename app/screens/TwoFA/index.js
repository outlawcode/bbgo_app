import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import { useSelector, useDispatch } from 'react-redux';
import { LoadDataAction } from 'app/screens/Auth/action';
import apiConfig from 'app/config/api-config';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showMessage } from 'react-native-flash-message';
import QRCode from 'react-native-qrcode-svg';
import Clipboard from '@react-native-clipboard/clipboard';

function TwoFAScreen({ navigation }) {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.memberAuth.user);

  const [step, setStep] = useState(1);
  const [verifyCode, setVerifyCode] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [qrInformation, setQrInformation] = useState(null);

  // Redirect if already verified
  useEffect(() => {
    if (currentUser && currentUser.status2FA === 1) {
      navigation.goBack();
    }
  }, [currentUser, navigation]);

  useEffect(() => {
    navigation.setOptions({
      title: 'Xác thực 2FA',
      headerStyle: {
        backgroundColor: '#fff',
      },
      headerTintColor: '#000',
      headerLeft: () => (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => navigation.goBack()}>
          <Icon name="chevron-left"
                size={26}
                style={tw`ml-3`}
          />
        </TouchableOpacity>
      ),
    })
  }, []);

  const handleGenerateQR = async () => {
    setDisabled(true);
    try {
      const token = await AsyncStorage.getItem('sme_user_token');
      const response = await axios.post(
        `${apiConfig.BASE_URL}/user/2fa-generate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        console.log('2FA Generate response:', response.data);
        setQrInformation(response.data);
        setStep(2);
        showMessage({
          message: 'Quét mã QR bằng ứng dụng Google Authenticator',
          type: 'success',
          icon: 'success'
        });
      }
    } catch (error) {
      console.log('Generate QR error:', error);
      showMessage({
        message: error.response?.data?.message || 'Tạo mã QR thất bại',
        type: 'danger',
        icon: 'danger'
      });
    } finally {
      setDisabled(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verifyCode.trim()) {
      showMessage({
        message: 'Vui lòng nhập mã xác thực',
        type: 'danger',
        icon: 'danger'
      });
      return;
    }

    setDisabled(true);
    try {
      const token = await AsyncStorage.getItem('sme_user_token');
      const response = await axios.post(
        `${apiConfig.BASE_URL}/user/2fa-verify`,
        { token: verifyCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        showMessage({
          message: 'Cài đặt 2FA thành công!',
          type: 'success',
          icon: 'success'
        });
        navigation.navigate('Account');
      }
    } catch (error) {
      console.log('Verify 2FA error:', error);
      showMessage({
        message: error.response?.data?.message || 'Xác thực thất bại',
        type: 'danger',
        icon: 'danger'
      });
    } finally {
      setDisabled(false);
    }
  };

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    showMessage({
      message: 'Đã sao chép vào bộ nhớ tạm',
      type: 'success',
      icon: 'success'
    });
  };

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView style={tw`flex-1 px-4 py-4`}>
        {step === 1 ? (
          <View>
            <View style={tw`bg-blue-50 border border-blue-300 rounded-lg p-4 mb-6`}>
              <View style={tw`flex flex-row items-center mb-2`}>
                <Icon name="shield-check" size={20} style={tw`text-blue-600 mr-2`} />
                <Text style={tw`font-bold text-blue-800`}>Bảo mật tài khoản</Text>
              </View>
              <Text style={tw`text-blue-700`}>
                Cài đặt xác thực 2 bước để bảo vệ tài khoản của bạn khỏi các truy cập trái phép.
              </Text>
            </View>

            <View style={tw`bg-white rounded-lg p-4 mb-6`}>
              <Text style={tw`font-bold text-gray-800 text-lg mb-3`}>
                Vì sao tôi cần cài đặt 2FA?
              </Text>
              <View style={tw`space-y-2`}>
                <View style={tw`flex flex-row items-start mb-2`}>
                  <Icon name="check-circle" size={16} style={tw`text-cyan-500 mr-2 mt-1`} />
                  <Text style={tw`text-gray-700 flex-1`}>
                    Rút tiền từ ví tiền về tài khoản ngân hàng
                  </Text>
                </View>
                <View style={tw`flex flex-row items-start mb-2`}>
                  <Icon name="check-circle" size={16} style={tw`text-cyan-500 mr-2 mt-1`} />
                  <Text style={tw`text-gray-700 flex-1`}>
                    Bảo vệ tài khoản khỏi truy cập trái phép
                  </Text>
                </View>
                <View style={tw`flex flex-row items-start mb-2`}>
                  <Icon name="check-circle" size={16} style={tw`text-cyan-500 mr-2 mt-1`} />
                  <Text style={tw`text-gray-700 flex-1`}>
                    Tăng cường bảo mật cho các giao dịch quan trọng
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleGenerateQR}
              disabled={disabled}
              style={tw`${disabled ? 'bg-gray-300' : 'bg-cyan-600'} p-4 rounded-lg`}
            >
              <Text style={tw`text-white text-center font-bold text-base`}>
                {disabled ? 'Đang tạo mã QR...' : 'Bắt đầu cài đặt 2FA'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={tw`pb-20`}>
            <View style={tw`bg-white rounded-lg p-4 mb-3`}>
              <Text style={tw`font-bold text-gray-800 text-base mb-3`}>
                Mã bí mật (Secret Key)
              </Text>
              <View style={tw`bg-gray-100 rounded-lg p-3 mb-3`}>
                <Text style={tw`text-gray-800 text-sm`}>
                  {qrInformation?.secret?.base32 || qrInformation?.secret}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => copyToClipboard(qrInformation?.secret?.base32 || qrInformation?.secret)}
                style={tw`bg-gray-200 rounded-lg p-3`}
              >
                <Text style={tw`text-gray-700 text-center font-medium`}>
                  Sao chép mã bí mật
                </Text>
              </TouchableOpacity>
            </View>

            <View style={tw`bg-white rounded-lg p-4 mb-3`}>
              <Text style={tw`font-bold text-gray-800 text-base mb-3`}>
                Hướng dẫn cài đặt
              </Text>
              <View style={tw`space-y-2`}>
                <View style={tw`flex flex-row items-start mb-2`}>
                  <Text style={tw`text-cyan-600 font-bold mr-2`}>1.</Text>
                  <Text style={tw`text-gray-700 flex-1`}>
                    Tải và cài đặt ứng dụng Google Authenticator
                  </Text>
                </View>
                <View style={tw`flex flex-row items-start mb-2`}>
                  <Text style={tw`text-cyan-600 font-bold mr-2`}>3.</Text>
                  <Text style={tw`text-gray-700 flex-1`}>
                    Nhập mã bí mật thủ công
                  </Text>
                </View>
                <View style={tw`flex flex-row items-start mb-2`}>
                  <Text style={tw`text-cyan-600 font-bold mr-2`}>4.</Text>
                  <Text style={tw`text-gray-700 flex-1`}>
                    Nhập mã 6 số từ ứng dụng vào ô bên dưới
                  </Text>
                </View>
              </View>
            </View>

            <View style={tw`mb-4`}>
              <Text style={tw`text-gray-700 text-sm font-medium mb-2`}>
                Mã xác thực từ Google Authenticator
              </Text>
              <View style={tw`border border-gray-300 rounded-lg p-3 bg-white`}>
                <TextInput
                  style={tw`text-gray-700 text-base`}
                  placeholder="Nhập mã 6 số"
                  value={verifyCode}
                  onChangeText={setVerifyCode}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleVerifyCode}
              disabled={disabled}
              style={tw`${disabled ? 'bg-gray-300' : 'bg-cyan-600'} p-4 rounded-lg`}
            >
              <Text style={tw`text-white text-center font-bold text-base`}>
                {disabled ? 'Đang xác thực...' : 'Xác thực và hoàn tất'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export default TwoFAScreen;
