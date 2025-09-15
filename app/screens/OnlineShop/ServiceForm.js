import React, { useState, useEffect } from "react";
import { ActivityIndicator, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View, Image, Platform } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import { showMessage } from "react-native-flash-message";
import { launchImageLibrary } from 'react-native-image-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CustomSelector from "./CustomSelector";

// Constants from Model.js
const ServiceStatus = ['Đăng', 'Ẩn'];
const ServiceType = ['Đồ ăn', 'Dịch vụ'];
const ServiceFeaturedStatus = ['Có', 'Không'];

function ServiceForm({ type, initialValues, categories, onSubmit, onCancel, service }) {
    // Xử lý an toàn các giá trị từ service
    const getInitialSelectedCategories = () => {
        // Nếu đã có initialValues.categories, sử dụng nó
        if (initialValues?.categories) {
            return initialValues.categories;
        }

        // Nếu có service.categories và là mảng, map các id
        if (service?.categories && Array.isArray(service.categories)) {
            return service.categories.map(cat => cat.id);
        }

        // Nếu có service.categories nhưng không phải mảng (có thể là chuỗi JSON), parse nó
        if (service?.categories && typeof service.categories === 'string') {
            try {
                const parsedCategories = JSON.parse(service.categories);
                if (Array.isArray(parsedCategories)) {
                    return parsedCategories;
                }
            } catch (error) {
                console.log('Error parsing categories:', error);
            }
        }

        // Mặc định trả về mảng rỗng
        return [];
    };

    const [name, setName] = useState(initialValues?.name || service?.name || '');
    const [price, setPrice] = useState(initialValues?.price?.toString() || service?.price?.toString() || '');
    const [selectedType, setSelectedType] = useState(initialValues?.type || service?.type || ServiceType[0]);
    const [selectedStatus, setSelectedStatus] = useState(initialValues?.status || service?.status || ServiceStatus[0]);
    const [selectedFeatured, setSelectedFeatured] = useState(initialValues?.featured || service?.featured || ServiceFeaturedStatus[1]);
    const [image, setImage] = useState(initialValues?.image || service?.image || null);
    const [imageFile, setImageFile] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState(getInitialSelectedCategories());
    const [submitting, setSubmitting] = useState(false);

    // Log để debug
    useEffect(() => {
        console.log('ServiceForm initialized with:');
        console.log('- service:', service ? JSON.stringify(service) : 'null');
        console.log('- categories:', categories ? categories.length : 'null');
        console.log('- selectedCategories:', selectedCategories);
    }, []);

    // Create option arrays for dropdown selectors
    const typeOptions = ServiceType.map(item => ({ id: item, name: item }));
    const statusOptions = ServiceStatus.map(item => ({ id: item, name: item }));
    const featuredOptions = ServiceFeaturedStatus.map(item => ({ id: item, name: item }));

    const handleChooseImage = () => {
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
                setImageFile(response.assets[0]);
                setImage(response.assets[0].uri);
            } else if (response.uri) {
                // Older API format
                setImageFile(response);
                setImage(response.uri);
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

        Object.keys(body).forEach((key) => {
            data.append(key, body[key]);
        });

        return data;
    };

    const uploadImage = async (photo) => {
        if (!photo) return null;

        const token = await AsyncStorage.getItem('sme_user_token');

        try {
            // Use axios for better error handling
            const formData = createFormData(photo);

            const response = await axios({
                url: `${apiConfig.BASE_URL}/media/member/upload`,
                method: 'POST',
                data: formData,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                transformRequest: (data, headers) => {
                    // Let axios set the proper content-type with boundary
                    return data;
                },
            });

            if (response.status === 200 || response.status === 201) {
                const responseData = response.data;

                if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].url) {
                    return apiConfig.BASE_URL + responseData[0].url;
                }
            }

            return null;
        } catch (error) {
            console.log('Upload error:', error);
            return null;
        }
    };

    const handleSubmit = async () => {
        // Validate form
        if (!name.trim()) {
            showMessage({
                message: 'Vui lòng nhập tên món',
                type: 'warning',
                icon: 'warning',
                duration: 3000,
            });
            return;
        }

        if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
            showMessage({
                message: 'Vui lòng nhập giá hợp lệ',
                type: 'warning',
                icon: 'warning',
                duration: 3000,
            });
            return;
        }

        if (selectedCategories.length === 0) {
            showMessage({
                message: 'Vui lòng chọn ít nhất một danh mục',
                type: 'warning',
                icon: 'warning',
                duration: 3000,
            });
            return;
        }

        setSubmitting(true);

        try {
            // Upload image if changed
            let uploadedImage = image;
            if (imageFile) {
                showMessage({
                    message: 'Đang tải ảnh...',
                    type: 'info',
                    icon: 'info',
                    duration: 2000,
                });

                uploadedImage = await uploadImage(imageFile);
                if (!uploadedImage) {
                    console.log('Image upload failed, trying one more time...');
                    // Try one more time
                    uploadedImage = await uploadImage(imageFile);

                    if (!uploadedImage) {
                        showMessage({
                            message: 'Không thể tải ảnh, vui lòng thử lại sau',
                            type: 'warning',
                            icon: 'warning',
                            duration: 3000,
                        });
                        setSubmitting(false);
                        return;
                    }
                }
            }

            // Prepare data for submission
            const serviceData = {
                name,
                price: parseFloat(price),
                type: selectedType,
                status: selectedStatus,
                featured: selectedFeatured,
                image: uploadedImage,
                categories: JSON.stringify(selectedCategories)
            };

            console.log('Submitting service data:', serviceData);

            // Handle different submission types
            if (type === 'add') {
                onSubmit(serviceData);
            } else if (type === 'edit') {
                onSubmit({
                    values: serviceData,
                    id: service.id
                });
            }

            setSubmitting(false);
        } catch (error) {
            console.log(error);
            setSubmitting(false);
            showMessage({
                message: error.message || 'Đã xảy ra lỗi khi xử lý form',
                type: 'danger',
                icon: 'danger',
                duration: 3000,
            });
        }
    };

    const toggleCategory = (categoryId) => {
        if (selectedCategories.includes(categoryId)) {
            setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
        } else {
            setSelectedCategories([...selectedCategories, categoryId]);
        }
    };

    const renderCategories = () => {
        if (!categories || categories.length === 0) {
            return (
                <View style={tw`bg-gray-100 p-3 rounded-lg mb-4`}>
                    <Text style={tw`text-gray-500 text-center`}>Không có danh mục</Text>
                </View>
            );
        }

        const renderCategoryItem = (category, level = 0) => {
            // Bảo vệ nếu category không có id
            if (!category || !category.id) {
                console.log('Invalid category:', category);
                return null;
            }

            return (
                <View key={category.id}>
                    <TouchableOpacity
                        style={tw`flex-row items-center py-2 px-${level * 3}`}
                        onPress={() => toggleCategory(category.id)}
                    >
                        <Icon
                            name={selectedCategories.includes(category.id) ? "checkbox-marked" : "checkbox-blank-outline"}
                            size={20}
                            style={tw`${selectedCategories.includes(category.id) ? 'text-blue-500' : 'text-gray-500'} mr-2`}
                        />
                        <Text>{category.name}</Text>
                    </TouchableOpacity>

                    {category.children && Array.isArray(category.children) && category.children.length > 0 && (
                        <View style={tw`ml-3`}>
                            {category.children.map(child => renderCategoryItem(child, level + 1))}
                        </View>
                    )}
                </View>
            );
        };

        return (
            <View style={tw`bg-white p-3 rounded-lg mb-4`}>
                {categories.map(category => renderCategoryItem(category))}
            </View>
        );
    };

    return (
        <KeyboardAwareScrollView style={tw`flex-1 bg-gray-100`} contentContainerStyle={tw`pb-10`}>
            <StatusBar barStyle="light-content" backgroundColor="#3b82f6" />

            <View style={tw`p-4`}>
                <View style={tw`flex-row justify-between items-center mb-5`}>
                    <Text style={tw`text-xl font-bold`}>{type === 'add' ? 'Thêm món mới' : 'Chỉnh sửa món'}</Text>
                    <TouchableOpacity onPress={onCancel}>
                        <Icon name="close" size={24} />
                    </TouchableOpacity>
                </View>

                <View style={tw`bg-white p-4 rounded-lg shadow-sm mb-4`}>
                    <Text style={tw`font-medium text-gray-800 mb-4`}>Thông tin món</Text>

                    <View style={tw`mb-5`}>
                        <Text style={tw`text-gray-600 mb-2`}>Ảnh đại diện</Text>
                        {image ? (
                            <View style={tw`mb-2`}>
                                <Image source={{ uri: image }} style={tw`w-full h-40 rounded-lg bg-gray-200`} />
                            </View>
                        ) : (
                            <View style={tw`w-full h-40 rounded-lg bg-gray-200 items-center justify-center mb-2`}>
                                <Icon name="image-outline" size={40} style={tw`text-gray-400`} />
                            </View>
                        )}

                        <TouchableOpacity
                            style={tw`bg-blue-500 py-2 px-4 rounded-lg flex-row items-center justify-center mt-2`}
                            onPress={handleChooseImage}
                        >
                            <Icon name="camera" size={18} style={tw`text-white mr-1`} />
                            <Text style={tw`text-white`}>{image ? 'Đổi ảnh' : 'Chọn ảnh'}</Text>
                        </TouchableOpacity>

                        {image && imageFile && (
                            <TouchableOpacity
                                style={tw`bg-red-500 py-2 px-4 rounded-lg flex-row items-center justify-center mt-2`}
                                onPress={() => {
                                    setImage(initialValues?.image || service?.image || null);
                                    setImageFile(null);
                                }}
                            >
                                <Icon name="delete" size={18} style={tw`text-white mr-1`} />
                                <Text style={tw`text-white`}>Hủy thay đổi ảnh</Text>
                            </TouchableOpacity>
                        )}

                        {image && !imageFile && type === 'edit' && (
                            <TouchableOpacity
                                style={tw`bg-red-500 py-2 px-4 rounded-lg flex-row items-center justify-center mt-2`}
                                onPress={() => {
                                    setImage(null);
                                    setImageFile(null);
                                }}
                            >
                                <Icon name="delete" size={18} style={tw`text-white mr-1`} />
                                <Text style={tw`text-white`}>Xóa ảnh</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={tw`mb-4`}>
                        <Text style={tw`text-gray-600 mb-2`}>Tên món <Text style={tw`text-red-500`}>*</Text></Text>
                        <TextInput
                            style={tw`border border-gray-300 rounded-lg p-3`}
                            placeholder="Nhập tên món"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={tw`mb-4`}>
                        <Text style={tw`text-gray-600 mb-2`}>Giá <Text style={tw`text-red-500`}>*</Text></Text>
                        <TextInput
                            style={tw`border border-gray-300 rounded-lg p-3`}
                            placeholder="Nhập giá"
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={tw`mb-4`}>
                        <Text style={tw`text-gray-600 mb-2`}>Loại <Text style={tw`text-red-500`}>*</Text></Text>
                        <CustomSelector
                            placeholder="Chọn loại"
                            value={selectedType}
                            onValueChange={(value) => setSelectedType(value)}
                            items={typeOptions}
                        />
                    </View>

                    {type === 'edit' && (
                        <>
                            <View style={tw`mb-4`}>
                                <Text style={tw`text-gray-600 mb-2`}>Trạng thái</Text>
                                <CustomSelector
                                    placeholder="Chọn trạng thái"
                                    value={selectedStatus}
                                    onValueChange={(value) => setSelectedStatus(value)}
                                    items={statusOptions}
                                />
                            </View>
                        </>
                    )}
                </View>

                <View style={tw`bg-white p-4 rounded-lg shadow-sm mb-4`}>
                    <Text style={tw`font-medium text-gray-800 mb-4`}>Danh mục <Text style={tw`text-red-500`}>*</Text></Text>
                    {renderCategories()}
                </View>

                <View style={tw`flex-row justify-between mt-4`}>
                    <TouchableOpacity
                        style={tw`bg-gray-500 py-3 px-4 rounded-lg flex-1 mr-2 items-center`}
                        onPress={onCancel}
                        disabled={submitting}
                    >
                        <Text style={tw`text-white font-medium`}>Hủy</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={tw`bg-blue-600 py-3 px-4 rounded-lg flex-1 ml-2 items-center`}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={tw`text-white font-medium`}>{type === 'add' ? 'Thêm mới' : 'Lưu thay đổi'}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAwareScrollView>
    );
}

export default ServiceForm;
