import React, { useEffect, useState, useRef } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Animated,
    PanResponder
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import { formatVND } from "app/utils/helper.js";
import { showMessage } from "react-native-flash-message";

function ProductPrices({ productId }) {
    const [priceList, setPriceList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [draggingIdx, setDraggingIdx] = useState(-1);

    // For drag and drop functionality
    const point = useRef(new Animated.ValueXY()).current;
    const scrollOffset = useRef(0);
    const flatlistRef = useRef(null);
    const rowHeight = 80; // Adjust based on your item's height

    // Form fields for adding new price
    const [name, setName] = useState('');
    const [unit, setUnit] = useState('');
    const [price, setPrice] = useState('');
    const [inStock, setInStock] = useState('');

    useEffect(() => {
        fetchPrices();
    }, []);

    // PanResponder for handling drag gestures
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,

            onPanResponderGrant: (_, gestureState) => {
                const y = gestureState.y0 - 200; // Adjust offset based on your layout
                const itemIndex = Math.floor((y + scrollOffset.current) / rowHeight);

                if (itemIndex >= 0 && itemIndex < priceList.length) {
                    setDragging(true);
                    setDraggingIdx(itemIndex);
                    point.setOffset({ x: 0, y: itemIndex * rowHeight });
                }
            },

            onPanResponderMove: Animated.event(
                [null, { dy: point.y }],
                { useNativeDriver: false }
            ),

            onPanResponderRelease: () => {
                if (dragging) {
                    const newIdx = Math.round(point.y._value / rowHeight);
                    const validIdx = Math.max(0, Math.min(newIdx, priceList.length - 1));

                    if (draggingIdx !== validIdx) {
                        const newData = [...priceList];
                        const item = newData.splice(draggingIdx, 1)[0];
                        newData.splice(validIdx, 0, item);
                        setPriceList(newData);

                        // Update sort order on server
                        handleSortUpdate(newData);
                    }

                    setDragging(false);
                    setDraggingIdx(-1);
                    point.flattenOffset();
                    point.setValue({ x: 0, y: 0 });
                }
            }
        })
    ).current;

    const fetchPrices = async () => {
        setLoading(true);
        const token = await AsyncStorage.getItem('sme_user_token');

        try {
            const response = await axios({
                method: 'get',
                url: `${apiConfig.BASE_URL}/member/product-price/${productId}`,
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                setPriceList(response.data);
                setLoading(false);
            }
        } catch (error) {
            console.log(error);
            setLoading(false);
            showMessage({
                message: error.response?.data?.message || 'Đã xảy ra lỗi khi tải thông tin giá',
                type: 'danger',
                icon: 'danger',
                duration: 3000,
            });
        }
    };

    const handleAddPrice = async () => {
        // Validate form
        if (!name.trim() || !unit.trim() || !price || !inStock) {
            showMessage({
                message: 'Vui lòng nhập đầy đủ thông tin',
                type: 'warning',
                icon: 'warning',
                duration: 3000,
            });
            return;
        }

        setSubmitting(true);
        const token = await AsyncStorage.getItem('sme_user_token');

        try {
            const response = await axios.post(
                `${apiConfig.BASE_URL}/member/product-price`,
                {
                    name,
                    unit,
                    price: parseFloat(price),
                    inStock: parseInt(inStock),
                    product: productId,
                    productType: 'Sản phẩm'
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200 || response.status === 201) {
                showMessage({
                    message: 'Đã thêm mới giá',
                    type: 'success',
                    icon: 'success',
                    duration: 3000,
                });

                // Clear form
                setName('');
                setUnit('');
                setPrice('');
                setInStock('');

                // Refresh price list
                setPriceList([...priceList, response.data]);
                setSubmitting(false);
            }
        } catch (error) {
            console.log(error);
            setSubmitting(false);
            showMessage({
                message: error.response?.data?.message || 'Đã xảy ra lỗi khi thêm giá',
                type: 'danger',
                icon: 'danger',
                duration: 3000,
            });
        }
    };

    const handleDeletePrice = async (id) => {
        Alert.alert(
            "Xác nhận xóa",
            "Bạn có chắc chắn muốn xóa mức giá này?",
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
                                `${apiConfig.BASE_URL}/member/product-price/${id}`,
                                { headers: { Authorization: `Bearer ${token}` } }
                            );

                            if (response.status === 200) {
                                showMessage({
                                    message: 'Đã xóa giá',
                                    type: 'success',
                                    icon: 'success',
                                    duration: 3000,
                                });

                                // Update price list
                                const newPriceList = priceList.filter(item => item.id !== id);
                                setPriceList(newPriceList);
                            }
                        } catch (error) {
                            console.log(error);
                            showMessage({
                                message: error.response?.data?.message || 'Đã xảy ra lỗi khi xóa giá',
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

    const handleEditPrice = (item) => {
        Alert.prompt(
            "Chỉnh sửa giá",
            `Nhập giá mới cho "${item.name}"`,
            [
                {
                    text: "Hủy",
                    style: "cancel"
                },
                {
                    text: "Lưu",
                    onPress: async (newPrice) => {
                        if (!newPrice || isNaN(parseFloat(newPrice))) {
                            showMessage({
                                message: 'Giá không hợp lệ',
                                type: 'warning',
                                icon: 'warning',
                                duration: 3000,
                            });
                            return;
                        }

                        const token = await AsyncStorage.getItem('sme_user_token');

                        try {
                            const response = await axios.put(
                                `${apiConfig.BASE_URL}/member/product-price/${item.id}`,
                                {
                                    ...item,
                                    price: parseFloat(newPrice),
                                    productType: 'Sản phẩm'
                                },
                                { headers: { Authorization: `Bearer ${token}` } }
                            );

                            if (response.status === 200) {
                                showMessage({
                                    message: 'Đã cập nhật giá',
                                    type: 'success',
                                    icon: 'success',
                                    duration: 3000,
                                });

                                // Update price list
                                const newPriceList = priceList.map(price =>
                                    price.id === item.id ? { ...price, price: parseFloat(newPrice) } : price
                                );
                                setPriceList(newPriceList);
                            }
                        } catch (error) {
                            console.log(error);
                            showMessage({
                                message: error.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật giá',
                                type: 'danger',
                                icon: 'danger',
                                duration: 3000,
                            });
                        }
                    }
                }
            ],
            "plain-text",
            item.price.toString()
        );
    };

    const handleSortUpdate = async (data) => {
        // Prepare data for sorting
        const sortData = data.map((item, index) => ({
            sortId: index,
            id: item.id
        }));

        const token = await AsyncStorage.getItem('sme_user_token');

        try {
            const response = await axios.put(
                `${apiConfig.BASE_URL}/member/product-price/updateSort`,
                { data: JSON.stringify(sortData) },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                showMessage({
                    message: 'Đã lưu sắp xếp',
                    type: 'success',
                    icon: 'success',
                    duration: 1000,
                });
            }
        } catch (error) {
            console.log(error);
            showMessage({
                message: error.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật thứ tự',
                type: 'danger',
                icon: 'danger',
                duration: 3000,
            });
            // Revert to original order
            fetchPrices();
        }
    };

    const renderItem = ({ item, index }) => {
        // Check if this is the item being dragged
        const isActive = dragging && index === draggingIdx;

        // Apply animation style to the dragged item
        const itemStyle = isActive
            ? [
                tw`bg-white p-3 mb-2 rounded-lg border border-gray-200 bg-blue-50 shadow-md`,
                {
                    transform: [{ translateY: point.y }],
                    elevation: 5,
                    zIndex: 999,
                }
            ]
            : tw`bg-white p-3 mb-2 rounded-lg border border-gray-200`;

        return (
            <Animated.View
                style={itemStyle}
                {...(isActive ? panResponder.panHandlers : {})}
            >
                <TouchableOpacity
                    onLongPress={() => {
                        // Long press will be handled by PanResponder
                    }}
                    activeOpacity={0.7}
                >
                    <View style={tw`flex-row justify-between items-center`}>
                        <View>
                            <Text style={tw`font-medium text-gray-800`}>{item.name}</Text>
                            <Text style={tw`text-sm text-gray-500`}>{item.unit}</Text>
                            <Text style={tw`text-red-500 font-medium mt-1`}>{formatVND(item.price)}</Text>
                        </View>

                        <View style={tw`flex-row items-center`}>
                            <TouchableOpacity
                                style={tw`mr-2 p-2`}
                                onPress={() => handleEditPrice(item)}
                            >
                                <Icon name="pencil" size={20} style={tw`text-blue-500`} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={tw`p-2`}
                                onPress={() => handleDeletePrice(item.id)}
                            >
                                <Icon name="delete" size={20} style={tw`text-red-500`} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={tw`flex-1`}>
            <View style={tw`bg-white p-3 rounded-lg shadow-sm mb-4`}>
                <Text style={tw`font-medium text-gray-800 mb-4`}>Thêm giá mới</Text>

                <View style={tw`mb-3`}>
                    <Text style={tw`text-gray-600 mb-1`}>Định nghĩa</Text>
                    <TextInput
                        style={tw`border border-gray-300 rounded-lg p-2`}
                        placeholder="Ví dụ: Hộp 100 viên"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <View style={tw`mb-3`}>
                    <Text style={tw`text-gray-600 mb-1`}>Đơn vị tính</Text>
                    <TextInput
                        style={tw`border border-gray-300 rounded-lg p-2`}
                        placeholder="Ví dụ: Hộp"
                        value={unit}
                        onChangeText={setUnit}
                    />
                </View>

                <View style={tw`mb-3`}>
                    <Text style={tw`text-gray-600 mb-1`}>Giá</Text>
                    <TextInput
                        style={tw`border border-gray-300 rounded-lg p-2`}
                        placeholder="Nhập giá"
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="numeric"
                    />
                </View>

                <View style={tw`mb-4`}>
                    <Text style={tw`text-gray-600 mb-1`}>Tồn kho</Text>
                    <TextInput
                        style={tw`border border-gray-300 rounded-lg p-2`}
                        placeholder="Nhập số lượng tồn kho"
                        value={inStock}
                        onChangeText={setInStock}
                        keyboardType="numeric"
                    />
                </View>

                <TouchableOpacity
                    style={tw`bg-blue-500 p-3 rounded-lg items-center flex-row justify-center`}
                    onPress={handleAddPrice}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <>
                            <Icon name="plus" size={18} style={tw`text-white mr-1`} />
                            <Text style={tw`text-white font-medium`}>Thêm</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={tw`py-5 items-center`}>
                    <ActivityIndicator size="small" color="#3b82f6" />
                </View>
            ) : priceList.length > 0 ? (
                <View style={tw`flex-1`}>
                    <Text style={tw`text-gray-500 mb-2 ml-1`}>
                        <Icon name="information-outline" size={14} /> Kéo để sắp xếp thứ tự
                    </Text>
                    <FlatList
                        ref={flatlistRef}
                        data={priceList}
                        renderItem={renderItem}
                        keyExtractor={item => item.id.toString()}
                        scrollEnabled={!dragging}
                        onScroll={(e) => {
                            scrollOffset.current = e.nativeEvent.contentOffset.y;
                        }}
                        scrollEventThrottle={16}
                        contentContainerStyle={tw`pb-5`}
                    />
                </View>
            ) : (
                <View style={tw`bg-white p-4 rounded-lg items-center justify-center`}>
                    <Icon name="cash-remove" size={30} style={tw`text-gray-400 mb-2`} />
                    <Text style={tw`text-gray-500 text-center`}>Chưa có mức giá nào</Text>
                </View>
            )}
        </View>
    );
}

export default ProductPrices;
