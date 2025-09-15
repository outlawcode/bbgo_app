import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StatusBar, Text, TextInput, TouchableOpacity, View, Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import { useIsFocused } from "@react-navigation/native";
import { formatVND } from "app/utils/helper.js";
import { showMessage } from "react-native-flash-message";
import defaultFoodImage from "app/assets/images/default-food.png";
import ServiceForm from "./ServiceForm";
import CustomSelector from "./CustomSelector"; // Import CustomSelector component

// Constants from Model.js
const ServiceStatus = ['Đăng', 'Ẩn'];
const ServiceType = ['Đồ ăn', 'Dịch vụ'];
const ServiceFeaturedStatus = ['Có', 'Không'];

function ShopServices(props) {
    const isFocused = useIsFocused();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [status, setStatus] = useState('ALL');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [categories, setCategories] = useState([]);
    const [shopInfo, setShopInfo] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [initialLoadDone, setInitialLoadDone] = useState(false);

    // Lấy params từ navigation
    const route = props.route;
    const { updatedService, deletedServiceId } = route.params || {};

    useEffect(() => {
        props.navigation.setOptions({
            title: 'Quản lý Món',
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
            headerRight: () => (
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setShowAddForm(true)}
                    style={tw`mr-3`}
                >
                    <Icon name="plus-circle" size={26} style={tw`text-white`} />
                </TouchableOpacity>
            ),
        });
    }, []);

    // Initial data load
    useEffect(() => {
        if (isFocused && !initialLoadDone) {
            setLoading(true);

            // Define an async function to handle the initial load
            const initialLoad = async () => {
                try {
                    await fetchShopInfo();
                    await fetchCategories();
                    setInitialLoadDone(true);
                } catch (error) {
                    console.log("Error in initial load:", error);
                    setLoading(false);
                }
            };

            initialLoad();
        }
    }, [isFocused]);

    // Watch for shop info changes to trigger service fetch
    useEffect(() => {
        if (shopInfo && initialLoadDone) {
            fetchServices();
        }
    }, [shopInfo, initialLoadDone]);

    // Filter changes trigger service fetch
    useEffect(() => {
        if (initialLoadDone && shopInfo) {
            fetchServices();
        }
    }, [status, selectedCategory, searchQuery]);

    // Xử lý cập nhật dữ liệu khi nhận được updatedService hoặc deletedServiceId từ màn hình Edit
    useEffect(() => {
        if (updatedService && services.length > 0) {
            console.log("Received updated service:", updatedService.id);

            // Cập nhật dịch vụ trong danh sách hiện tại mà không cần gọi API
            const updatedServices = services.map(service =>
                service.id === updatedService.id ? updatedService : service
            );

            setServices(updatedServices);

            // Reset params để tránh cập nhật lại khi component re-render
            props.navigation.setParams({ updatedService: null });
        }
    }, [updatedService]);

    // Xử lý xóa dịch vụ
    useEffect(() => {
        if (deletedServiceId && services.length > 0) {
            console.log("Received deleted service ID:", deletedServiceId);

            // Xóa dịch vụ khỏi danh sách hiện tại mà không cần gọi API
            const filteredServices = services.filter(service =>
                service.id !== deletedServiceId
            );

            setServices(filteredServices);

            // Reset params để tránh cập nhật lại khi component re-render
            props.navigation.setParams({ deletedServiceId: null });
        }
    }, [deletedServiceId]);

    const fetchShopInfo = async () => {
        console.log("Fetching shop info...");
        const token = await AsyncStorage.getItem('sme_user_token');

        try {
            const response = await axios({
                method: 'get',
                url: `${apiConfig.BASE_URL}/member/user-shop`,
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                console.log("Shop info loaded successfully");
                setShopInfo(response.data);
                return response.data;
            }
        } catch (error) {
            console.log("Error fetching shop info:", error);
            showMessage({
                message: error.response?.data?.message || 'Đã xảy ra lỗi khi tải thông tin cửa hàng',
                type: 'danger',
                icon: 'danger',
                duration: 3000,
            });
            throw error;
        }
    };

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
                return categories;
            }
        } catch (error) {
            console.log("Error fetching categories:", error);
            showMessage({
                message: error.response?.data?.message || 'Đã xảy ra lỗi khi tải danh mục sản phẩm',
                type: 'danger',
                icon: 'danger',
                duration: 3000,
            });
            throw error;
        }
    };

    const fetchServices = async () => {
        console.log("Fetching services...", { status, selectedCategory, shopId: shopInfo?.id });
        setLoading(true);
        const token = await AsyncStorage.getItem('sme_user_token');

        if (!shopInfo || !shopInfo.id) {
            console.log("No shop info available, cannot fetch services");
            setLoading(false);
            return;
        }

        try {
            const response = await axios({
                method: 'get',
                url: `${apiConfig.BASE_URL}/member/services`,
                params: {
                    query: searchQuery || null,
                    status,
                    category: selectedCategory === 'ALL' ? 'ALL' : [selectedCategory],
                    serviceAddress: [shopInfo.id],
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                console.log(`Services loaded successfully: ${response.data.length} items`);

                // Đảm bảo mỗi service có thuộc tính categories là một mảng
                const normalizedServices = response.data.map(service => {
                    // Nếu service không có categories hoặc không phải mảng
                    if (!service.categories || !Array.isArray(service.categories)) {
                        // Thử parse nếu là chuỗi JSON
                        if (typeof service.categories === 'string') {
                            try {
                                service.categories = JSON.parse(service.categories);
                                // Kiểm tra xem sau khi parse có phải mảng không
                                if (!Array.isArray(service.categories)) {
                                    service.categories = [];
                                }
                            } catch (error) {
                                console.log('Error parsing categories string:', error);
                                service.categories = [];
                            }
                        } else {
                            // Nếu không phải chuỗi, gán một mảng trống
                            service.categories = [];
                        }
                    }
                    return service;
                });

                setServices(normalizedServices);
                setLoading(false);
                setRefreshing(false);
            }
        } catch (error) {
            console.log("Error fetching services:", error);
            setLoading(false);
            setRefreshing(false);
            showMessage({
                message: error.response?.data?.message || 'Đã xảy ra lỗi khi tải dịch vụ',
                type: 'danger',
                icon: 'danger',
                duration: 3000,
            });
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchShopInfo();
        fetchCategories();
        fetchServices();
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
    };

    const handleAddService = async (serviceData) => {
        const token = await AsyncStorage.getItem('sme_user_token');

        try {
            const response = await axios.post(
                `${apiConfig.BASE_URL}/member/services`,
                {
                    ...serviceData,
                    serviceAddress: JSON.stringify([shopInfo.id])
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200 || response.status === 201) {
                showMessage({
                    message: 'Đã thêm dịch vụ mới',
                    type: 'success',
                    icon: 'success',
                    duration: 3000,
                });

                // Thêm dịch vụ mới vào state hiện tại
                if (response.data) {
                    // Đảm bảo service mới có categories là mảng
                    let newService = response.data;
                    if (!newService.categories || !Array.isArray(newService.categories)) {
                        newService.categories = [];
                    }
                    setServices([newService, ...services]);
                } else {
                    // Nếu API không trả về dữ liệu đầy đủ, cập nhật lại toàn bộ danh sách
                    fetchServices();
                }

                // Ẩn form thêm mới
                setShowAddForm(false);
            }
        } catch (error) {
            console.log(error);
            showMessage({
                message: error.response?.data?.message || 'Đã xảy ra lỗi khi thêm dịch vụ',
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
                showMessage({
                    message: 'Đã cập nhật dịch vụ',
                    type: 'success',
                    icon: 'success',
                    duration: 3000,
                });

                // Update the service in the current state
                const updatedServices = services.map(service => {
                    if (service.id === serviceData.id) {
                        // Đảm bảo service được cập nhật có categories là mảng
                        const updatedService = {
                            ...service,
                            ...serviceData.values
                        };

                        // Kiểm tra và xử lý categories
                        if (!updatedService.categories || !Array.isArray(updatedService.categories)) {
                            // Thử parse nếu là chuỗi
                            if (typeof updatedService.categories === 'string') {
                                try {
                                    updatedService.categories = JSON.parse(updatedService.categories);
                                    // Kiểm tra sau khi parse
                                    if (!Array.isArray(updatedService.categories)) {
                                        updatedService.categories = [];
                                    }
                                } catch (error) {
                                    console.log('Error parsing updated categories:', error);
                                    updatedService.categories = [];
                                }
                            } else {
                                // Không phải chuỗi, gán mảng trống
                                updatedService.categories = [];
                            }
                        }

                        return updatedService;
                    }
                    return service;
                });

                setServices(updatedServices);
            }
        } catch (error) {
            console.log(error);
            showMessage({
                message: error.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật dịch vụ',
                type: 'danger',
                icon: 'danger',
                duration: 3000,
            });
        }
    };

    const handleDeleteService = (service) => {
        Alert.alert(
            "Xác nhận xóa",
            `Bạn có chắc chắn muốn xóa "${service.name}"?`,
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
                                    message: 'Đã xóa dịch vụ',
                                    type: 'success',
                                    icon: 'success',
                                    duration: 3000,
                                });

                                // Remove the service from the current state
                                const filteredServices = services.filter(item =>
                                    item.id !== service.id
                                );

                                setServices(filteredServices);
                            }
                        } catch (error) {
                            console.log(error);
                            showMessage({
                                message: error.response?.data?.message || 'Đã xảy ra lỗi khi xóa dịch vụ',
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

    const showServiceOptions = (service) => {
        Alert.alert(
            "Tùy chọn",
            `Chọn tác vụ cho "${service.name}"`,
            [
                {
                    text: "Hủy",
                    style: "cancel"
                },
                {
                    text: "Chỉnh sửa",
                    onPress: () => props.navigation.navigate('EditService', { service })
                },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: () => handleDeleteService(service)
                }
            ]
        );
    };

    // Xử lý an toàn item.categories trong renderServiceItem
    const renderServiceItem = ({ item }) => {
        // Đảm bảo item.categories là mảng trước khi render
        const categoryArray = Array.isArray(item.categories) ? item.categories : [];

        return (
            <TouchableOpacity
                style={tw`bg-white mb-3 rounded-lg overflow-hidden shadow-sm`}
                onPress={() => showServiceOptions(item)}
            >
                <View style={tw`flex-row`}>
                    <Image
                        source={item.image ? { uri: item.image } : defaultFoodImage}
                        style={tw`w-20 h-20 bg-gray-100`}
                        resizeMode="cover"
                    />

                    <View style={tw`flex-1 p-3 justify-between`}>
                        <View>
                            <Text style={tw`font-medium text-red-500 mb-1`} numberOfLines={2}>{item.name}</Text>

                            <View style={tw`flex-row flex-wrap`}>
                                {categoryArray.map((category, index) => (
                                    <View key={index} style={tw`bg-red-50 px-2 py-1 rounded mr-1 mb-1`}>
                                        <Text style={tw`text-xs text-red-600`}>{category.name}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={tw`flex-row justify-between items-center mt-1`}>
                            <Text style={tw`font-medium`}>{formatVND(item.price)}</Text>
                            <View style={tw`flex-row items-center`}>
                                <View style={tw`${item.status === 'Đăng' ? 'bg-green-100' : 'bg-gray-100'} px-2 py-1 rounded mr-2`}>
                                    <Text style={tw`text-xs ${item.status === 'Đăng' ? 'text-green-700' : 'text-gray-700'}`}>
                                        {item.status}
                                    </Text>
                                </View>
                                {item.featured === 'Có' && (
                                    <Icon name="star" size={18} style={tw`text-yellow-500`} />
                                )}
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // Create arrays for dropdown items
    const statusOptions = [
        { id: 'ALL', name: 'Tất cả trạng thái' },
        ...ServiceStatus.map(status => ({ id: status, name: status }))
    ];

    const categoryOptions = React.useMemo(() => {
        return [
            { id: 'ALL', name: 'Tất cả danh mục' },
            ...categories
        ];
    }, [categories]);

    return (
        <View style={tw`flex-1 bg-gray-100`}>
            <StatusBar barStyle="light-content" backgroundColor="#3b82f6" />

            {showAddForm ? (
                <ServiceForm
                    type="add"
                    initialValues={{
                        featured: 'Không',
                        type: 'Đồ ăn'
                    }}
                    categories={categories}
                    onSubmit={handleAddService}
                    onCancel={() => setShowAddForm(false)}
                />
            ) : (
                <>
                    <View style={tw`bg-white p-3`}>
                        <View style={tw`flex-row items-center bg-gray-100 rounded-lg px-3 mb-3`}>
                            <Icon name="magnify" size={20} style={tw`text-gray-500 mr-2`} />
                            <TextInput
                                style={tw`flex-1 py-2`}
                                placeholder="Tìm kiếm món..."
                                value={searchQuery}
                                onChangeText={handleSearch}
                                returnKeyType="search"
                                onSubmitEditing={() => fetchServices()}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => handleSearch('')}>
                                    <Icon name="close-circle" size={18} style={tw`text-gray-500`} />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={tw`flex-row items-center justify-between`}>
                            <View style={tw`flex-1 mr-2`}>
                                {/* Status selector using CustomSelector */}
                                <CustomSelector
                                    placeholder="Tất cả trạng thái"
                                    value={status}
                                    onValueChange={(value) => setStatus(value)}
                                    items={statusOptions}
                                    getValue={(item) => item.id}
                                    getLabel={(item) => item.name}
                                />
                            </View>

                            <View style={tw`flex-1`}>
                                {/* Category selector using CustomSelector */}
                                <CustomSelector
                                    placeholder="Tất cả danh mục"
                                    value={selectedCategory}
                                    onValueChange={(value) => setSelectedCategory(value)}
                                    items={categoryOptions}
                                    getValue={(item) => item.id}
                                    getLabel={(item) => item.name}
                                    searchable={true}
                                />
                            </View>
                        </View>
                    </View>

                    {loading ? (
                        <View style={tw`flex-1 justify-center items-center`}>
                            <ActivityIndicator size="large" color="#3b82f6" />
                        </View>
                    ) : services.length > 0 ? (
                        <FlatList
                            data={services}
                            renderItem={renderServiceItem}
                            keyExtractor={item => item.id.toString()}
                            contentContainerStyle={tw`p-3 pb-20`}
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                        />
                    ) : (
                        <View style={tw`flex-1 justify-center items-center p-5`}>
                            <Icon name="food-fork-drink" size={60} style={tw`text-gray-300 mb-3`} />
                            <Text style={tw`text-gray-500 text-center mb-5`}>
                                {searchQuery || status !== 'ALL' || selectedCategory !== 'ALL'
                                    ? 'Không tìm thấy món nào'
                                    : 'Chưa có món nào'}
                            </Text>
                            <TouchableOpacity
                                style={tw`bg-blue-500 py-2 px-4 rounded-lg flex-row items-center`}
                                onPress={() => setShowAddForm(true)}
                            >
                                <Icon name="plus" size={18} style={tw`text-white mr-1`} />
                                <Text style={tw`text-white font-medium`}>Thêm món mới</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity
                        style={tw`absolute bottom-5 right-5 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-md`}
                        onPress={() => setShowAddForm(true)}
                    >
                        <Icon name="plus" size={30} style={tw`text-white`} />
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
}

export default ShopServices;
