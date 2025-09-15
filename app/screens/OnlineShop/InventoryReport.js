import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StatusBar, Text, TouchableOpacity, View, Modal, Button } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import { useIsFocused } from "@react-navigation/native";
import moment from "moment/moment.js";
import { formatDate, formatDateUS, formatNumber, formatVND } from "app/utils/helper.js";
import { showMessage } from "react-native-flash-message";
import { PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

function InventoryReport(props) {
    const screenWidth = Dimensions.get("window").width;
    const isFocused = useIsFocused();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDatePicker, setShowDatePicker] = useState(false);

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
        { label: 'Quý này', value: 'thisQuarter', getRange: () => [moment().startOf('quarter'), moment().endOf('quarter')] },
        { label: 'Năm nay', value: 'thisYear', getRange: () => [moment().startOf('year'), moment().endOf('year')] }
    ];

    useEffect(() => {
        props.navigation.setOptions({
            title: 'Báo cáo kho hàng',
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
            fetchReport();
        }
    }, [isFocused, dateRange]);

    const fetchReport = async () => {
        setLoading(true);
        const token = await AsyncStorage.getItem('sme_user_token');

        try {
            const response = await axios({
                method: 'get',
                url: `${apiConfig.BASE_URL}/user/statistic/selling`,
                params: {
                    rangeStart: formatDateUS(dateRange[0]),
                    rangeEnd: formatDateUS(dateRange[1]),
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                setReport(response.data);
                setLoading(false);
            }
        } catch (error) {
            console.log(error);
            setLoading(false);
            showMessage({
                message: error.response?.data?.message || 'Đã xảy ra lỗi khi tải báo cáo',
                type: 'danger',
                icon: 'danger',
                duration: 3000,
            });
        }
    };

    const prepareChartData = () => {
        if (!report || !report.productList) return [];

        // Get top 5 products by amount
        const productEntries = Object.entries(report.productList);
        const sortedProducts = productEntries.sort((a, b) => b[1].amount - a[1].amount).slice(0, 5);

        const colors = [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF'
        ];

        return sortedProducts.map(([name, data], index) => {
            return {
                name: name.length > 15 ? name.substring(0, 15) + '...' : name,
                population: data.amount,
                color: colors[index],
                legendFontColor: '#7F7F7F',
                legendFontSize: 12
            };
        });
    };

    const chartConfig = {
        backgroundGradientFrom: "#ffffff",
        backgroundGradientTo: "#ffffff",
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.5,
        useShadowColorFromDataset: false
    };

    const renderProductItem = ({ item }) => {
        const [productName, productData] = item;

        return (
            <View style={tw`bg-white p-4 rounded-lg mb-3 shadow-sm`}>
                <Text style={tw`font-medium mb-2`} numberOfLines={2}>{productName}</Text>
                <View style={tw`flex-row justify-between`}>
                    <View>
                        <Text style={tw`text-gray-500 text-xs`}>Số lượng đã bán</Text>
                        <Text style={tw`font-medium text-blue-600`}>{formatNumber(productData.qty)}</Text>
                    </View>
                    <View>
                        <Text style={tw`text-gray-500 text-xs`}>Doanh thu</Text>
                        <Text style={tw`font-medium text-green-600`}>{formatVND(productData.amount)}</Text>
                    </View>
                </View>
            </View>
        );
    };

    // Xử lý khi chọn khoảng thời gian nhanh
    const handlePresetDateRange = (preset) => {
        const [start, end] = preset.getRange();
        setDateRange([start, end]);
        setShowDatePicker(false);
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

                        <View style={tw`p-4 border-t border-gray-200 flex-row justify-end`}>
                            <TouchableOpacity
                                style={tw`px-4 py-2 rounded-lg bg-gray-200 mr-2`}
                                onPress={() => setShowDatePicker(false)}
                            >
                                <Text>Hủy</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={tw`px-4 py-2 rounded-lg bg-blue-500`}
                                onPress={() => setShowDatePicker(false)}
                            >
                                <Text style={tw`text-white`}>Đóng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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

            <View style={tw`bg-white p-3 flex-row justify-between items-center`}>
                <Text style={tw`font-bold text-lg`}>Báo cáo bán hàng</Text>
                <TouchableOpacity
                    style={tw`border border-gray-200 rounded px-3 py-2 flex-row items-center`}
                    onPress={() => setShowDatePicker(true)}
                >
                    <Icon name="calendar-range-outline" size={18} style={tw`mr-1`} />
                    <Text>{formatDate(dateRange[0])} - {formatDate(dateRange[1])}</Text>
                </TouchableOpacity>
            </View>

            {report && (
                <FlatList
                    contentContainerStyle={tw`p-3 pb-20`}
                    ListHeaderComponent={
                        <>
                            <View style={tw`bg-white p-4 rounded-lg mb-4 shadow-sm`}>
                                <Text style={tw`font-medium mb-3`}>Biểu đồ sản phẩm bán chạy</Text>
                                {prepareChartData().length > 0 ? (
                                    <PieChart
                                        data={prepareChartData()}
                                        width={screenWidth - 32}
                                        height={200}
                                        chartConfig={chartConfig}
                                        accessor="population"
                                        backgroundColor="transparent"
                                        paddingLeft="15"
                                    />
                                ) : (
                                    <View style={tw`items-center justify-center py-5`}>
                                        <Text style={tw`text-gray-500`}>Không có dữ liệu</Text>
                                    </View>
                                )}
                            </View>

                            <Text style={tw`font-medium mb-2 ml-1`}>Danh sách sản phẩm đã bán</Text>
                        </>
                    }
                    data={report ? Object.entries(report.productList) : []}
                    renderItem={renderProductItem}
                    keyExtractor={(item, index) => index.toString()}
                    ListEmptyComponent={
                        <View style={tw`bg-white p-5 rounded-lg items-center justify-center`}>
                            <Icon name="alert-circle-outline" size={40} style={tw`text-gray-400 mb-2`} />
                            <Text style={tw`text-gray-500 text-center`}>Không có dữ liệu bán hàng trong khoảng thời gian này</Text>
                        </View>
                    }
                />
            )}

            {renderDatePickerModal()}
        </View>
    );
}

export default InventoryReport;
