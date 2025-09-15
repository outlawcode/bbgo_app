import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StatusBar, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import { useIsFocused } from "@react-navigation/native";
import { showMessage } from "react-native-flash-message";
import ServiceForm from "./ServiceForm";

function EditService(props) {
    const isFocused = useIsFocused();
    const { service } = props.route.params;
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    // Thay vì lưu refreshedService, chúng ta sẽ làm việc trực tiếp với service
    // từ route.params
    const [updatedService, setUpdatedService] = useState(service);

    useEffect(() => {
        props.navigation.setOptions({
            title: 'Chỉnh sửa Món',
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
            setLoading(true);
            fetchCategories().finally(() => setLoading(false));
        }
    }, [isFocused]);

    // Cập nhật dữ liệu service khi có thay đổi từ props
    useEffect(() => {
        setUpdatedService(service);
    }, [service]);

    const fetchCategories = async () => {
        console.log("Fetching categories...");
        const token = await AsyncStorage.getItem('sme_user_token');

        try {
            const response = await axios({
                method: 'get',
                url: `${apiConfig.BASE_URL}/product-category`,
                params: {
                    type: 'service'
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

    const handleUpdateService = async (serviceData) => {
        const token = await AsyncStorage.getItem('sme_user_token');

        try {
            const response = await axios.put(
                `${apiConfig.BASE_URL}/member/services/${serviceData.id}`,
                serviceData.values,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                // Cập nhật dữ liệu cục bộ với dữ liệu mới
                const updatedData = {
                    ...updatedService,
                    ...serviceData.values
                };
                setUpdatedService(updatedData);

                showMessage({
                    message: 'Đã cập nhật món thành công',
                    type: 'success',
                    icon: 'success',
                    duration: 3000,
                });

                // Truyền dữ liệu cập nhật lại màn hình trước đó thông qua navigation params
                props.navigation.navigate({
                    name: 'ShopServices',
                    params: { updatedService: updatedData },
                    merge: true
                });
            }
        } catch (error) {
            console.log(error);
            showMessage({
                message: error.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật món',
                type: 'danger',
                icon: 'danger',
                duration: 3000,
            });
        }
    };

    const handleDeleteService = () => {
        Alert.alert(
            "Xác nhận xóa",
            `Bạn có chắc chắn muốn xóa "${updatedService?.name || service.name}"?`,
            [
                {
                    text: "Hủy",
                    style: "cancel"
                },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => {
                        const token = await AsyncStorage.getItem('sme_user_token');

                        try {
                            const response = await axios.delete(
                                `${apiConfig.BASE_URL}/member/services/${service.id}`,
                                { headers: { Authorization: `Bearer ${token}` } }
                            );

                            if (response.status === 200) {
                                showMessage({
                                    message: 'Đã xóa món',
                                    type: 'success',
                                    icon: 'success',
                                    duration: 3000,
                                });

                                // Truyền thông tin rằng service đã bị xóa
                                props.navigation.navigate({
                                    name: 'ShopServices',
                                    params: { deletedServiceId: service.id },
                                    merge: true
                                });
                            }
                        } catch (error) {
                            console.log(error);
                            showMessage({
                                message: error.response?.data?.message || 'Đã xảy ra lỗi khi xóa món',
                                type: 'danger',
                                icon: 'danger',
                                duration: 3000,
                            });
                        }
                    }
                }
            ]
        );
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

            <ServiceForm
                type="edit"
                service={updatedService}
                categories={categories}
                onSubmit={handleUpdateService}
                onCancel={() => props.navigation.goBack()}
            />

            <TouchableOpacity
                style={tw`absolute bottom-5 right-5 bg-red-500 w-14 h-14 rounded-full items-center justify-center shadow-md`}
                onPress={handleDeleteService}
            >
                <Icon name="delete" size={30} style={tw`text-white`} />
            </TouchableOpacity>
        </View>
    );
}

export default EditService;
