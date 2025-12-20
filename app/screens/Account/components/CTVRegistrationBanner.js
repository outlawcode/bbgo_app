import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiConfig from 'app/config/api-config';
import { useSelector } from 'react-redux';

function CTVRegistrationBanner() {
  const [eligibility, setEligibility] = useState(null);
  const [myRequest, setMyRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const currentUser = useSelector(state => state.memberAuth.user);

  useEffect(() => {
    checkEligibility();
    getMyRequest();
  }, []);

  const checkEligibility = async () => {
    try {
      const token = await AsyncStorage.getItem('sme_user_token');
      const response = await axios.get(`${apiConfig.BASE_URL}/member/ctv-registration/eligibility`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEligibility(response.data);
    } catch (error) {
      console.error('Error checking eligibility:', error);
    }
  };

  const getMyRequest = async () => {
    try {
      const token = await AsyncStorage.getItem('sme_user_token');
      const response = await axios.get(`${apiConfig.BASE_URL}/member/ctv-registration/my-request`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setMyRequest(response.data);
      }
    } catch (error) {
      setMyRequest(null);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('sme_user_token');
      await axios.post(`${apiConfig.BASE_URL}/member/ctv-registration`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await getMyRequest();
      await checkEligibility();
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Không hiển thị nếu đã là CTV trở lên
  if (currentUser && Number(currentUser.positionNumber || 0) >= 2) {
    return null;
  }

  // Hiển thị trạng thái đơn đăng ký
  if (myRequest) {
    if (myRequest.status === 'Chờ duyệt') {
      return (
        <View style={tw`mb-3 bg-blue-50 border border-blue-300 rounded-lg p-4`}>
          <View style={tw`flex flex-row items-start`}>
            <Icon name="information" size={20} style={tw`text-blue-600 mr-2 mt-0.5`} />
            <View style={tw`flex-1`}>
              <Text style={tw`font-bold text-blue-800 text-sm mb-1`}>
                Đơn đăng ký làm CTV đang chờ xét duyệt
              </Text>
              <Text style={tw`text-blue-700 text-xs`}>
                Đơn đăng ký của bạn đã được gửi và đang chờ admin xét duyệt. Vui lòng chờ thông báo.
              </Text>
            </View>
          </View>
        </View>
      );
    } else if (myRequest.status === 'Đã duyệt') {
      return (
        <View style={tw`mb-3 bg-green-50 border border-green-300 rounded-lg p-4`}>
          <View style={tw`flex flex-row items-start`}>
            <Icon name="check-circle" size={20} style={tw`text-green-600 mr-2 mt-0.5`} />
            <View style={tw`flex-1`}>
              <Text style={tw`font-bold text-green-800 text-sm mb-1`}>
                Đơn đăng ký CTV đã được duyệt
              </Text>
              <Text style={tw`text-green-700 text-xs`}>
                Chúc mừng! Bạn đã trở thành Cộng tác viên.
              </Text>
            </View>
          </View>
        </View>
      );
    } else if (myRequest.status === 'Từ chối') {
      return (
        <View style={tw`mb-3 bg-red-50 border border-red-300 rounded-lg p-4`}>
          <View style={tw`flex flex-row items-start`}>
            <Icon name="close-circle" size={20} style={tw`text-red-600 mr-2 mt-0.5`} />
            <View style={tw`flex-1`}>
              <Text style={tw`font-bold text-red-800 text-sm mb-1`}>
                Đơn đăng ký CTV đã bị từ chối
              </Text>
              <Text style={tw`text-red-700 text-xs`}>
                {myRequest.note ? `Lý do: ${myRequest.note}` : 'Vui lòng liên hệ admin để biết thêm chi tiết.'}
              </Text>
            </View>
          </View>
        </View>
      );
    }
  }

  // Hiển thị thông báo đăng ký nếu đủ điều kiện
  if (eligibility && eligibility.eligible) {
    return (
      <View style={tw`mb-3 bg-green-50 border border-green-300 rounded-lg p-4`}>
        <View style={tw`flex flex-row items-start mb-3`}>
          <Icon name="check-circle" size={20} style={tw`text-green-600 mr-2 mt-0.5`} />
          <View style={tw`flex-1`}>
            <Text style={tw`font-bold text-green-800 text-sm mb-1`}>
              Đăng ký làm Cộng tác viên
            </Text>
            <Text style={tw`text-green-700 text-xs mb-2`}>
              Bạn đã đủ điều kiện để đăng ký làm Cộng tác viên (CTV)!
            </Text>
            <Text style={tw`text-green-700 text-xs`}>
              Điều kiện: Có ít nhất một đơn hàng thành công có giá trị tối thiểu {eligibility.requiredOrderValue?.toLocaleString('vi-VN')} VNĐ
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          style={tw`bg-green-500 px-4 py-2 rounded-lg items-center`}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={tw`text-white font-medium`}>Đăng ký làm CTV</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

export default CTVRegistrationBanner;

