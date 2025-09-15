import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatherIcon from 'react-native-vector-icons/Feather';

function RequestOpenShopForm(props) {
    const [shopName, setShopName] = useState('');
    const [shopType, setShopType] = useState('Product');
    const [isValid, setIsValid] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const validateForm = (name) => {
        setShopName(name);
        setIsValid(name.trim().length > 0);
        // Clear any previous error when user starts typing
        if (error) setError(null);
    };

    const handleSubmit = async () => {
        if (!isValid || isSubmitting) return;

        try {
            setIsSubmitting(true);
            setError(null);

            // Call the onSubmit prop and handle the promise properly
            await props.onSubmit({
                shopName,
                shopType
            });

            // If we get here, submission was successful
            setIsSubmitting(false);
        } catch (err) {
            setIsSubmitting(false);

            // Proper error handling with safe property access
            let errorMessage = 'Có lỗi xảy ra khi đăng ký gian hàng';

            // Safely access error.response.data with optional chaining
            if (err?.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err?.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            console.error('Submit error:', err);
        }
    };

    // Styled radio option component
    const RadioOption = ({ icon, label, description, value, selected, onSelect }) => {
        return (
            <TouchableOpacity
                style={tw`p-4 mb-3 rounded-xl flex-row items-center ${selected ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-100'}`}
                onPress={() => onSelect(value)}
                activeOpacity={0.7}
            >
                <View style={tw`mr-3 ${selected ? 'bg-blue-500' : 'bg-gray-200'} w-10 h-10 rounded-lg items-center justify-center`}>
                    <Icon name={icon} size={22} style={tw`text-white`} />
                </View>
                <View style={tw`flex-1`}>
                    <Text style={tw`text-base font-medium ${selected ? 'text-blue-700' : 'text-gray-800'}`}>
                        {label}
                    </Text>
                    <Text style={tw`text-xs mt-1 ${selected ? 'text-blue-600' : 'text-gray-500'}`}>
                        {description}
                    </Text>
                </View>
                <View style={tw`h-5 w-5 rounded-full border-2 ${selected ? 'border-blue-600' : 'border-gray-300'} justify-center items-center ml-2`}>
                    {selected && <View style={tw`h-3 w-3 rounded-full bg-blue-600`} />}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={tw`flex-1`}
        >
            <ScrollView style={tw`flex-1 bg-white`} showsVerticalScrollIndicator={false}>
                <View style={tw`px-5 py-8`}>
                    <View style={tw`mb-6 items-center`}>
                        <View style={tw`w-16 h-16 rounded-full bg-blue-100 items-center justify-center mb-3`}>
                            <Icon name="store" size={36} style={tw`text-blue-600`} />
                        </View>
                        <Text style={tw`text-2xl font-bold text-center text-gray-800`}>Đăng ký mở gian hàng</Text>
                        <Text style={tw`mt-2 text-center text-gray-600 px-4 text-base`}>
                            Đăng ký mở gian hàng trên ứng dụng {props.settings && props.settings.mk_website_name} để có thể tự đăng bán sản phẩm của bạn.
                        </Text>
                    </View>

                    {/* Show error message if it exists */}
                    {error && (
                        <View style={tw`mb-4 p-3 bg-red-50 border border-red-200 rounded-xl`}>
                            <View style={tw`flex-row items-center`}>
                                <Icon name="alert-circle" size={20} style={tw`text-red-500 mr-2`} />
                                <Text style={tw`text-red-600 flex-1`}>{error}</Text>
                            </View>
                        </View>
                    )}

                    <View style={tw`mb-5`}>
                        <Text style={tw`mb-2 text-gray-800 font-semibold text-base`}>Tên gian hàng</Text>
                        <View style={tw`flex-row border border-gray-300 rounded-xl overflow-hidden bg-gray-50`}>
                            <TextInput
                                style={tw`flex-1 p-3 text-base text-gray-800`}
                                onChangeText={validateForm}
                                value={shopName}
                                placeholder="Nhập tên gian hàng của bạn"
                                placeholderTextColor="#9CA3AF"
                                editable={!isSubmitting}
                            />
                        </View>
                        {!isValid && shopName.length > 0 && (
                            <View style={tw`flex-row items-center mt-2`}>
                                <Icon name="alert-circle-outline" size={16} style={tw`text-red-500 mr-1`} />
                                <Text style={tw`text-red-500`}>Vui lòng nhập tên gian hàng hợp lệ</Text>
                            </View>
                        )}
                    </View>

                    <View style={tw`mb-6`}>
                        <Text style={tw`mb-3 text-gray-800 font-semibold text-base`}>Loại gian hàng</Text>
                        <RadioOption
                            icon="cart-outline"
                            label="Sản phẩm"
                            description="Bán các sản phẩm vật lý, hàng hóa cụ thể"
                            value="Product"
                            selected={shopType === 'Product'}
                            onSelect={value => {
                                if (!isSubmitting) setShopType(value);
                            }}
                        />
                        <RadioOption
                            icon="account-wrench-outline"
                            label="Dịch vụ"
                            description="Cung cấp các dịch vụ, hỗ trợ khách hàng"
                            value="Service"
                            selected={shopType === 'Service'}
                            onSelect={value => {
                                if (!isSubmitting) setShopType(value);
                            }}
                        />
                    </View>

                    <TouchableOpacity
                        style={tw`mt-3 ${isValid && !isSubmitting ? 'bg-blue-600' : 'bg-gray-400'} p-4 rounded-xl items-center shadow-sm`}
                        onPress={handleSubmit}
                        disabled={!isValid || isSubmitting}
                        activeOpacity={0.8}
                    >
                        {isSubmitting ? (
                            <View style={tw`flex-row items-center`}>
                                <ActivityIndicator size="small" color="#FFFFFF" style={tw`mr-2`} />
                                <Text style={tw`text-white font-bold text-lg`}>Đang xử lý...</Text>
                            </View>
                        ) : (
                            <Text style={tw`text-white font-bold text-lg`}>Đăng ký ngay</Text>
                        )}
                    </TouchableOpacity>

                    <View style={tw`mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100`}>
                        <View style={tw`flex-row`}>
                            <Icon name="information-outline" size={22} style={tw`text-amber-500 mr-2 mt-0.5`} />
                            <Text style={tw`text-sm text-amber-700 flex-1`}>
                                Lưu ý: Sau khi đăng ký, đơn của bạn sẽ được gửi đến quản trị viên để xét duyệt.
                                Vui lòng chờ thông báo xác nhận.
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

export default RequestOpenShopForm;
