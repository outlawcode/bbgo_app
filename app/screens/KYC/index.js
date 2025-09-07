import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Alert,
  Platform, TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import { useSelector, useDispatch } from 'react-redux';
import { LoadDataAction } from 'app/screens/Auth/action';
import apiConfig from 'app/config/api-config';
import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';
import { showMessage } from 'react-native-flash-message';
import { launchImageLibrary } from 'react-native-image-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Field, Formik } from 'formik';
import CustomInput from 'app/components/CustomInput';
import * as yup from 'yup';

function KYCScreen({ navigation }) {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.memberAuth.user);

  const [step, setStep] = useState(1);
  const [kycId, setKycId] = useState(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [idHolding, setIdHolding] = useState(null);
  const [idFrontPhoto, setIdFrontPhoto] = useState(null);
  const [idBackPhoto, setIdBackPhoto] = useState(null);
  const [idHoldingPhoto, setIdHoldingPhoto] = useState(null);
  const [uploadingIdFront, setUploadingIdFront] = useState(false);
  const [uploadingIdBack, setUploadingIdBack] = useState(false);
  const [uploadingIdHolding, setUploadingIdHolding] = useState(false);

  // Redirect if already verified
  useEffect(() => {
    if (currentUser && currentUser.kycStatus === 1) {
      navigation.goBack();
    }
  }, [currentUser, navigation]);

  useEffect(() => {
    navigation.setOptions({
      title: 'Xác thực KYC',
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

  const validationSchema = yup.object().shape({
    email: yup
      .string()
      .email('Vui lòng nhập đúng email')
      .required('Vui lòng nhập email'),
    phone: yup
      .string()
      .min(10, 'Vui lòng nhập đúng số điện thoại')
      .max(10, 'Vui lòng nhập đúng số điện thoại')
      .required('Vui lòng nhập số điện thoại'),
    idNumber: yup
      .string()
      .required('Vui lòng nhập số CCCD'),
  });

  const handleImagePicker = (type) => {
    console.log('Opening image picker for type:', type);
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
    };

    launchImageLibrary(options, (response) => {
      console.log('Image picker response:', response);
      if (response.didCancel) {
        return;
      }

      if (response.error) {
        showMessage({
          message: 'Lỗi khi chọn ảnh: ' + response.error,
          type: 'danger',
          icon: 'danger',
          duration: 2000,
        });
        return;
      }

      // Check if response has assets array (new format) or direct image data (old format)
      let image;
      if (response.assets && response.assets[0]) {
        image = response.assets[0];
      } else if (response.uri) {
        image = response;
      } else {
        showMessage({
          message: 'Không thể chọn ảnh. Vui lòng thử lại.',
          type: 'danger',
          icon: 'danger',
          duration: 2000,
        });
        return;
      }

      console.log('Selected image:', image);
      if (type === 'front') {
        setIdFrontPhoto(image);
        setUploadingIdFront(true);
        handleUploadIdFront(image);
      } else if (type === 'back') {
        setIdBackPhoto(image);
        setUploadingIdBack(true);
        handleUploadIdBack(image);
      } else if (type === 'holding') {
        setIdHoldingPhoto(image);
        setUploadingIdHolding(true);
        handleUploadIdHolding(image);
      }
    });
  };

  const createFormData = (photo, body = {}) => {
    let data = new FormData();
    data.append('files', {
      name: photo.fileName,
      type: photo.type,
      uri: Platform.OS === 'ios' ? photo.uri && photo.uri.replace("file://", "") : photo.uri,
    });
    Object.keys(body).forEach((key) => {
      data.append(key, body[key]);
    });
    return data;
  };

  const uploadImage = async (image, type) => {
    const token = await AsyncStorage.getItem('sme_user_token');
    const formData = createFormData(image, { userId: currentUser && currentUser.refId });

    return fetch(`${apiConfig.BASE_URL}/media/member/upload`, {
      method: 'POST',
      body: formData,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((response) => {
        return apiConfig.BASE_URL + response[0].url;
      })
      .catch((error) => {
        console.log('Upload error:', error);
        throw error;
      });
  };

  const handleUploadIdFront = async (photoToUpload = idFrontPhoto) => {
    if (!photoToUpload) return;

    try {
      const imageUrl = await uploadImage(photoToUpload, 'front');
      setIdFront(imageUrl);
      setUploadingIdFront(false);
      showMessage({
        message: "Upload ảnh mặt trước CCCD thành công!",
        type: 'success',
        icon: 'success',
        duration: 2000,
      });
    } catch (error) {
      console.log('Upload ID front error:', error);
      showMessage({
        message: error.response?.data?.message || "Upload ảnh thất bại",
        type: 'danger',
        icon: 'danger',
        duration: 2000,
      });
      setUploadingIdFront(false);
    }
  };

  const handleUploadIdBack = async (photoToUpload = idBackPhoto) => {
    if (!photoToUpload) return;

    try {
      const imageUrl = await uploadImage(photoToUpload, 'back');
      setIdBack(imageUrl);
      setUploadingIdBack(false);
      showMessage({
        message: "Upload ảnh mặt sau CCCD thành công!",
        type: 'success',
        icon: 'success',
        duration: 2000,
      });
    } catch (error) {
      console.log('Upload ID back error:', error);
      showMessage({
        message: error.response?.data?.message || "Upload ảnh thất bại",
        type: 'danger',
        icon: 'danger',
        duration: 2000,
      });
      setUploadingIdBack(false);
    }
  };

  const handleUploadIdHolding = async (photoToUpload = idHoldingPhoto) => {
    if (!photoToUpload) return;

    try {
      const imageUrl = await uploadImage(photoToUpload, 'holding');
      setIdHolding(imageUrl);
      setUploadingIdHolding(false);
      showMessage({
        message: "Upload ảnh cầm CCCD thành công!",
        type: 'success',
        icon: 'success',
        duration: 2000,
      });
    } catch (error) {
      console.log('Upload ID holding error:', error);
      showMessage({
        message: error.response?.data?.message || "Upload ảnh thất bại",
        type: 'danger',
        icon: 'danger',
        duration: 2000,
      });
      setUploadingIdHolding(false);
    }
  };

  const handleSubmit = async (values) => {
    console.log('handleSubmit called with values:', values);
    console.log('idFront:', idFront);
    console.log('idBack:', idBack);
    
    if (!idFront || !idBack) {
      showMessage({
        message: 'Vui lòng upload đầy đủ ảnh mặt trước và mặt sau CCCD',
        type: 'danger',
        icon: 'danger'
      });
      return;
    }

    setDisabled(true);
    try {
      const token = await AsyncStorage.getItem('sme_user_token');

      // Submit KYC using already uploaded image URLs
      const response = await axios.post(
        `${apiConfig.BASE_URL}/member/kyc`,
        {
          idFront: idFront,
          idBack: idBack,
          idHolding: idHolding,
          email: values.email,
          phone: values.phone,
          idNumber: values.idNumber,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        setKycId(response.data.id);
        setStep(2);
        showMessage({
          message: 'Đã gửi yêu cầu KYC. Vui lòng kiểm tra email để xác thực.',
          type: 'success',
          icon: 'success'
        });
      }
    } catch (error) {
      console.log('KYC submit error:', error);
      showMessage({
        message: error.response?.data?.message || 'Gửi yêu cầu KYC thất bại',
        type: 'danger',
        icon: 'danger'
      });
    } finally {
      setDisabled(false);
    }
  };

  const handleVerifyEmail = async () => {
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
        `${apiConfig.BASE_URL}/member/kyc/verify-email`,
        { id: kycId, verifyCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        showMessage({
          message: 'Xác thực KYC thành công!',
          type: 'success',
          icon: 'success'
        });
        dispatch(LoadDataAction());
        navigation.goBack();
      }
    } catch (error) {
      console.log('Verify email error:', error);
      showMessage({
        message: error.response?.data?.message || 'Xác thực thất bại',
        type: 'danger',
        icon: 'danger'
      });
    } finally {
      setDisabled(false);
    }
  };

  const handleResendCode = async () => {
    setDisabled(true);
    try {
      const token = await AsyncStorage.getItem('sme_user_token');
      await axios.post(
        `${apiConfig.BASE_URL}/member/kyc/resend-email/${kycId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showMessage({
        message: 'Đã gửi lại mã xác thực',
        type: 'success',
        icon: 'success'
      });
    } catch (error) {
      console.log('Resend code error:', error);
      showMessage({
        message: 'Gửi lại mã thất bại',
        type: 'danger',
        icon: 'danger'
      });
    } finally {
      setDisabled(false);
    }
  };

  if (currentUser && currentUser.kycStatus === 2) {
    return (
      <View style={tw`flex-1 bg-gray-50`}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <ScrollView style={tw`flex-1 px-4 py-4`}>
          <View style={tw`bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-4`}>
            <View style={tw`flex flex-row items-center mb-2`}>
              <Icon name="clock-outline" size={20} style={tw`text-yellow-600 mr-2`} />
              <Text style={tw`font-bold text-yellow-800`}>KYC đang chờ duyệt</Text>
            </View>
            <Text style={tw`text-yellow-700`}>
              KYC của bạn đang được xác thực, vui lòng chờ!
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView style={tw`flex-1 px-4 py-4`}>
        {step === 1 ? (
          <Formik
            initialValues={{
              email: currentUser?.email || '',
              phone: currentUser?.phone || '',
              idNumber: currentUser?.personalID || '',
            }}
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
          >
            {({ handleSubmit, isValid, errors, values }) => {
              console.log('Form validation state:', { isValid, errors, values });
              return (
              <KeyboardAwareScrollView
                showsVerticalScrollIndicator={false}
                style={tw`flex-1 pb-20`}
              >
                <Text style={tw`text-gray-500 mb-5`}>
                  Điền đủ thông tin vào form dưới để tiến hành KYC.{'\n'}
                  Giấy tờ của bạn có thể là Hộ chiếu hoặc Căn cước công dân.
                </Text>

                {/* ID Front Upload */}
                <View style={tw`mb-4`}>
                  <Text style={tw`mb-3 font-medium text-gray-600`}>Ảnh mặt trước CCCD *</Text>
                  <TouchableOpacity
                    onPress={() => handleImagePicker('front')}
                    disabled={uploadingIdFront}
                    style={tw`border-2 border-dashed border-gray-300 rounded-lg p-4 items-center`}
                  >
                    {uploadingIdFront ? (
                      <View style={tw`items-center`}>
                        <View style={tw`w-32 h-20 bg-gray-100 rounded flex items-center justify-center`}>
                          <Text style={tw`text-sm text-gray-500`}>Đang upload...</Text>
                        </View>
                      </View>
                    ) : idFront ? (
                      <View style={tw`items-center`}>
                        <Image
                          source={{ uri: idFront }}
                          style={tw`w-32 h-20 object-cover rounded`}
                        />
                        <Text style={tw`text-sm text-gray-500 mt-2`}>Nhấn để thay đổi ảnh</Text>
                      </View>
                    ) : (
                      <View style={tw`items-center`}>
                        <Icon name="camera-outline" size={30} style={tw`text-gray-400 mb-2`} />
                        <Text style={tw`text-gray-500`}>Nhấn để chọn ảnh mặt trước CCCD</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* ID Back Upload */}
                <View style={tw`mb-4`}>
                  <Text style={tw`mb-3 font-medium text-gray-600`}>Ảnh mặt sau CCCD *</Text>
                  <TouchableOpacity
                    onPress={() => handleImagePicker('back')}
                    disabled={uploadingIdBack}
                    style={tw`border-2 border-dashed border-gray-300 rounded-lg p-4 items-center`}
                  >
                    {uploadingIdBack ? (
                      <View style={tw`items-center`}>
                        <View style={tw`w-32 h-20 bg-gray-100 rounded flex items-center justify-center`}>
                          <Text style={tw`text-sm text-gray-500`}>Đang upload...</Text>
                        </View>
                      </View>
                    ) : idBack ? (
                      <View style={tw`items-center`}>
                        <Image
                          source={{ uri: idBack }}
                          style={tw`w-32 h-20 object-cover rounded`}
                        />
                        <Text style={tw`text-sm text-gray-500 mt-2`}>Nhấn để thay đổi ảnh</Text>
                      </View>
                    ) : (
                      <View style={tw`items-center`}>
                        <Icon name="camera-outline" size={30} style={tw`text-gray-400 mb-2`} />
                        <Text style={tw`text-gray-500`}>Nhấn để chọn ảnh mặt sau CCCD</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* ID Holding Upload (Optional) */}
                <View style={tw`mb-4`}>
                  <Text style={tw`mb-3 font-medium text-gray-600`}>Ảnh cầm CCCD (Tùy chọn)</Text>
                  <TouchableOpacity
                    onPress={() => handleImagePicker('holding')}
                    disabled={uploadingIdHolding}
                    style={tw`border-2 border-dashed border-gray-300 rounded-lg p-4 items-center`}
                  >
                    {uploadingIdHolding ? (
                      <View style={tw`items-center`}>
                        <View style={tw`w-32 h-20 bg-gray-100 rounded flex items-center justify-center`}>
                          <Text style={tw`text-sm text-gray-500`}>Đang upload...</Text>
                        </View>
                      </View>
                    ) : idHolding ? (
                      <View style={tw`items-center`}>
                        <Image
                          source={{ uri: idHolding }}
                          style={tw`w-32 h-20 object-cover rounded`}
                        />
                        <Text style={tw`text-sm text-gray-500 mt-2`}>Nhấn để thay đổi ảnh</Text>
                      </View>
                    ) : (
                      <View style={tw`items-center`}>
                        <Icon name="camera-outline" size={30} style={tw`text-gray-400 mb-2`} />
                        <Text style={tw`text-gray-500`}>Nhấn để chọn ảnh cầm CCCD</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                <Field
                  component={CustomInput}
                  name="email"
                  label="Email"
                  keyboardType="email-address"
                />
                <Field
                  component={CustomInput}
                  name="phone"
                  label="Số điện thoại"
                  keyboardType="phone-pad"
                />
                <Field
                  component={CustomInput}
                  name="idNumber"
                  label="Số CCCD"
                />

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={disabled || !isValid}
                  style={tw`${!isValid || disabled ? 'bg-gray-300' : 'bg-cyan-600'} p-4 rounded-lg mt-4`}
                >
                  <Text style={tw`text-white text-center font-bold text-base`}>
                    {disabled ? 'Đang xử lý...' : 'Gửi yêu cầu KYC'}
                  </Text>
                </TouchableOpacity>
              </KeyboardAwareScrollView>
              );
            }}
          </Formik>
        ) : (
          <View>
            <View style={tw`bg-blue-50 border border-blue-300 rounded-lg p-4 mb-4`}>
              <View style={tw`flex flex-row items-center mb-2`}>
                <Icon name="email-outline" size={20} style={tw`text-blue-600 mr-2`} />
                <Text style={tw`font-bold text-blue-800`}>Xác thực Email</Text>
              </View>
              <Text style={tw`text-blue-700`}>
                Chúng tôi đã gửi mã xác thực đến email của bạn. Vui lòng kiểm tra và nhập mã bên dưới.
              </Text>
            </View>

            <View style={tw`mb-4`}>
              <Text style={tw`text-gray-700 text-sm font-medium mb-2`}>
                Mã xác thực
              </Text>
              <View style={tw`border border-gray-300 rounded-lg p-3 bg-white`}>
                <TextInput
                  style={tw`text-gray-700 text-base`}
                  placeholder="Nhập mã xác thực"
                  value={verifyCode}
                  onChangeText={setVerifyCode}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleVerifyEmail}
              disabled={disabled}
              style={tw`${disabled ? 'bg-gray-300' : 'bg-cyan-600'} p-4 rounded-lg mb-3`}
            >
              <Text style={tw`text-white text-center font-bold text-base`}>
                {disabled ? 'Đang xác thực...' : 'Xác thực'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleResendCode}
              disabled={disabled}
              style={tw`border border-gray-300 p-4 rounded-lg`}
            >
              <Text style={tw`text-gray-700 text-center font-medium text-base`}>
                Gửi lại mã
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export default KYCScreen;
