// FIXED AddProduct.js with proper gallery format support

import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View, Image, Platform } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import { useIsFocused } from "@react-navigation/native";
import { showMessage } from "react-native-flash-message";
import { launchImageLibrary } from 'react-native-image-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CategorySelector from "./CategorySelector";

function AddProduct(props) {
    const isFocused = useIsFocused();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [shopInfo, setShopInfo] = useState(null);
    const [categories, setCategories] = useState([]);

    // Form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [featureImage, setFeatureImage] = useState(null);
    const [featureImageFile, setFeatureImageFile] = useState(null);
    const [gallery, setGallery] = useState([]);
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [galleryData, setGalleryData] = useState([]); // Added to store the complete gallery data objects
    const [discount, setDiscount] = useState(0);
    const [selectedCategories, setSelectedCategories] = useState([]);

    // Rich text editor ref
    const richTextRef = React.useRef();

    // Standard initialization and API calls remain the same
    useEffect(() => {
        props.navigation.setOptions({
            title: 'Thêm sản phẩm mới',
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
            fetchCategories();
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
                setShopInfo(response.data);
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

    const fetchCategories = async () => {
        const token = await AsyncStorage.getItem('sme_user_token');

        try {
            const response = await axios({
                method: 'get',
                url: `${apiConfig.BASE_URL}/product-category`,
                params: {
                    type: 'product'
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                console.log("Categories loaded successfully");

                // If the data is not in the expected format, try to adapt it
                if (Array.isArray(response.data)) {
                    setCategories(response.data);
                } else if (response.data && typeof response.data === 'object') {
                    // If it's an object with a data property
                    if (Array.isArray(response.data.data)) {
                        setCategories(response.data.data);
                    } else if (response.data.categories && Array.isArray(response.data.categories)) {
                        setCategories(response.data.categories);
                    } else {
                        // Try to use the object itself
                        setCategories([response.data]);
                    }
                } else {
                    console.log("Unexpected categories data format");
                    setCategories([]);
                }
            }
        } catch (error) {
            console.log("Error fetching categories:", error);
            showMessage({
                message: error.response?.data?.message || 'Đã xảy ra lỗi khi tải danh mục sản phẩm',
                type: 'danger',
                icon: 'danger',
                duration: 3000,
            });
        }
    };

    // 1. Improved handleChooseImage function - updated to maintain galleryData
    const handleChooseImage = (type, isMultiple = false) => {
        const options = {
            mediaType: 'photo',
            quality: 0.8,
            selectionLimit: isMultiple ? 10 : 1,
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

            // Handle response based on API version
            if (response.assets && response.assets.length > 0) {
                // Handle response.assets array format (newer API)
                if (type === 'feature') {
                    setFeatureImageFile(response.assets[0]);
                    setFeatureImage(response.assets[0].uri);
                } else if (type === 'gallery') {
                    // For gallery, we need to handle multiple images
                    const newFiles = isMultiple ? [...galleryFiles, ...response.assets] : [response.assets[0]];
                    setGalleryFiles(newFiles);

                    // Store URLs for preview
                    const newUris = response.assets.map(file => file.uri);
                    setGallery([...gallery, ...newUris]);

                    // Create temporary gallery data objects for the new files
                    const newGalleryDataItems = response.assets.map((file, index) => ({
                        id: Date.now() + index,
                        name: file.fileName || `image-${Date.now()}-${index}.jpg`,
                        url: file.uri, // Temporary URL, will be replaced after upload
                        uid: `rc-upload-${Date.now()}-${index}`
                    }));

                    setGalleryData([...galleryData, ...newGalleryDataItems]);
                }
            } else if (response.uri) {
                // Handle single file object format (older API)
                if (type === 'feature') {
                    setFeatureImageFile(response);
                    setFeatureImage(response.uri);
                } else if (type === 'gallery') {
                    const newFiles = isMultiple ? [...galleryFiles, response] : [response];
                    setGalleryFiles(newFiles);

                    // Store URLs for preview
                    setGallery([...gallery, response.uri]);

                    // Create temporary gallery data object
                    const newGalleryDataItem = {
                        id: Date.now(),
                        name: response.fileName || `image-${Date.now()}.jpg`,
                        url: response.uri, // Temporary URL, will be replaced after upload
                        uid: `rc-upload-${Date.now()}`
                    };

                    setGalleryData([...galleryData, newGalleryDataItem]);
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

    // 2. Fixed uploadImage function - returns the complete image object
    const uploadImage = async (photo) => {
        if (!photo) {
            console.log('No photo provided for upload');
            return null;
        }

        console.log('Attempting to upload photo...');
        const token = await AsyncStorage.getItem('sme_user_token');

        try {
            // Extract the image data based on different possible structures
            const photoToUpload = photo.assets?.[0] || photo;

            // Create a FormData object
            const formData = new FormData();

            formData.append('files', {
                name: photoToUpload.fileName || 'image.jpg',
                type: photoToUpload.type || 'image/jpeg',
                uri: Platform.OS === 'ios'
                    ? photoToUpload.uri.replace('file://', '')
                    : photoToUpload.uri
            });

            console.log('FormData created with image:', photoToUpload.uri);

            // Make the request using axios instead of fetch
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

            console.log('Upload response status:', response.status);

            // HTTP 201 is "Created" which is a success status
            if (response.status === 200 || response.status === 201) {
                const responseData = response.data;
                console.log('Upload successful, response data:', JSON.stringify(responseData).substring(0, 200));

                if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].url) {
                    // Return the complete image data object
                    const imageData = responseData[0];
                    const fullUrl = apiConfig.BASE_URL + imageData.url;

                    // Return the image data in the required format
                    return {
                        id: imageData.id || Date.now(),
                        name: imageData.name || photoToUpload.fileName || 'image.jpg',
                        url: fullUrl,
                        uid: `rc-upload-${Date.now()}`
                    };
                } else {
                    console.log('Unexpected response format:', responseData);
                    return null;
                }
            } else {
                console.log('Upload failed with status:', response.status);
                return null;
            }
        } catch (error) {
            console.log('Upload error:', error);
            console.log('Error details:', error.response?.data || error.message);
            return null;
        }
    };

    // 3. Improved uploadGalleryImages function - maintains the gallery data
    const uploadGalleryImages = async (files) => {
        if (!files || files.length === 0) {
            console.log('No gallery files to upload');
            return [];
        }

        const uploadedGalleryData = [];

        // Show a loading message for multiple uploads
        if (files.length > 1) {
            showMessage({
                message: `Đang tải ${files.length} ảnh lên...`,
                type: 'info',
                icon: 'info',
                duration: 3000,
            });
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                console.log(`Uploading gallery image ${i+1}/${files.length}`);
                const uploadResult = await uploadImage(file);
                if (uploadResult) {
                    uploadedGalleryData.push(uploadResult);
                    console.log(`Successfully uploaded image ${i+1}/${files.length}`);
                } else {
                    console.log(`Failed to upload image ${i+1}/${files.length}`);
                }
            } catch (error) {
                console.log(`Error uploading gallery image ${i+1}/${files.length}:`, error.message);
            }
        }

        console.log(`Uploaded ${uploadedGalleryData.length}/${files.length} gallery images successfully`);
        return uploadedGalleryData;
    };

    // 4. Improved handleSubmit function - adds gallery data to the product data
    const handleSubmit = async () => {
        // Form validation checks (existing code)
        if (!name.trim()) {
            showMessage({
                message: 'Vui lòng nhập tên sản phẩm',
                type: 'warning',
                icon: 'warning',
                duration: 3000,
            });
            return;
        }

        if (!content) {
            showMessage({
                message: 'Vui lòng nhập nội dung sản phẩm',
                type: 'warning',
                icon: 'warning',
                duration: 3000,
            });
            return;
        }

        if (!featureImage) {
            showMessage({
                message: 'Vui lòng chọn ảnh đại diện cho sản phẩm',
                type: 'warning',
                icon: 'warning',
                duration: 3000,
            });
            return;
        }

        if (selectedCategories.length === 0) {
            showMessage({
                message: 'Vui lòng chọn ít nhất một danh mục sản phẩm',
                type: 'warning',
                icon: 'warning',
                duration: 3000,
            });
            return;
        }

        setSubmitting(true);
        const token = await AsyncStorage.getItem('sme_user_token');

        try {
            // 1. Upload feature image
            let uploadedFeatureImage = null;
            let featureImageObject = null;

            if (featureImageFile) {
                showMessage({
                    message: 'Đang tải ảnh đại diện...',
                    type: 'info',
                    icon: 'info',
                    duration: 2000,
                });

                featureImageObject = await uploadImage(featureImageFile);
                console.log('Feature image upload result:', featureImageObject);

                if (featureImageObject) {
                    uploadedFeatureImage = featureImageObject.url;
                } else {
                    console.log('Feature image upload failed, trying one more time...');
                    // Try one more time
                    featureImageObject = await uploadImage(featureImageFile);

                    if (featureImageObject) {
                        uploadedFeatureImage = featureImageObject.url;
                    } else {
                        showMessage({
                            message: 'Không thể tải ảnh đại diện, vui lòng thử lại sau',
                            type: 'warning',
                            icon: 'warning',
                            duration: 3000,
                        });
                        setSubmitting(false);
                        return; // Exit without throwing error to let user try again
                    }
                }
            }

            // 2. Upload gallery images
            let uploadedGalleryData = [];
            if (galleryFiles.length > 0) {
                showMessage({
                    message: 'Đang tải thư viện ảnh...',
                    type: 'info',
                    icon: 'info',
                    duration: 2000,
                });

                uploadedGalleryData = await uploadGalleryImages(galleryFiles);
                console.log(`Gallery upload complete: ${uploadedGalleryData.length} images uploaded`);
            }

            // 3. Create slug from name
            const slug = name.toLowerCase()
                .replace(/ /g, '-')
                .replace(/[^\w-]+/g, '');

            // 4. Submit product data
            const productData = {
                name,
                slug,
                description,
                content,
                featureImage: uploadedFeatureImage,
                gallery: JSON.stringify(uploadedGalleryData), // Use the formatted gallery data
                categories: JSON.stringify(selectedCategories),
                giamgiaPercent: discount,
                type: 'Sản phẩm',
                shop: shopInfo.id
            };

            console.log('Submitting product data:', JSON.stringify(productData).substring(0, 200));

            const response = await axios.post(
                `${apiConfig.BASE_URL}/member/product`,
                productData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200 || response.status === 201) {
                showMessage({
                    message: 'Tạo sản phẩm mới thành công',
                    type: 'success',
                    icon: 'success',
                    duration: 3000,
                });
                setSubmitting(false);
                // Navigate to edit screen with product ID
                props.navigation.navigate('EditProduct', { id: response.data.id });
            }
        } catch (error) {
            console.log('Error creating product:', error);
            setSubmitting(false);
            showMessage({
                message: error.response?.data?.message || 'Đã xảy ra lỗi khi tạo sản phẩm',
                type: 'danger',
                icon: 'danger',
                duration: 3000,
            });
        }
    };

    // 5. Improved removeGalleryImage function - maintains the gallery data
    const removeGalleryImage = (index) => {
        if (index < 0 || index >= gallery.length) {
            console.log('Invalid gallery index:', index);
            return;
        }

        console.log(`Removing gallery image at index ${index}`);

        // Remove from gallery URLs array
        const newGallery = [...gallery];
        const removedUri = newGallery[index];
        newGallery.splice(index, 1);
        setGallery(newGallery);

        // Remove from galleryData array
        const newGalleryData = [...galleryData];
        newGalleryData.splice(index, 1);
        setGalleryData(newGalleryData);

        // Also remove from galleryFiles if present
        const fileIndex = galleryFiles.findIndex(file => {
            const fileUri = file.uri || (file.assets && file.assets[0]?.uri);
            return fileUri === removedUri;
        });

        if (fileIndex !== -1) {
            console.log(`Removing gallery file at index ${fileIndex}`);
            const newGalleryFiles = [...galleryFiles];
            newGalleryFiles.splice(fileIndex, 1);
            setGalleryFiles(newGalleryFiles);
        } else {
            console.log(`No matching gallery file found for URI: ${removedUri}`);
        }
    };

    // The UI rendering code remains the same
    if (loading) {
        return (
            <View style={tw`flex-1 justify-center items-center bg-white`}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <KeyboardAwareScrollView style={tw`flex-1 bg-gray-100`} contentContainerStyle={tw`pb-12`}>
            <StatusBar barStyle="light-content" backgroundColor="#3b82f6" />

            <View style={tw`p-4`}>
                <View style={tw`bg-white p-4 rounded-lg shadow-sm mb-4`}>
                    <Text style={tw`font-medium text-gray-800 mb-4`}>Thông tin sản phẩm</Text>

                    <View style={tw`mb-4`}>
                        <Text style={tw`text-gray-600 mb-2`}>Tên sản phẩm <Text style={tw`text-red-500`}>*</Text></Text>
                        <TextInput
                            style={tw`border border-gray-300 rounded-lg p-3`}
                            placeholder="Nhập tên sản phẩm"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={tw`mb-4`}>
                        <Text style={tw`text-gray-600 mb-2`}>Mô tả ngắn</Text>
                        <TextInput
                            style={tw`border border-gray-300 rounded-lg p-3 h-20`}
                            placeholder="Nhập mô tả ngắn về sản phẩm"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={tw`mb-4`}>
                        <Text style={tw`text-gray-600 mb-2`}>Giảm giá (%)</Text>
                        <TextInput
                            style={tw`border border-gray-300 rounded-lg p-3`}
                            placeholder="Nhập % giảm giá (0-100)"
                            value={discount.toString()}
                            onChangeText={text => {
                                const value = parseInt(text) || 0;
                                setDiscount(Math.min(100, Math.max(0, value)));
                            }}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <View style={tw`bg-white p-4 rounded-lg shadow-sm mb-4`}>
                    <Text style={tw`font-medium text-gray-800 mb-4`}>Nội dung sản phẩm <Text style={tw`text-red-500`}>*</Text></Text>

                    <View style={tw`flex-row mb-2 bg-gray-100 p-2 rounded-t-lg border border-gray-300 border-b-0`}>
                        <TouchableOpacity
                            style={tw`p-2 mr-2`}
                            onPress={() => setContent(content + '**Đậm**')}
                        >
                            <Icon name="format-bold" size={20} style={tw`text-gray-700`} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={tw`p-2 mr-2`}
                            onPress={() => setContent(content + '*Nghiêng*')}
                        >
                            <Icon name="format-italic" size={20} style={tw`text-gray-700`} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={tw`p-2 mr-2`}
                            onPress={() => setContent(content + '\n- Danh sách\n- Mục')}
                        >
                            <Icon name="format-list-bulleted" size={20} style={tw`text-gray-700`} />
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={tw`border border-gray-300 rounded-b-lg p-3 h-40 bg-white`}
                        placeholder="Nhập mô tả chi tiết về sản phẩm..."
                        value={content}
                        onChangeText={setContent}
                        multiline
                        textAlignVertical="top"
                    />
                </View>

                <View style={tw`bg-white p-4 rounded-lg shadow-sm mb-4`}>
                    <Text style={tw`font-medium text-gray-800 mb-4`}>Ảnh sản phẩm</Text>

                    <View style={tw`mb-5 pb-5 border-b border-gray-200`}>
                        <Text style={tw`text-gray-600 mb-2`}>Ảnh đại diện <Text style={tw`text-red-500`}>*</Text></Text>
                        {featureImage ? (
                            <View style={tw`mb-2`}>
                                <Image source={{ uri: featureImage }} style={tw`w-full h-40 rounded-lg bg-gray-200`} />
                            </View>
                        ) : (
                            <View style={tw`w-full h-40 rounded-lg bg-gray-200 items-center justify-center mb-2`}>
                                <Icon name="image-outline" size={40} style={tw`text-gray-400`} />
                            </View>
                        )}

                        <TouchableOpacity
                            style={tw`bg-blue-500 py-2 px-4 rounded-lg flex-row items-center justify-center mt-2`}
                            onPress={() => handleChooseImage('feature')}
                        >
                            <Icon name="camera" size={18} style={tw`text-white mr-1`} />
                            <Text style={tw`text-white`}>{featureImage ? 'Đổi ảnh đại diện' : 'Chọn ảnh đại diện'}</Text>
                        </TouchableOpacity>

                        {featureImage && (
                            <TouchableOpacity
                                style={tw`bg-red-500 py-2 px-4 rounded-lg flex-row items-center justify-center mt-2`}
                                onPress={() => {
                                    setFeatureImage(null);
                                    setFeatureImageFile(null);
                                }}
                            >
                                <Icon name="delete" size={18} style={tw`text-white mr-1`} />
                                <Text style={tw`text-white`}>Xóa ảnh</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View>
                        <Text style={tw`text-gray-600 mb-2`}>Thư viện ảnh</Text>

                        {gallery.length > 0 ? (
                            <View style={tw`flex-row flex-wrap mb-2`}>
                                {gallery.map((uri, index) => (
                                    <View key={index} style={tw`w-1/3 p-1`}>
                                        <View style={tw`relative`}>
                                            <Image source={{ uri }} style={tw`w-full h-24 rounded-lg bg-gray-200`} />
                                            <TouchableOpacity
                                                style={tw`absolute top-1 right-1 bg-red-500 rounded-full w-6 h-6 items-center justify-center`}
                                                onPress={() => removeGalleryImage(index)}
                                            >
                                                <Icon name="close" size={16} style={tw`text-white`} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View style={tw`w-full h-24 rounded-lg bg-gray-200 items-center justify-center mb-2`}>
                                <Text style={tw`text-gray-400`}>Chưa có ảnh nào</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={tw`bg-blue-500 py-2 px-4 rounded-lg flex-row items-center justify-center mt-2`}
                            onPress={() => handleChooseImage('gallery', true)}
                        >
                            <Icon name="image-multiple" size={18} style={tw`text-white mr-1`} />
                            <Text style={tw`text-white`}>{gallery.length > 0 ? 'Thêm ảnh vào thư viện' : 'Tải ảnh lên thư viện'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={tw`bg-white p-4 rounded-lg shadow-sm mb-4`}>
                    <Text style={tw`font-medium text-gray-800 mb-4`}>Danh mục sản phẩm <Text style={tw`text-red-500`}>*</Text></Text>
                    <ScrollView style={tw`max-h-96`}>
                        <CategorySelector
                            categories={categories}
                            selectedCategories={selectedCategories}
                            onCategoriesChange={setSelectedCategories}
                            required={true}
                        />
                    </ScrollView>
                </View>

                <TouchableOpacity
                    style={tw`bg-blue-600 p-4 rounded-lg items-center justify-center mb-10`}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={tw`text-white font-bold text-lg`}>Tạo sản phẩm</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAwareScrollView>
    );
}

export default AddProduct;
