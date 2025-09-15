import React, { useState, useEffect } from "react";
import { ActivityIndicator, ScrollView, StatusBar, Text, TouchableOpacity, View, Dimensions, Modal, Platform } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import moment from "moment/moment.js";
import { formatDate, formatNumber, formatVND, formatDateUS } from "app/utils/helper.js";
import { LineChart } from "react-native-chart-kit";
import axios from "axios";
import AsyncStorage from "@react-native-community/async-storage";
import apiConfig from "app/config/api-config";

function ShopStatistics(props) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const screenWidth = Dimensions.get("window").width;

    const [dateRange, setDateRange] = useState([
        moment.utc(moment().clone().startOf('week').format('YYYY-MM-DD')),
        moment.utc(moment().clone().endOf('week').format("YYYY-MM-DD"))
    ]);

    useEffect(() => {
        fetchShopStats();
    }, [dateRange]);

    const fetchShopStats = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('sme_user_token');

            const response = await axios({
                method: 'get',
                url: `${apiConfig.BASE_URL}/member/order/shop/stats`,
                params: {
                    rangeStart: formatDateUS(dateRange[0]),
                    rangeEnd: formatDateUS(dateRange[1]),
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                setStats(response.data);
            }
        } catch (err) {
            console.log("Error fetching shop stats:", err);
            setError(err.response?.data?.message || "Không thể tải dữ liệu thống kê");
        } finally {
            setLoading(false);
        }
    };

    const prepareChartData = () => {
        if (!stats || !stats.saleChart) return null;

        return {
            labels: stats.saleChart.labels.map(item => moment(item).format('DD/MM')),
            datasets: [
                {
                    data: stats.saleChart.amount,
                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                    strokeWidth: 2
                }
            ],
            legend: ["Doanh thu"]
        };
    };

    const chartConfig = {
        backgroundGradientFrom: "#ffffff",
        backgroundGradientTo: "#ffffff",
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
            borderRadius: 16
        },
        propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#3b82f6"
        }
    };

    // Date range picker modal
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Date range picker options
    const dateRangeOptions = [
        { label: 'Hôm nay', value: 'today', getRange: () => [moment().startOf('day'), moment().endOf('day')] },
        { label: 'Tuần này', value: 'thisWeek', getRange: () => [moment().startOf('week'), moment().endOf('week')] },
        { label: 'Tháng này', value: 'thisMonth', getRange: () => [moment().startOf('month'), moment().endOf('month')] },
        { label: 'Tháng trước', value: 'lastMonth', getRange: () => [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')] },
        { label: 'Quý này', value: 'thisQuarter', getRange: () => [moment().startOf('quarter'), moment().endOf('quarter')] },
        { label: 'Năm nay', value: 'thisYear', getRange: () => [moment().startOf('year'), moment().endOf('year')] }
    ];

    // Handle date range option selection
    const handleQuickRangeSelect = (option) => {
        const [start, end] = option.getRange();
        setDateRange([start, end]);
        setShowDatePicker(false);
    };

    // Render date picker modal
    const renderDatePickerModal = () => {
        return (
            <Modal
                transparent={true}
                animationType="fade"
                visible={showDatePicker}
                onRequestClose={() => setShowDatePicker(false)}
            >
                <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
                    <View style={tw`bg-white rounded-xl p-4 w-80 shadow-lg`}>
                        <View style={tw`flex-row items-center justify-between mb-4`}>
                            <Text style={tw`text-lg font-bold`}>Chọn khoảng thời gian</Text>
                            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                <Icon name="close" size={24} style={tw`text-gray-500`} />
                            </TouchableOpacity>
                        </View>

                        <View style={tw`mb-4`}>
                            <Text style={tw`text-gray-700 mb-2 font-medium`}>Khoảng thời gian nhanh</Text>
                            {dateRangeOptions.map(option => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={tw`py-3 border-b border-gray-100 flex-row items-center`}
                                    onPress={() => handleQuickRangeSelect(option)}
                                >
                                    <Icon name="clock-outline" size={18} style={tw`text-blue-500 mr-2`} />
                                    <Text style={tw`text-gray-800`}>{option.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={tw`mb-3`}>
                            <Text style={tw`text-gray-700 mb-2 font-medium`}>Tùy chỉnh khoảng thời gian</Text>
                            <View style={tw`flex-row justify-between items-center mb-2`}>
                                <Text style={tw`text-gray-600`}>Từ ngày:</Text>
                                <TouchableOpacity
                                    style={tw`border border-gray-200 rounded-lg py-2 px-3 flex-row items-center`}
                                >
                                    <Icon name="calendar" size={16} style={tw`text-blue-500 mr-2`} />
                                    <Text>{formatDate(dateRange[0])}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={tw`flex-row justify-between items-center`}>
                                <Text style={tw`text-gray-600`}>Đến ngày:</Text>
                                <TouchableOpacity
                                    style={tw`border border-gray-200 rounded-lg py-2 px-3 flex-row items-center`}
                                >
                                    <Icon name="calendar" size={16} style={tw`text-blue-500 mr-2`} />
                                    <Text>{formatDate(dateRange[1])}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={tw`flex-row justify-end mt-2`}>
                            <TouchableOpacity
                                style={tw`bg-gray-200 rounded-lg py-2 px-4 mr-2`}
                                onPress={() => setShowDatePicker(false)}
                            >
                                <Text>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={tw`bg-blue-500 rounded-lg py-2 px-4`}
                                onPress={() => {
                                    setShowDatePicker(false);
                                    fetchShopStats();
                                }}
                            >
                                <Text style={tw`text-white`}>Áp dụng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <View style={tw`flex h-full bg-gray-100`}>
            <StatusBar barStyle="light-content" backgroundColor="#3b82f6" />

            <View style={tw`bg-white p-3 flex items-center flex-row justify-between`}>
                <Text style={tw`font-bold text-lg`}>Thống kê doanh số</Text>
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
            >
                {loading ? (
                    <ActivityIndicator style={tw`mt-5`} />
                ) : error ? (
                    <View style={tw`p-4 bg-red-100 m-3 rounded-lg`}>
                        <Text style={tw`text-red-600`}>{error}</Text>
                    </View>
                ) : !stats ? (
                    <View style={tw`p-4 bg-gray-100 m-3 rounded-lg`}>
                        <Text style={tw`text-gray-600 text-center`}>Không có dữ liệu thống kê</Text>
                    </View>
                ) : (
                    <View style={tw`flex pb-5 px-3`}>
                        <View style={tw`mb-5 mt-4 bg-white rounded-lg overflow-hidden shadow-sm`}>
                            <View style={tw`p-3 border-b border-gray-100`}>
                                <Text style={tw`font-bold text-gray-700`}>Tổng quan</Text>
                            </View>

                            <View style={tw`flex-row flex-wrap`}>
                                <View style={tw`w-1/2 p-3 border-b border-r border-gray-100`}>
                                    <Text style={tw`text-gray-500 text-sm`}>Tổng đơn hàng</Text>
                                    <Text style={tw`font-bold text-lg`}>{formatNumber(stats.totalOrders || 0)}</Text>
                                </View>

                                <View style={tw`w-1/2 p-3 border-b border-gray-100`}>
                                    <Text style={tw`text-gray-500 text-sm`}>Tổng doanh thu</Text>
                                    <Text style={tw`font-bold text-lg text-green-600`}>
                                        {formatVND(stats.totalRevenue || 0)}
                                    </Text>
                                </View>

                                <View style={tw`w-1/2 p-3 border-r border-gray-100`}>
                                    <Text style={tw`text-gray-500 text-sm`}>Đơn hoàn thành</Text>
                                    <Text style={tw`font-bold text-lg text-green-600`}>{formatNumber(stats.completedOrders || 0)}</Text>
                                </View>

                                <View style={tw`w-1/2 p-3`}>
                                    <Text style={tw`text-gray-500 text-sm`}>Đơn huỷ</Text>
                                    <Text style={tw`font-bold text-lg text-red-600`}>{formatNumber(stats.canceledOrders || 0)}</Text>
                                </View>
                            </View>
                        </View>

                        {prepareChartData() && (
                            <View style={tw`mb-5 bg-white rounded-lg overflow-hidden shadow-sm`}>
                                <View style={tw`p-3 border-b border-gray-100`}>
                                    <Text style={tw`font-bold text-gray-700`}>Biểu đồ doanh thu</Text>
                                </View>
                                <View style={tw`p-2`}>
                                    <LineChart
                                        data={prepareChartData()}
                                        width={screenWidth - 40}
                                        height={220}
                                        chartConfig={chartConfig}
                                        bezier
                                        style={tw`rounded-lg mt-2`}
                                    />
                                </View>
                            </View>
                        )}

                        <View style={tw`mb-5 bg-white rounded-lg overflow-hidden shadow-sm`}>
                            <View style={tw`p-3 border-b border-gray-100`}>
                                <Text style={tw`font-bold text-gray-700`}>Thống kê đơn hàng</Text>
                            </View>

                            <View style={tw`p-4`}>
                                <View style={tw`flex-row justify-between items-center mb-3`}>
                                    <Text style={tw`text-gray-500`}>Chờ thanh toán:</Text>
                                    <Text style={tw`font-bold`}>{formatNumber(stats.pendingPaymentOrders || 0)}</Text>
                                </View>

                                <View style={tw`flex-row justify-between items-center mb-3`}>
                                    <Text style={tw`text-gray-500`}>Chờ lấy hàng:</Text>
                                    <Text style={tw`font-bold`}>{formatNumber(stats.processingOrders || 0)}</Text>
                                </View>

                                <View style={tw`flex-row justify-between items-center mb-3`}>
                                    <Text style={tw`text-gray-500`}>Đang giao:</Text>
                                    <Text style={tw`font-bold`}>{formatNumber(stats.shippingOrders || 0)}</Text>
                                </View>

                                <View style={tw`flex-row justify-between items-center mb-3`}>
                                    <Text style={tw`text-gray-500`}>Đã nhận hàng:</Text>
                                    <Text style={tw`font-bold text-green-600`}>{formatNumber(stats.completedOrders || 0)}</Text>
                                </View>

                                <View style={tw`flex-row justify-between items-center`}>
                                    <Text style={tw`text-gray-500`}>Đã huỷ:</Text>
                                    <Text style={tw`font-bold text-red-600`}>{formatNumber(stats.canceledOrders || 0)}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            {renderDatePickerModal()}
        </View>
    );
}

export default ShopStatistics;
