import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StatusBar, Text, TouchableOpacity, View, Modal } from "react-native";
import { useDispatch } from "react-redux";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import { useIsFocused } from "@react-navigation/native";
import moment from "moment/moment.js";
import { formatDate, formatDateUS, formatDateTime, formatVND } from "app/utils/helper.js";
import { showMessage } from "react-native-flash-message";

function ShopOrders(props) {
    const isFocused = useIsFocused();
    const dispatch = useDispatch();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [activeTab, setActiveTab] = useState('chothanhtoan');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [flag, setFlag] = useState(false);

    const [dateRange, setDateRange] = useState([
        moment.utc(moment().clone().startOf('month').format('YYYY-MM-DD')),
        moment.utc(moment().clone().endOf('month').format("YYYY-MM-DD"))
    ]);

    // Các tùy chọn khoảng thời gian nhanh
    const dateRangePresets = [
        { label: 'Hôm nay', value: 'today', getRange: () => [moment().startOf('day'), moment().endOf('day')] },
        { label: '7 ngày qua', value: 'last7days', getRange: () => [moment().subtract(6, 'days').startOf('day'), moment().endOf('day')] },
        { label: '30 ngày qua', value: 'last30days', getRange: () => [moment().subtract(29, 'days').startOf('day'), moment().endOf('day')] },
        { label: 'Tháng này', value: 'thisMonth', getRange: () => [moment().startOf('month'), moment().endOf('month')] },
        { label: 'Tháng trước', value: 'lastMonth', getRange: () => [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')] },
        { label: 'Quý này', value: 'thisQuarter', getRange: () => [moment().startOf('quarter'), moment().endOf('quarter')] }
    ];

    useEffect(() => {
        props.navigation.setOptions({
            title: 'Đơn hàng online',
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

        // Check if there's a position parameter from navigation
        if (props.route.params && props.route.params.position) {
            switch (props.route.params.position) {
                case 1:
                    setActiveTab('chothanhtoan');
                    break;
                case 2:
                    setActiveTab('danhanhang');
                    break;
                case 3:
                    setActiveTab('dahuy');
                    break;
                default:
                    setActiveTab('chothanhtoan');
            }
        }
    }, []);

    useEffect(() => {
        if (isFocused) {
            fetchOrders();
        }
    }, [isFocused, page, limit, activeTab, dateRange, flag]);

    const fetchOrders = async () => {
        setLoading(true);
        const token = await AsyncStorage.getItem('sme_user_token');

        let params = {
            rangeStart: formatDateUS(dateRange[0]),
            rangeEnd: formatDateUS(dateRange[1]),
            page,
            limit,
            orderSource: "Online"
        };

        // Set parameters based on active tab
        switch (activeTab) {
            case 'chothanhtoan':
                params.status = "Chờ thanh toán";
                break;
            case 'cholayhang':
                params.status = "Đã duyệt";
                params.process = "Chờ lấy hàng";
                break;
            case 'danggiao':
                params.status = "Đã duyệt";
                params.process = "Đang giao";
                break;
            case 'danhanhang':
                params.status = "Hoàn thành";
                params.process = "Đã nhận";
                break;
            case 'dahuy':
                params.status = "Huỷ";
                break;
            default:
                params.status = "Chờ thanh toán";
        }

        try {
            const response = await axios({
                method: 'get',
                url: `${apiConfig.BASE_URL}/member/order/shop`,
                params,
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                setOrders(response.data.list);
                setTotalItems(response.data.count);
                setLoading(false);
                setRefreshing(false);
            }
        } catch (error) {
            console.log(error);
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        setPage(1);
        fetchOrders();
    };

    const handleLoadMore = () => {
        if (loading) return;
        if (orders.length < totalItems) {
            setPage(page + 1);
        }
    };

    const handleCancelOrder = async (orderId) => {
        const token = await AsyncStorage.getItem('sme_user_token');
        try {
            const response = await axios.put(
                `${apiConfig.BASE_URL}/member/order/shop/canceled/${orderId}`,
                { reason: "Hủy đơn từ ứng dụng di động" },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                showMessage({
                    message: 'Đã huỷ đơn hàng',
                    type: 'success',
                    icon: 'success',
                    duration: 3000,
                });
                setFlag(!flag);
            }
        } catch (error) {
            showMessage({
                message: error.response?.data?.message || 'Đã xảy ra lỗi',
                type: 'danger',
                icon: 'danger',
                duration: 3000,
            });
        }
    };

    const handleShipOrder = async (orderId) => {
        const token = await AsyncStorage.getItem('sme_user_token');
        try {
            const response = await axios({
                method: 'put',
                url: `${apiConfig.BASE_URL}/member/order/shop/danggiao/${orderId}`,
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
                showMessage({
                    message: `Đã cập nhật đơn hàng #${orderId}`,
                    type: 'success',
                    icon: 'success',
                    duration: 3000,
                });
                setFlag(!flag);
            }
        } catch (error) {
            showMessage({
                message: error.response?.data?.message || 'Đã xảy ra lỗi',
                type: 'danger',
                icon: 'danger',
                duration: 3000,
            });
        }
    };

    // Xử lý khi chọn khoảng thời gian nhanh
    const handlePresetDateRange = (preset) => {
        const [start, end] = preset.getRange();
        setDateRange([start, end]);
        setShowDatePicker(false);
        setPage(1);
        setOrders([]);
    };

    const renderTabButton = (tabId, label, count = 0) => (
        <TouchableOpacity
            style={tw`${activeTab === tabId ? 'border-b-2 border-blue-500' : ''} px-3 py-2`}
            onPress={() => {
                setActiveTab(tabId);
                setPage(1);
                setOrders([]);
            }}
        >
            <Text style={tw`${activeTab === tabId ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                {label} {count > 0 && <Text style={tw`text-red-500`}>({count})</Text>}
            </Text>
        </TouchableOpacity>
    );

    const renderOrderItem = ({ item }) => {
        const priceDetails = JSON.parse(item.priceDetails);

        return (
            <TouchableOpacity
                style={tw`bg-white mb-3 rounded-lg overflow-hidden shadow-sm`}
                onPress={() => props.navigation.navigate('ShopOrderDetail', { id: item.id })}
            >
                <View style={tw`p-3 border-b border-gray-100 flex-row justify-between items-center`}>
                    <Text style={tw`font-medium`}>Đơn hàng <Text style={tw`text-blue-600`}>#{item.id}</Text></Text>
                    <View style={tw`flex-row items-center space-x-2`}>
                        <View style={tw`bg-blue-50 px-2 py-1 rounded`}>
                            <Text style={tw`text-xs`}>{item.status}</Text>
                        </View>
                        {item.process && (
                            <View style={tw`bg-red-50 px-2 py-1 rounded`}>
                                <Text style={tw`text-xs`}>{item.process}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {item.type === 'Dịch vụ' ? (
                    <View style={tw`p-3`}>
                        {priceDetails.priceDetail && priceDetails.priceDetail.map((service, index) => (
                            <View key={index} style={tw`mb-2 flex-row justify-between`}>
                                <Text>{service.serviceName} x{service.quantity}</Text>
                                <Text style={tw`text-red-500`}>{formatVND(Number(service.price) * Number(service.quantity))}</Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={tw`p-3`}>
                        {priceDetails.priceDetail && priceDetails.priceDetail.slice(0, 2).map((product, index) => (
                            <View key={index} style={tw`mb-2 flex-row justify-between`}>
                                <Text>
                                    {product.product.name} - {product.name} x{product.quantity}
                                </Text>
                                <Text style={tw`text-red-500`}>{formatVND(product.subTotal)}</Text>
                            </View>
                        ))}
                        {priceDetails.priceDetail && priceDetails.priceDetail.length > 2 && (
                            <Text style={tw`text-gray-500 italic text-sm`}>+ {priceDetails.priceDetail.length - 2} sản phẩm khác</Text>
                        )}
                    </View>
                )}

                <View style={tw`p-3 border-t border-gray-100 flex-row justify-between items-center`}>
                    <Text style={tw`text-xs text-purple-500`}>{item.paymentMethod}</Text>
                    <Text>Tổng: <Text style={tw`font-medium text-red-500`}>{formatVND(item.amount)}</Text></Text>
                </View>

                {activeTab === 'chothanhtoan' && (
                    <View style={tw`p-3 border-t border-gray-100 flex-row justify-end`}>
                        <TouchableOpacity
                            style={tw`bg-red-500 px-3 py-1 rounded`}
                            onPress={() => handleCancelOrder(item.id)}
                        >
                            <Text style={tw`text-white`}>Huỷ đơn</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {activeTab === 'cholayhang' && (
                    <View style={tw`p-3 border-t border-gray-100 flex-row justify-between`}>
                        <TouchableOpacity
                            style={tw`bg-red-500 px-3 py-1 rounded`}
                            onPress={() => handleCancelOrder(item.id)}
                        >
                            <Text style={tw`text-white`}>Huỷ đơn</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={tw`bg-blue-500 px-3 py-1 rounded`}
                            onPress={() => handleShipOrder(item.id)}
                        >
                            <Text style={tw`text-white`}>Giao hàng</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={tw`p-3 border-t border-gray-100`}>
                    <Text style={tw`text-xs text-gray-500`}>Thời gian đặt: {formatDateTime(item.createdAt)}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    // Render modal lựa chọn khoảng thời gian
    const renderDatePickerModal = () => {
        return (
            <Modal
                transparent={true}
                animationType="fade"
                visible={showDatePicker}
                onRequestClose={() => setShowDatePicker(false)}
            >
                <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
                    <View style={tw`bg-white rounded-xl w-4/5 max-w-md shadow-lg overflow-hidden`}>
                        <View style={tw`border-b border-gray-200 p-4 flex-row items-center justify-between`}>
                            <Text style={tw`text-lg font-bold`}>Chọn khoảng thời gian</Text>
                            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                <Icon name="close" size={24} style={tw`text-gray-500`} />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={dateRangePresets}
                            style={tw`max-h-80`}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={tw`p-4 border-b border-gray-100 flex-row items-center`}
                                    onPress={() => handlePresetDateRange(item)}
                                >
                                    <Icon
                                        name="calendar"
                                        size={18}
                                        style={tw`text-blue-500 mr-3`}
                                    />
                                    <Text>{item.label}</Text>
                                </TouchableOpacity>
                            )}
                        />

                        <View style={tw`p-4 border-t border-gray-200 flex-row justify-between`}>
                            <TouchableOpacity
                                style={tw`px-4 py-2 rounded-lg bg-gray-200`}
                                onPress={() => setShowDatePicker(false)}
                            >
                                <Text>Huỷ</Text>
                            </TouchableOpacity>

                            <View style={tw`flex-row items-center justify-center`}>
                                <Text style={tw`text-gray-500 text-sm mx-2`}>
                                    {formatDate(dateRange[0])} - {formatDate(dateRange[1])}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <View style={tw`flex h-full bg-gray-100`}>
            <StatusBar barStyle="light-content" backgroundColor="#3b82f6" />

            <View style={tw`bg-white p-3 flex-row justify-between items-center`}>
                <View>
                    <Text style={tw`font-bold text-lg`}>Đơn hàng</Text>
                    {totalItems > 0 && <Text style={tw`text-xs text-gray-500`}>Tìm thấy {totalItems} đơn hàng</Text>}
                </View>
                <TouchableOpacity
                    style={tw`border border-gray-200 rounded px-3 py-2 flex-row items-center`}
                    onPress={() => setShowDatePicker(true)}
                >
                    <Icon name="calendar-range-outline" size={18} style={tw`mr-1`} />
                    <Text>{formatDate(dateRange[0])} - {formatDate(dateRange[1])}</Text>
                </TouchableOpacity>
            </View>

            <View style={tw`bg-white flex-row overflow-x-scroll border-b border-gray-200`}>
                {renderTabButton('chothanhtoan', 'Chờ thanh toán')}
                {renderTabButton('cholayhang', 'Chờ lấy hàng')}
                {renderTabButton('danggiao', 'Đang giao')}
                {renderTabButton('danhanhang', 'Đã nhận hàng')}
                {renderTabButton('dahuy', 'Đã huỷ')}
            </View>

            {loading && orders.length === 0 ? (
                <View style={tw`flex-1 justify-center items-center`}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            ) : orders.length > 0 ? (
                <FlatList
                    data={orders}
                    renderItem={renderOrderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={tw`p-3 pb-20`}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    ListFooterComponent={loading && orders.length > 0 && (
                        <ActivityIndicator style={tw`py-5`} />
                    )}
                />
            ) : (
                <View style={tw`flex-1 justify-center items-center p-5`}>
                    <Icon name="cart-off" size={60} style={tw`text-gray-300 mb-3`} />
                    <Text style={tw`text-gray-500 text-center`}>Chưa có đơn hàng nào</Text>
                </View>
            )}

            {renderDatePickerModal()}
        </View>
    );
}

export default ShopOrders;
