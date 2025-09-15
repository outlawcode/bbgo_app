import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import { useSelector, useDispatch } from 'react-redux';
import { LoadDataAction } from 'app/screens/Auth/action';
import AddressFields from 'app/components/AddressFields';
import apiConfig from 'app/config/api-config';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showMessage } from 'react-native-flash-message';

function AddressScreen({ navigation }) {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.memberAuth.user);

  const [loading, setLoading] = useState(false);
  const [addressData, setAddressData] = useState({
    provinceId: null,
    districtId: null,
    wardId: null,
    provinceCode: '',
    provinceName: '',
    districtCode: '',
    districtName: '',
    wardCode: '',
    wardName: '',
    address: '',
  });

  useEffect(() => {
    // Initialize with current user data
    if (currentUser) {
      setAddressData({
        provinceId: null,
        districtId: null,
        wardId: null,
        provinceCode: currentUser.provinceCode || '',
        provinceName: currentUser.provinceName || '',
        districtCode: currentUser.districtCode || '',
        districtName: currentUser.districtName || '',
        wardCode: currentUser.wardCode || '',
        wardName: currentUser.wardName || '',
        address: currentUser.address || '',
      });
    }
  }, [currentUser]);

  const handleProvinceChange = (province) => {
    setAddressData(prev => ({
      ...prev,
      provinceId: province.id,
      provinceCode: province.code,
      provinceName: province.name,
      districtId: null,
      districtCode: '',
      districtName: '',
      wardId: null,
      wardCode: '',
      wardName: '',
    }));
  };

  const handleDistrictChange = (district) => {
    setAddressData(prev => ({
      ...prev,
      districtId: district.id,
      districtCode: district.code,
      districtName: district.name,
      wardId: null,
      wardCode: '',
      wardName: '',
    }));
  };

  const handleWardChange = (ward) => {
    setAddressData(prev => ({
      ...prev,
      wardId: ward.id,
      wardCode: ward.code,
      wardName: ward.name,
    }));
  };

  const handleSave = async () => {
    if (!addressData.provinceCode || !addressData.districtCode || !addressData.wardCode) {
      showMessage({
        message: 'Vui lòng chọn đầy đủ tỉnh/thành phố, quận/huyện và xã/phường/thị trấn',
        type: 'danger',
        icon: 'danger'
      });
      return;
    }

    if (!addressData.address.trim()) {
      showMessage({
        message: 'Vui lòng nhập địa chỉ chi tiết',
        type: 'danger',
        icon: 'danger'
      });
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('sme_user_token');
      const response = await axios({
        method: 'put',
        url: `${apiConfig.BASE_URL}/user/me`,
        data: {
          provinceCode: addressData.provinceCode,
          provinceName: addressData.provinceName,
          districtCode: addressData.districtCode,
          districtName: addressData.districtName,
          wardCode: addressData.wardCode,
          wardName: addressData.wardName,
          address: addressData.address,
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        showMessage({
          message: 'Địa chỉ đã được cập nhật thành công!',
          type: 'success',
          icon: 'success'
        });

        // Refresh user data
        navigation.goBack();
      }
    } catch (error) {
      console.log('Update address error:', error);
      showMessage({
        message: error.response?.data?.message || 'Không thể cập nhật địa chỉ. Vui lòng thử lại.',
        type: 'danger',
        icon: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
		navigation.setOptions({
			title: 'Địa chỉ nhận hàng',
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
	}, [])

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView style={tw`flex-1 px-4 py-4`}>
        {/* Address Fields */}
        <View style={tw`bg-white rounded-lg p-4 mb-4`}>
          <Text style={tw`font-bold text-gray-800 text-base mb-4`}>
            Chọn địa chỉ
          </Text>

          <AddressFields
            currentData={addressData}
            onProvinceChange={handleProvinceChange}
            onDistrictChange={handleDistrictChange}
            onWardChange={handleWardChange}
            showLabels={true}
          />
        </View>

        {/* Detailed Address */}
        <View style={tw`bg-white rounded-lg p-4 mb-4`}>
          <Text style={tw`font-bold text-gray-800 text-base mb-4`}>
            Địa chỉ chi tiết
          </Text>

          <TextInput
            style={tw`border border-gray-300 rounded-lg p-3 text-gray-700 min-h-20`}
            placeholder="Nhập địa chỉ chi tiết (số nhà, tên đường, tòa nhà...)"
            value={addressData.address}
            onChangeText={(text) => setAddressData(prev => ({ ...prev, address: text }))}
            multiline={true}
            textAlignVertical="top"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          style={tw`bg-cyan-600 rounded-lg p-4 items-center ${
            loading ? 'opacity-50' : ''
          }`}
        >
          <Text style={tw`text-white font-bold text-base`}>
            {loading ? 'Đang lưu...' : 'Lưu địa chỉ'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

export default AddressScreen;
