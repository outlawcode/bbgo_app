import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StatusBar, Text, TouchableOpacity, View, Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import { useIsFocused } from "@react-navigation/native";
import { formatDateTime, formatVND } from "app/utils/helper.js";
import { showMessage } from "react-native-flash-message";
import QRCode from "react-native-qrcode-svg";

function ShopOrderDetail(props) {
    const isFocused = useIsFocused();
    const [orderDetail, setOrderDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [flag, setFlag] = useState(false);
    const { id } = props.route.params;

    useEffect(() => {
        props.navigation.setOptions({
            title: `Đơn hàng #${id}`,
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
            fetchOrderDetail();
        }
    }, [isFocused, flag]);

    const fetchOrderDetail = async () => {
        setLoading(true);
        const token = await AsyncStorage.getItem('sme_user_token');

        try {
            const response = await axios({
                method: 'get',
                url: `${apiConfig.BASE_URL}/member/order/${id}`,
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                setOrderDetail(response.data);
                setLoading(false);
            }
        } catch (error) {
            console.log(error);
            setLoading(false);
            showMessage({
                message: error.response?.data?.message || 'Đã xảy ra lỗi khi tải thông tin đơn hàng',
                type: 'danger',
                icon: 'danger',
                duration: 3000,
            });
        }
    };

    const handleCancelOrder = () => {
        Alert.alert(
            "Xác nhận huỷ đơn",
            "Bạn có chắc chắn muốn huỷ đơn hàng này?",
            [
                {
                    text: "Không",
                    style: "cancel"
                },
                {
                    text: "Huỷ đơn",
                    style: "destructive",
                    onPress: confirmCancelOrder
                }
            ]
        );
    };

    const confirmCancelOrder = async () => {
        const token = await AsyncStorage.getItem('sme_user_token');
        try {
            const response = await axios.put(
                `${apiConfig.BASE_URL}/member/order/shop/canceled/${id}`,
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

    const handleShipOrder = () => {
        Alert.alert(
            "Xác nhận giao hàng",
            "Bạn đã giao hàng cho đơn vị vận chuyển?",
            [
                {
                    text: "Chưa",
                    style: "cancel"
                },
                {
                    text: "Đã giao",
                    onPress: confirmShipOrder
                }
            ]
        );
    };

    const confirmShipOrder = async () => {
        const token = await AsyncStorage.getItem('sme_user_token');
        try {
            const response = await axios({
                method: 'put',
                url: `${apiConfig.BASE_URL}/member/order/shop/danggiao/${id}`,
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
                showMessage({
                    message: `Đã cập nhật đơn hàng #${id}`,
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

    const handleConfirmOrder = () => {
        Alert.alert(
            "Xác nhận đặt hàng",
            "Bạn đã nhận được tiền cho đơn hàng này?",
            [
                {
                    text: "Chưa",
                    style: "cancel"
                },
                {
                    text: "Đã nhận",
                    onPress: confirmConfirmOrder
                }
            ]
        );
    };

    const confirmConfirmOrder = async () => {
        const token = await AsyncStorage.getItem('sme_user_token');
        try {
            const response = await axios({
                method: 'put',
                url: `${apiConfig.BASE_URL}/member/order/shop/confirm/${id}`,
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
                showMessage({
                    message: `Đã cập nhật đơn hàng #${id}`,
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

    if (loading) {
        return (
            <View style={tw`flex-1 justify-center items-center bg-white`}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    if (!orderDetail) {
        return (
            <View style={tw`flex-1 justify-center items-center p-5 bg-white`}>
                <Icon name="alert-circle-outline" size={60} style={tw`text-red-500 mb-3`} />
                <Text style={tw`text-center text-gray-700`}>Không tìm thấy thông tin đơn hàng</Text>
            </View>
        );
    }

    const { order } = orderDetail;
    const priceDetails = JSON.parse(order.priceDetails);
    const receiver = JSON.parse(order.receiver);

    return (
        <View style={tw`flex-1 bg-gray-100`}>
            <StatusBar barStyle="light-content" backgroundColor="#3b82f6" />

            <View style={tw`bg-white p-3 flex-row justify-between items-center`}>
                <View style={tw`flex-row items-center`}>
                    <View>
                        <Text style={tw`font-bold text-lg`}>Đơn hàng #{order.id}</Text>
                        <View style={tw`flex-row mt-1`}>
                            <View style={tw`bg-blue-50 px-2 py-1 rounded mr-2`}>
                                <Text style={tw`text-xs`}>{order.status}</Text>
                            </View>
                            {order.process && (
                                <View style={tw`bg-red-50 px-2 py-1 rounded`}>
                                    <Text style={tw`text-xs`}>{order.process}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                <View>
                    <Text style={tw`text-xs text-gray-500`}>Ngày tạo:</Text>
                    <Text style={tw`text-xs`}>{formatDateTime(order.createdAt)}</Text>
                </View>
            </View>

            <ScrollView style={tw`flex-1`}>
                <View style={tw`p-3`}>
                    {/* Thông tin người nhận */}
                    <View style={tw`mb-4 bg-white p-4 rounded-lg shadow-sm`}>
                        <Text style={tw`text-green-600 font-medium uppercase mb-3`}>Thông tin nhận hàng</Text>

                        <View style={tw`flex-row justify-between py-2 border-b border-gray-100`}>
                            <Text style={tw`text-gray-500`}>Họ tên</Text>
                            <Text style={tw`font-medium`}>{receiver.name}</Text>
                        </View>

                        <View style={tw`flex-row justify-between py-2 border-b border-gray-100`}>
                            <Text style={tw`text-gray-500`}>Số điện thoại</Text>
                            <Text style={tw`font-medium`}>{receiver.phone}</Text>
                        </View>

                        {receiver.email && (
                            <View style={tw`flex-row justify-between py-2 border-b border-gray-100`}>
                                <Text style={tw`text-gray-500`}>Email</Text>
                                <Text style={tw`font-medium`}>{receiver.email}</Text>
                            </View>
                        )}

                        <View style={tw`flex-row justify-between py-2 border-b border-gray-100`}>
                            <Text style={tw`text-gray-500`}>Địa chỉ</Text>
                            <Text style={tw`font-medium text-right flex-1 ml-2`}>{receiver.address}</Text>
                        </View>

                        {order.note && (
                            <View style={tw`mt-2`}>
                                <Text style={tw`text-gray-500`}>Ghi chú</Text>
                                <Text style={tw`text-gray-800`}>{order.note || 'Không có'}</Text>
                            </View>
                        )}
                    </View>

                    {/* Chi tiết đơn hàng */}
                    <View style={tw`mb-4 bg-white p-4 rounded-lg shadow-sm`}>
                        <Text style={tw`text-blue-600 font-medium uppercase mb-3`}>Thông tin đặt hàng</Text>

                        {order.type === 'Dịch vụ' ? (
                            <>
                                {priceDetails.restaurant && (
                                    <View style={tw`bg-blue-50 border border-blue-200 p-3 rounded mb-3 flex-row items-center`}>
                                        <Icon name="storefront-outline" size={24} style={tw`text-gray-500 mr-2`} />
                                        <View>
                                            <Text style={tw`font-medium text-blue-600`}>{priceDetails.restaurant.name}</Text>
                                            <Text style={tw`text-xs text-gray-500 italic`}>
                                                <Icon name="map-marker" size={12} style={tw`-mt-1`} /> {priceDetails.restaurant.address}
                                            </Text>
                                        </View>
                                    </View>
                                )}

                                {priceDetails.priceDetail && priceDetails.priceDetail.map((item, index) => (
                                    <View key={index} style={tw`flex-row justify-between py-2 border-b border-gray-100`}>
                                        <Text style={tw`text-gray-600`}>
                                            {item.serviceName} <Text style={tw`font-bold`}>x {item.quantity}</Text>
                                        </Text>
                                        <Text>{formatVND(Number(item.price) * Number(item.quantity))}</Text>
                                    </View>
                                ))}
                            </>
                        ) : (
                            <>
                                {priceDetails.shop && (
                                    <View style={tw`bg-blue-50 border border-blue-200 p-3 rounded mb-3 flex-row items-center`}>
                                        <Icon name="storefront-outline" size={24} style={tw`text-gray-500 mr-2`} />
                                        <View>
                                            <Text style={tw`font-medium text-blue-600`}>{priceDetails.shop.name}</Text>
                                            <Text style={tw`text-xs text-gray-500 italic`}>
                                                <Icon name="map-marker" size={12} style={tw`-mt-1`} /> {priceDetails.shop.address}
                                            </Text>
                                        </View>
                                    </View>
                                )}

                                {priceDetails.priceDetail && priceDetails.priceDetail.map((item, index) => (
                                    <View key={index} style={tw`flex-row justify-between py-2 border-b border-gray-100 items-center`}>
                                        <View style={tw`flex-1 mr-2`}>
                                            <Text style={tw`text-gray-600`}>
                                                {item.product.name} - {item.name} <Text style={tw`font-bold`}>x {item.quantity}</Text>
                                            </Text>
                                        </View>
                                        <View>
                                            {item.discount > 0 && (
                                                <Text style={tw`text-xs text-gray-400 line-through`}>{formatVND(item.subTotal)}</Text>
                                            )}
                                            <Text>{formatVND(item.price)}</Text>
                                        </View>
                                    </View>
                                ))}
                            </>
                        )}

                        <View style={tw`flex-row justify-between py-2 border-b border-gray-100 mt-2`}>
                            <Text style={tw`text-gray-500`}>Tạm tính</Text>
                            <Text>{formatVND(order.revenue)}</Text>
                        </View>

                        {order.discount > 0 && (
                            <View style={tw`flex-row justify-between py-2 border-b border-gray-100`}>
                                <Text style={tw`text-gray-500`}>Giảm giá</Text>
                                <Text style={tw`text-red-600`}>-{formatVND(order.discount)}</Text>
                            </View>
                        )}

                        {order.nccDiscount > 0 && (
                            <View style={tw`flex-row justify-between py-2 border-b border-gray-100`}>
                                <Text style={tw`text-gray-500`}>Khuyến mại từ Nhà cung cấp</Text>
                                <Text style={tw`text-red-600`}>-{formatVND(order.nccDiscount)}</Text>
                            </View>
                        )}

                        {order.VATAmount > 0 && (
                            <View style={tw`flex-row justify-between py-2 border-b border-gray-100`}>
                                <Text style={tw`text-gray-500`}>VAT</Text>
                                <Text>{formatVND(order.VATAmount)}</Text>
                            </View>
                        )}

                        <View style={tw`flex-row justify-between py-2 border-b border-gray-100`}>
                            <Text style={tw`text-gray-500`}>Tổng tiền</Text>
                            <Text style={tw`text-green-600 font-medium text-lg`}>{formatVND(order.amount)}</Text>
                        </View>
                    </View>

                    {/* QR Code cho thanh toán nếu cần */}
                    {order.status === 'Chờ thanh toán' && order.orderSource === 'Offline' && (
                        <View style={tw`mb-4 bg-white p-4 rounded-lg shadow-sm items-center`}>
                            <Text style={tw`text-red-600 font-medium uppercase mb-3`}>Thanh toán</Text>
                            <Text style={tw`mb-4 text-center`}>
                                Sử dụng ứng dụng SME Mart quét mã thanh toán đơn hàng <Text style={tw`font-medium`}>#{order.id}</Text>
                            </Text>
                            <View style={tw`items-center bg-white p-2 border border-gray-200 rounded-lg`}>
                                <QRCode
                                    value={`${orderDetail.settings?.mk_website_url}/member/pay-order/${order.id}`}
                                    size={200}
                                />
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Bottom action buttons */}
            {(order.status === 'Chờ xác nhận' || order.status === 'Chờ thanh toán') && (
                <View style={tw`bg-white p-3 border-t border-gray-200 flex-row space-x-2 justify-end`}>
                    <TouchableOpacity
                        style={tw`bg-red-500 px-4 py-2 rounded`}
                        onPress={handleCancelOrder}
                    >
                        <Text style={tw`text-white font-medium`}>Huỷ đơn</Text>
                    </TouchableOpacity>

                    {order.status === 'Chờ xác nhận' && (
                        <TouchableOpacity
                            style={tw`bg-blue-500 px-4 py-2 rounded`}
                            onPress={handleConfirmOrder}
                        >
                            <Text style={tw`text-white font-medium`}>Xác nhận đặt hàng</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {order.process === 'Chờ lấy hàng' && (
                <View style={tw`bg-white p-3 border-t border-gray-200 flex-row space-x-2 justify-end`}>
                    <TouchableOpacity
                        style={tw`bg-blue-500 px-4 py-2 rounded`}
                        onPress={handleShipOrder}
                    >
                        <Text style={tw`text-white font-medium`}>Đã giao hàng</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

export default ShopOrderDetail;
