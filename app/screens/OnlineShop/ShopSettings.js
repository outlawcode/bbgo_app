import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View, Image, Platform } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import { useIsFocused } from "@react-navigation/native";
import { showMessage } from "react-native-flash-message";
import { launchImageLibrary } from 'react-native-image-picker';
import { provinces } from "app/utils/provinces";
import CustomSelector from "./CustomSelector"; // Import custom selector component

function ShopSettings(props) {
    const isFocused = useIsFocused();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [shopInfo, setShopInfo] = useState(null);

    // Form fields
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [province, setProvince] = useState('');
    const [description, setDescription] = useState('');
    const [coverImage, setCoverImage] = useState(null);
    const [coverPhoto, setCoverPhoto] = useState(null);
    const [avatar, setAvatar] = useState(null);
    const [avatarPhoto, setAvatarPhoto] = useState(null);
    const [bankName, setBankName] = useState('');
    const [bankCode, setBankCode] = useState('');
    const [bankOwner, setBankOwner] = useState('');
    const [bankAccount, setBankAccount] = useState('');

    useEffect(() => {
        props.navigation.setOptions({
            title: 'Cài đặt Shop',
            headerStyle: {
                backgroundColor: '#3b82f6',
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
        });
    }, []);

    useEffect(() => {
        if (isFocused) {
            fetchShopInfo();
        }
    }, [isFocused]);

    const fetchShopInfo = async () => {
        setLoading(true);
        const token = await AsyncStorage.getItem('sme_user_token');

        try {
            const response = await axios({
                method: 'get',
                url: `${apiConfig.BASE_URL}/member/user-shop`,
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                const shopData = response.data;
                setShopInfo(shopData);

                // Set form fields
                setName(shopData.name || '');
                setPhone(shopData.phone || '');
                setAddress(shopData.address || '');

                // Fix: Properly handle province from response
                // Convert to string if it's not already
                setProvince(shopData.province ? String(shopData.province) : '');

                setDescription(shopData.description || '');
                setCoverImage(shopData.coverImage || null);
                setAvatar(shopData.avatar || null);

                // Handle payment info
                if (shopData.paymentInfo) {
                    try {
                        const paymentInfo = typeof shopData.paymentInfo === 'string'
                            ? JSON.parse(shopData.paymentInfo)
                            : shopData.paymentInfo;

                        setBankName(paymentInfo.bankName || '');
                        setBankCode(paymentInfo.bankCode || '');
                        setBankOwner(paymentInfo.bankOwner || '');
                        setBankAccount(paymentInfo.bankAccount || '');
                    } catch (e) {
                        console.log('Error parsing payment info:', e);
                        // Initialize with empty values if parsing fails
                        setBankName('');
                        setBankCode('');
                        setBankOwner('');
                        setBankAccount('');
                    }
                }

                setLoading(false);
            }
        } catch (error) {
            console.log(error);
            setLoading(false);
            showMessage({
                message: error.response?.data?.message || 'Đã xảy ra lỗi khi tải thông tin cửa hàng',
                type: 'danger',
                icon: 'danger',
                duration: 3000,
            });
        }
    };

    // Image handling functions
    const createFormData = (photo, body = {}) => {
        const data = new FormData();

        // Handle the different response formats from image picker
        if (photo) {
            data.append('files', {
                name: photo.fileName || photo.assets?.[0]?.fileName || 'image.jpg',
                type: photo.type || photo.assets?.[0]?.type || 'image/jpeg',
                uri: Platform.OS === 'ios'
                    ? (photo.uri || photo.assets?.[0]?.uri)?.replace('file://', '')
                    : (photo.uri || photo.assets?.[0]?.uri),
            });
        }

        // Add any additional fields
        Object.keys(body).forEach((key) => {
            data.append(key, body[key]);
        });

        return data;
    };

    const handleChoosePhoto = (type) => {
        const options = {
            mediaType: 'photo',
            quality: 0.8,
            includeBase64: false,
        };

        launchImageLibrary(options, (response) => {
            console.log('Image picker response:', response);

            if (response.didCancel) {
                console.log('User cancelled image picker');
                return;
            }

            if (response.errorCode) {
                console.log('ImagePicker Error:', response.errorMessage);
                showMessage({
                    message: `Lỗi: ${response.errorMessage || 'Đã xảy ra lỗi khi chọn ảnh'}`,
                    type: 'danger',
                    icon: 'danger',
                    duration: 3000,
                });
                return;
            }

            // Handle different response structures
            if (response.assets && response.assets.length > 0) {
                // Newer API format
                if (type === 'cover') {
                    setCoverPhoto(response.assets[0]);
                } else if (type === 'avatar') {
                    setAvatarPhoto(response.assets[0]);
                }
            } else if (response.uri) {
                // Older API format
                if (type === 'cover') {
                    setCoverPhoto(response);
                } else if (type === 'avatar') {
                    setAvatarPhoto(response);
                }
            } else {
                console.log('Unexpected response format:', response);
                showMessage({
                    message: 'Định dạng phản hồi không mong đợi',
                    type: 'danger',
                    icon: 'danger',
                    duration: 3000,
                });
            }
        });
    };

    const handleUploadPhoto = async (photo, type) => {
        if (!photo) return;
        console.log('Uploading photo:', photo);

        const token = await AsyncStorage.getItem('sme_user_token');

        try {
            // Create form data
            const formData = createFormData(photo);

            // Use fetch API with proper headers
            const response = await fetch(`${apiConfig.BASE_URL}/media/member/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Let browser/RN set the Content-Type with boundary
                },
            });

            if (!response.ok) {
                console.log('Upload failed with status:', response.status);
                const errorText = await response.text();
                console.log('Error response:', errorText);
                throw new Error(`Upload failed: ${response.status} ${errorText}`);
            }

            const responseJson = await response.json();
            console.log('Upload response:', responseJson);

            if (responseJson && responseJson.length > 0) {
                const imageUrl = apiConfig.BASE_URL + responseJson[0].url;

                if (type === 'cover') {
                    setCoverImage(imageUrl);
                } else {
                    setAvatar(imageUrl);
                }

                showMessage({
                    message: `Đã tải ảnh ${type === 'cover' ? 'bìa' : 'đại diện'} thành công`,
                    type: 'success',
                    icon: 'success',
                    duration: 2000,
                });
            }
        } catch (error) {
            console.log('Upload error:', error);
            showMessage({
                message: `Tải ảnh ${type === 'cover' ? 'bìa' : 'đại diện'} thất bại: ${error.message}`,
                type: 'danger',
                icon: 'danger',
                duration: 2000,
            });
        }
    };

    const handleUpdateShop = async () => {
        // Validate form
        if (!name.trim()) {
            showMessage({
                message: 'Vui lòng nhập tên cửa hàng',
                type: 'warning',
                icon: 'warning',
                duration: 3000,
            });
            return;
        }

        Alert.alert(
            "Xác nhận cập nhật",
            "Bạn có chắc chắn muốn cập nhật thông tin cửa hàng?",
            [
                {
                    text: "Huỷ",
                    style: "cancel"
                },
                {
                    text: "Cập nhật",
                    onPress: submitUpdate
                }
            ]
        );
    };

    const submitUpdate = async () => {
        setUpdating(true);
        const token = await AsyncStorage.getItem('sme_user_token');

        try {
            const updateData = {
                name,
                phone,
                address,
                province,
                description,
                coverImage,
                avatar,
                paymentInfo: JSON.stringify({
                    bankName,
                    bankCode,
                    bankAccount,
                    bankOwner,
                })
            };

            const response = await axios.put(
                `${apiConfig.BASE_URL}/member/user-shop`,
                updateData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                showMessage({
                    message: 'Cập nhật thông tin cửa hàng thành công',
                    type: 'success',
                    icon: 'success',
                    duration: 3000,
                });
                setUpdating(false);
                fetchShopInfo(); // Refresh the data
            }
        } catch (error) {
            console.log(error);
            setUpdating(false);
            showMessage({
                message: error.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật thông tin',
                type: 'danger',
                icon: 'danger',
                duration: 3000,
            });
        }
    };

    // Function to handle province selection
    const handleProvinceChange = (value) => {
        console.log('Province selected:', value);
        setProvince(value);
    };

    if (loading) {
        return (
            <View style={tw`flex-1 justify-center items-center bg-white`}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <View style={tw`flex-1 bg-gray-100`}>
            <StatusBar barStyle="light-content" backgroundColor="#3b82f6" />

            <ScrollView contentContainerStyle={tw`p-3 pb-20`}>
                {/* Image Section */}
                <View style={tw`bg-white p-4 rounded-lg shadow-sm mb-4`}>
                    <Text style={tw`font-medium text-gray-800 mb-4`}>Hình ảnh</Text>

                    <View style={tw`mb-5 pb-5 border-b border-gray-200`}>
                        <Text style={tw`text-gray-600 mb-2`}>Ảnh bìa</Text>
                        {coverImage ? (
                            <View style={tw`mb-2`}>
                                <Image source={{ uri: coverImage }} style={tw`w-full h-40 rounded-lg bg-gray-200`} />
                            </View>
                        ) : (
                            <View style={tw`w-full h-40 rounded-lg bg-gray-200 items-center justify-center mb-2`}>
                                <Icon name="image-outline" size={40} style={tw`text-gray-400`} />
                            </View>
                        )}

                        {coverPhoto && (
                            <View style={tw`mb-4 flex-row items-center`}>
                                <Image source={{ uri: coverPhoto.uri }} style={tw`w-16 h-16 rounded mr-3`} />
                                <TouchableOpacity
                                    style={tw`bg-green-500 py-2 px-3 rounded`}
                                    onPress={() => handleUploadPhoto(coverPhoto, 'cover')}
                                >
                                    <Text style={tw`text-white`}>Tải lên</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <TouchableOpacity
                            style={tw`bg-blue-500 py-2 px-4 rounded-lg flex-row items-center justify-center`}
                            onPress={() => handleChoosePhoto('cover')}
                        >
                            <Icon name="camera" size={18} style={tw`text-white mr-1`} />
                            <Text style={tw`text-white`}>{coverImage ? 'Đổi ảnh bìa' : 'Chọn ảnh bìa'}</Text>
                        </TouchableOpacity>
                    </View>

                    <View>
                        <Text style={tw`text-gray-600 mb-2`}>Ảnh đại diện</Text>
                        {avatar ? (
                            <View style={tw`mb-2`}>
                                <Image source={{ uri: avatar }} style={tw`w-24 h-24 rounded-full bg-gray-200`} />
                            </View>
                        ) : (
                            <View style={tw`w-24 h-24 rounded-full bg-gray-200 items-center justify-center mb-2`}>
                                <Icon name="account" size={40} style={tw`text-gray-400`} />
                            </View>
                        )}

                        {avatarPhoto && (
                            <View style={tw`mb-4 flex-row items-center`}>
                                <Image source={{ uri: avatarPhoto.uri }} style={tw`w-16 h-16 rounded-full mr-3`} />
                                <TouchableOpacity
                                    style={tw`bg-green-500 py-2 px-3 rounded`}
                                    onPress={() => handleUploadPhoto(avatarPhoto, 'avatar')}
                                >
                                    <Text style={tw`text-white`}>Tải lên</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <TouchableOpacity
                            style={tw`bg-blue-500 py-2 px-4 rounded-lg flex-row items-center justify-center`}
                            onPress={() => handleChoosePhoto('avatar')}
                        >
                            <Icon name="camera" size={18} style={tw`text-white mr-1`} />
                            <Text style={tw`text-white`}>{avatar ? 'Đổi ảnh đại diện' : 'Chọn ảnh đại diện'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Shop Info Section */}
                <View style={tw`bg-white p-4 rounded-lg shadow-sm mb-4`}>
                    <Text style={tw`font-medium text-gray-800 mb-4`}>Thông tin cửa hàng</Text>

                    <View style={tw`mb-4`}>
                        <Text style={tw`text-gray-600 mb-2`}>Tên cửa hàng</Text>
                        <TextInput
                            style={tw`border border-gray-300 rounded-lg p-3`}
                            placeholder="Nhập tên cửa hàng"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={tw`mb-4`}>
                        <Text style={tw`text-gray-600 mb-2`}>Số điện thoại</Text>
                        <TextInput
                            style={tw`border border-gray-300 rounded-lg p-3`}
                            placeholder="Nhập số điện thoại"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={tw`mb-4`}>
                        <Text style={tw`text-gray-600 mb-2`}>Địa chỉ</Text>
                        <TextInput
                            style={tw`border border-gray-300 rounded-lg p-3`}
                            placeholder="Nhập địa chỉ cửa hàng"
                            value={address}
                            onChangeText={setAddress}
                        />
                    </View>

                    {/* Fixed Province Selector */}
                    <View style={tw`mb-4`}>
                        <CustomSelector
                            label="Tỉnh/Thành phố"
                            placeholder="Chọn tỉnh/thành phố"
                            value={province}
                            onValueChange={handleProvinceChange}
                            items={provinces}
                            getValue={(item) => String(item.code)}
                            getLabel={(item) => item.name}
                            searchable={true}
                        />
                    </View>

                    <View style={tw`mb-4`}>
                        <Text style={tw`text-gray-600 mb-2`}>Mô tả</Text>
                        <TextInput
                            style={tw`border border-gray-300 rounded-lg p-3 h-24`}
                            placeholder="Nhập mô tả cửa hàng"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                {/* Payment Info Section */}
                <View style={tw`bg-white p-4 rounded-lg shadow-sm mb-4`}>
                    <Text style={tw`font-medium text-gray-800 mb-4`}>Thông tin thanh toán</Text>

                    <View style={tw`mb-4`}>
                        <Text style={tw`text-gray-600 mb-2`}>Tên ngân hàng</Text>
                        <TextInput
                            style={tw`border border-gray-300 rounded-lg p-3`}
                            placeholder="Nhập tên ngân hàng"
                            value={bankName}
                            onChangeText={setBankName}
                        />
                    </View>

                    <View style={tw`mb-4`}>
                        <Text style={tw`text-gray-600 mb-2`}>Mã ngân hàng</Text>
                        <TextInput
                            style={tw`border border-gray-300 rounded-lg p-3`}
                            placeholder="Nhập mã ngân hàng"
                            value={bankCode}
                            onChangeText={setBankCode}
                        />
                    </View>

                    <View style={tw`mb-4`}>
                        <Text style={tw`text-gray-600 mb-2`}>Chủ tài khoản</Text>
                        <TextInput
                            style={tw`border border-gray-300 rounded-lg p-3`}
                            placeholder="Nhập tên chủ tài khoản"
                            value={bankOwner}
                            onChangeText={setBankOwner}
                        />
                    </View>

                    <View style={tw`mb-4`}>
                        <Text style={tw`text-gray-600 mb-2`}>Số tài khoản</Text>
                        <TextInput
                            style={tw`border border-gray-300 rounded-lg p-3`}
                            placeholder="Nhập số tài khoản"
                            value={bankAccount}
                            onChangeText={setBankAccount}
                            keyboardType="number-pad"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={tw`bg-blue-600 p-4 rounded-lg items-center justify-center mb-10`}
                    onPress={handleUpdateShop}
                    disabled={updating}
                >
                    {updating ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={tw`text-white font-bold text-lg`}>Lưu thông tin</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

export default ShopSettings;
