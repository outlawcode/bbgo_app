import React, { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StatusBar, Text, TouchableOpacity, View, Modal, FlatList } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import { GetMe } from "app/screens/Auth/action.js";
import { useIsFocused } from "@react-navigation/native";
import moment from "moment/moment.js";
import { formatDate, formatDateUS, formatNumber, formatVND } from "app/utils/helper.js";
import RequestOpenShopForm from "./RequestOpenShopForm.js";
import { showMessage } from "react-native-flash-message";

function OnlineShop(props) {
    const isFocused = useIsFocused();
    const dispatch = useDispatch();
    const currentUser = useSelector(state => state.memberAuth.user);
    const settings = useSelector(state => state.SettingsReducer.options);
    const [result, setResult] = useState();
    const [stats, setStats] = useState();
    const [flag, setFlag] = useState(false);
    const [error, setError] = useState();
    const [refresh, setRefresh] = useState(true);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [dateRange, setDateRange] = useState([
        moment.utc(moment().clone().startOf('week').format('YYYY-MM-DD')),
        moment.utc(moment().clone().endOf('week').format("YYYY-MM-DD"))
    ]);

    // Các tùy chọn khoảng thời gian nhanh
    const dateRangePresets = [
        { label: 'Hôm nay', value: 'today', getRange: () => [moment().startOf('day'), moment().endOf('day')] },
        { label: 'Tuần này', value: 'thisWeek', getRange: () => [moment().startOf('week'), moment().endOf('week')] },
        { label: 'Tuần trước', value: 'lastWeek', getRange: () => [moment().subtract(1, 'week').startOf('week'), moment().subtract(1, 'week').endOf('week')] },
        { label: 'Tháng này', value: 'thisMonth', getRange: () => [moment().startOf('month'), moment().endOf('month')] },
        { label: 'Tháng trước', value: 'lastMonth', getRange: () => [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')] },
        { label: '3 tháng gần đây', value: 'last3Months', getRange: () => [moment().subtract(3, 'month').startOf('day'), moment().endOf('day')] },
        { label: 'Năm nay', value: 'thisYear', getRange: () => [moment().startOf('year'), moment().endOf('year')] }
    ];

    useEffect(() => {
        props.navigation.setOptions({
            title: 'Quản lý cửa hàng online',
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
            async function getData() {
                const token = await AsyncStorage.getItem('sme_user_token');
                axios({
                    method: 'get',
                    url: `${apiConfig.BASE_URL}/member/user-shop`,
                    headers: {Authorization: `Bearer ${token}`}
                }).then(function (response) {
                    if (response.status === 200) {
                        setResult(response.data);
                        setRefresh(false);
                    }
                }).catch(function(error){
                    console.log(error);
                    setError(error.response.data);
                    setRefresh(false);
                });
            }
            getData();

            async function getStats() {
                const token = await AsyncStorage.getItem('sme_user_token');
                axios({
                    method: 'get',
                    url: `${apiConfig.BASE_URL}/member/order/shop/stats`,
                    params: {
                        rangeStart: formatDateUS(dateRange[0]),
                        rangeEnd: formatDateUS(dateRange[1]),
                    },
                    headers: {Authorization: `Bearer ${token}`}
                }).then(function (response) {
                    if (response.status === 200) {
                        setStats(response.data);
                        setRefresh(false);
                    }
                }).catch(function(error){
                    console.log(error);
                    setRefresh(false);
                });
            }
            getStats();
        }
    }, [dispatch, refresh, isFocused, dateRange, flag]);

    // Xử lý khi chọn khoảng thời gian nhanh
    const handlePresetDateRange = (preset) => {
        const [start, end] = preset.getRange();
        setDateRange([start, end]);
        setShowDatePicker(false);
    };

    async function handleRequestOpen(data) {
        const token = await AsyncStorage.getItem('sme_user_token');
        return axios({
            method: 'post',
            url: `${apiConfig.BASE_URL}/member/user-shop/request-open`,
            data,
            headers: {Authorization: `Bearer ${token}`}
        }).then(function (response) {
            if (response.status === 201) {
                setFlag(!flag);
                dispatch(GetMe(token));
                showMessage({
                    message: 'Đã gửi đơn đăng ký mở gian hàng, vui lòng chờ xét duyệt!',
                    type: 'success',
                    icon: 'success',
                    duration: 3000,
                });
            }
        }).catch(function(error){
            showMessage({
                message: error.response.data.message,
                type: 'danger',
                icon: 'danger',
                duration: 3000,
            });
            console.log(error);
        });
    }

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
                                    <Text style={tw`text-gray-800`}>{item.label}</Text>
                                </TouchableOpacity>
                            )}
                        />

                        <View style={tw`p-4 border-t border-gray-200 flex-row justify-between`}>
                            <View style={tw`flex-1`}>
                                <Text style={tw`text-sm text-gray-500 mb-1`}>Khoảng thời gian đã chọn:</Text>
                                <View style={tw`flex-row items-center`}>
                                    <Icon name="calendar-range" size={16} style={tw`text-blue-500 mr-2`} />
                                    <Text style={tw`font-medium`}>
                                        {formatDate(dateRange[0])} - {formatDate(dateRange[1])}
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={tw`ml-2 px-4 py-2 rounded-lg bg-blue-500`}
                                onPress={() => setShowDatePicker(false)}
                            >
                                <Text style={tw`text-white font-medium`}>Đóng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    function renderMenu() {
        const isProduct = currentUser && currentUser.shopType === 'Product';
        const isPersonal = currentUser && currentUser.isMart === 1;

        return (
            <View style={tw`mb-3 bg-white rounded-lg shadow-sm`}>
                <View style={tw`border-b border-gray-100 px-3 py-3 flex flex-row items-center justify-between`}>
                    <View style={tw`flex flex-row items-center`}>
                        <Text style={tw`font-medium text-gray-800`}>Menu</Text>
                    </View>
                </View>

                <View>
                    <TouchableOpacity
                        onPress={() => props.navigation.navigate("ShopStatistics")}
                        style={tw`flex items-center justify-between flex-row p-3 border-t border-gray-100`}
                    >
                        <View style={tw`flex flex-row items-center`}>
                            <Icon name="chart-bar" style={tw`mr-2 text-blue-500`} size={18} />
                            <Text>Thống kê</Text>
                        </View>
                        <Icon name="chevron-right" size={16} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => props.navigation.navigate("ShopOrders")}
                        style={tw`flex items-center justify-between flex-row p-3 border-t border-gray-100`}
                    >
                        <View style={tw`flex flex-row items-center`}>
                            <Icon name="cart-outline" style={tw`mr-2 text-blue-500`} size={18} />
                            <Text>Đơn hàng online</Text>
                        </View>
                        <Icon name="chevron-right" size={16} />
                    </TouchableOpacity>

                    {isProduct ? (
                        <>
                            {isPersonal && (
                                <TouchableOpacity
                                    onPress={() => props.navigation.navigate("ShopProducts")}
                                    style={tw`flex items-center justify-between flex-row p-3 border-t border-gray-100`}
                                >
                                    <View style={tw`flex flex-row items-center`}>
                                        <Icon name="package-variant" style={tw`mr-2 text-blue-500`} size={18} />
                                        <Text>QL Sản phẩm</Text>
                                    </View>
                                    <Icon name="chevron-right" size={16} />
                                </TouchableOpacity>
                            )}

                            {!isPersonal && (
                                <TouchableOpacity
                                    onPress={() => props.navigation.navigate("ShopInventory")}
                                    style={tw`flex items-center justify-between flex-row p-3 border-t border-gray-100`}
                                >
                                    <View style={tw`flex flex-row items-center`}>
                                        <Icon name="cube-outline" style={tw`mr-2 text-blue-500`} size={18} />
                                        <Text>Kho hàng</Text>
                                    </View>
                                    <Icon name="chevron-right" size={16} />
                                </TouchableOpacity>
                            )}
                        </>
                    ) : (
                        <TouchableOpacity
                            onPress={() => props.navigation.navigate("ShopServices")}
                            style={tw`flex items-center justify-between flex-row p-3 border-t border-gray-100`}
                        >
                            <View style={tw`flex flex-row items-center`}>
                                <Icon name="food-fork-drink" style={tw`mr-2 text-blue-500`} size={18} />
                                <Text>Quản lý Món</Text>
                            </View>
                            <Icon name="chevron-right" size={16} />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={() => props.navigation.navigate("ShopSettings")}
                        style={tw`flex items-center justify-between flex-row p-3 border-t border-gray-100`}
                    >
                        <View style={tw`flex flex-row items-center`}>
                            <Icon name="cog-outline" style={tw`mr-2 text-blue-500`} size={18} />
                            <Text>Cài đặt</Text>
                        </View>
                        <Icon name="chevron-right" size={16} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    function renderShopInfo() {
        return (
            <View style={tw`mb-3 bg-white rounded-lg shadow-sm`}>
                <View style={tw`px-3 py-3 flex flex-row items-center justify-between`}>
                    <View style={tw`flex flex-row items-center`}>
                        <Text style={tw`font-medium text-gray-800`}>Thông tin cửa hàng</Text>
                    </View>
                    <TouchableOpacity
                        style={tw`flex flex-row items-center`}
                        onPress={() => props.navigation.navigate('ShopSettings')}
                    >
                        <Text style={tw`text-blue-500`}>Cập nhật</Text>
                        <Icon name="chevron-right" size={18} style={tw`text-blue-500`} />
                    </TouchableOpacity>
                </View>

                <View>
                    <View style={tw`border-t border-gray-100 p-3`}>
                        <Text>Tên: <Text style={tw`font-medium`}>{result?.name || 'Chưa cập nhật'}</Text></Text>
                    </View>
                    <View style={tw`border-t border-gray-100 p-3`}>
                        <Text>Địa chỉ: <Text style={tw`font-medium`}>{result?.address || 'Chưa cập nhật'}</Text></Text>
                    </View>
                    <View style={tw`border-t border-gray-100 p-3`}>
                        <Text>Điện thoại: <Text style={tw`font-medium`}>{result?.phone || 'Chưa cập nhật'}</Text></Text>
                    </View>
                    <View style={tw`border-t border-gray-100 p-3`}>
                        <Text>Loại shop: <Text style={tw`font-medium`}>{result?.shopType === 'Product' ? 'Sản phẩm' : 'Dịch vụ'}</Text></Text>
                    </View>
                </View>
            </View>
        );
    }

    function renderStatistics() {
        return (
            <View style={tw`mb-3`}>
                <View style={tw`mb-3 flex items-center justify-between flex-row`}>
                    <View style={tw`p-1 w-1/2`}>
                        <View style={tw`bg-white p-3 flex items-center rounded-lg shadow-sm`}>
                            <Text style={tw`font-bold text-lg text-gray-700`}>{stats && stats.totalOrders ? formatNumber(stats.totalOrders) : '0'}</Text>
                            <Text style={tw`text-xs text-gray-500`}>Đơn hàng</Text>
                        </View>
                    </View>
                    <View style={tw`p-1 w-1/2`}>
                        <View style={tw`bg-white p-3 flex items-center rounded-lg shadow-sm`}>
                            <Text style={tw`font-bold text-lg text-gray-700`}>{stats && stats.totalRevenue ? formatVND(stats.totalRevenue) : '0'}</Text>
                            <Text style={tw`text-xs text-gray-500`}>Doanh thu</Text>
                        </View>
                    </View>
                </View>

                <View style={tw`mb-3 flex items-center justify-between flex-row`}>
                    <View style={tw`p-1 w-1/2`}>
                        <View style={tw`bg-white p-3 flex items-center rounded-lg shadow-sm`}>
                            <Text style={tw`font-bold text-lg text-green-600`}>{stats && stats.completedOrders ? formatNumber(stats.completedOrders) : '0'}</Text>
                            <Text style={tw`text-xs text-gray-500`}>Hoàn thành</Text>
                        </View>
                    </View>
                    <View style={tw`p-1 w-1/2`}>
                        <View style={tw`bg-white p-3 flex items-center rounded-lg shadow-sm`}>
                            <Text style={tw`font-bold text-lg text-red-600`}>{stats && stats.canceledOrders ? formatNumber(stats.canceledOrders) : '0'}</Text>
                            <Text style={tw`text-xs text-gray-500`}>Đã huỷ</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={tw`flex h-full bg-gray-50`}>
            <StatusBar barStyle="light-content" backgroundColor="#3b82f6" />
            {!error ? (
                !result ? (
                    <ActivityIndicator style={tw`mt-5`} />
                ) : (
                    <View>
                        <View style={tw`bg-white p-3 flex items-center flex-row justify-between shadow-sm`}>
                            <TouchableOpacity
                                onPress={() => props.navigation.navigate("ShopStatistics")}
                                style={tw`bg-blue-600 py-2 px-3 rounded flex flex-row items-center`}
                            >
                                <Icon name="chart-line" style={tw`text-white mr-1`} size={16} />
                                <Text style={tw`text-white font-medium`}>Xem thống kê đầy đủ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={tw`border border-gray-200 rounded px-3 py-2 flex items-center flex-row`}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Icon name="calendar-range-outline" size={18} style={tw`mr-1`} />
                                <Text>{formatDate(dateRange[0])} - {formatDate(dateRange[1])}</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView
                            style={tw`pb-20`}
                            scrollEnabled={true}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refresh}
                                    onRefresh={() => setRefresh(true)}
                                    title="đang tải"
                                    titleColor="#000"
                                    tintColor="#000"
                                />
                            }
                        >
                            <View style={tw`flex pb-20 mt-3 px-3`}>
                                {renderStatistics()}
                                {renderMenu()}
                                {renderShopInfo()}
                            </View>
                        </ScrollView>
                        {renderDatePickerModal()}
                    </View>
                )
            ) : (
                <View style={tw`p-3 rounded bg-gray-50 border border-gray-200 m-3`}>
                    <View style={tw`flex items-center flex-row mb-2`}>
                        <Icon name="information-outline" style={tw`mr-2`} size={16} />
                        <Text style={tw`font-medium`}>Thông báo</Text>
                    </View>
                    <Text>{error.message}</Text>
                </View>
            )}
            {error && error.statusCode === 404 && (
                <RequestOpenShopForm
                    onSubmit={handleRequestOpen}
                    settings={settings && settings}
                    currentUser={currentUser && currentUser}
                />
            )}
        </View>
    );
}

export default OnlineShop;
