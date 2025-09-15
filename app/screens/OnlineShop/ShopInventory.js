import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StatusBar, Text, TextInput, TouchableOpacity, View, Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import { useIsFocused } from "@react-navigation/native";
import { formatNumber, formatVND } from "app/utils/helper.js";
import { showMessage } from "react-native-flash-message";
import defaultImage from "../../assets/images/logo.png";

function ShopInventory(props) {
    const isFocused = useIsFocused();
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        props.navigation.setOptions({
            title: 'Kho hàng',
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
                    onPress={() => props.navigation.navigate('InventoryReport')}
                    style={tw`mr-3`}
                >
                    <Icon name="chart-bar" size={24} style={tw`text-white`} />
                </TouchableOpacity>
            ),
        });
    }, []);

    useEffect(() => {
        if (isFocused) {
            fetchInventory();
        }
    }, [isFocused, page, limit, searchQuery]);

    const fetchInventory = async () => {
        setLoading(true);
        const token = await AsyncStorage.getItem('sme_user_token');

        try {
            const response = await axios({
                method: 'get',
                url: `${apiConfig.BASE_URL}/member/shop-product-stock`,
                params: {
                    query: searchQuery || null,
                    page,
                    limit
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                if (page === 1) {
                    setInventory(response.data.list);
                } else {
                    setInventory([...inventory, ...response.data.list]);
                }
                setTotalItems(response.data.count);
                setLoading(false);
                setRefreshing(false);
            }
        } catch (error) {
            console.log(error);
            setLoading(false);
            setRefreshing(false);
            showMessage({
                message: error.response?.data?.message || 'Đã xảy ra lỗi khi tải thông tin kho hàng',
                type: 'danger',
                icon: 'danger',
                duration: 3000,
            });
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        setPage(1);
        fetchInventory();
    };

    const handleLoadMore = () => {
        if (loading) return;
        if (inventory.length < totalItems) {
            setPage(page + 1);
        }
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
        setPage(1);
    };

    const getInStock = (item) => {
        return Number(item.inQty || 0) - Number(item.outQty || 0);
    };

    const renderInventoryItem = ({ item }) => (
        <View style={tw`bg-white mb-3 rounded-lg overflow-hidden shadow-sm`}>
            <View style={tw`flex-row`}>
                <Image
                    source={item.image ? { uri: item.image } : defaultImage}
                    style={tw`w-20 h-20 bg-gray-100`}
                    resizeMode="cover"
                />

                <View style={tw`flex-1 p-3`}>
                    <Text style={tw`font-medium text-gray-800 mb-1`} numberOfLines={2}>{item.name}</Text>
                    <Text style={tw`text-xs text-gray-500 mb-1`}>SKU: {item.SKU || 'N/A'}</Text>
                    <Text style={tw`text-green-600 font-medium`}>{formatVND(item.price)}</Text>
                </View>
            </View>

            <View style={tw`p-3 border-t border-gray-100 bg-gray-50 flex-row justify-between`}>
                <View style={tw`flex items-center`}>
                    <Text style={tw`text-xs text-gray-500`}>Tổng nhập</Text>
                    <Text style={tw`font-medium`}>{formatNumber(item.inQty || 0)}</Text>
                </View>

                <View style={tw`flex items-center`}>
                    <Text style={tw`text-xs text-gray-500`}>Đã bán</Text>
                    <Text style={tw`font-medium`}>{formatNumber(item.outQty || 0)}</Text>
                </View>

                <View style={tw`flex items-center`}>
                    <Text style={tw`text-xs text-gray-500`}>Tồn kho</Text>
                    <Text style={tw`font-medium ${getInStock(item) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatNumber(getInStock(item))}
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={tw`flex-1 bg-gray-100`}>
            <StatusBar barStyle="light-content" backgroundColor="#3b82f6" />

            <View style={tw`bg-white p-3`}>
                <View style={tw`flex-row items-center bg-gray-100 rounded-lg px-3`}>
                    <Icon name="magnify" size={20} style={tw`text-gray-500 mr-2`} />
                    <TextInput
                        style={tw`flex-1 py-2`}
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchQuery}
                        onChangeText={handleSearch}
                        returnKeyType="search"
                        onSubmitEditing={() => fetchInventory()}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => handleSearch('')}>
                            <Icon name="close-circle" size={18} style={tw`text-gray-500`} />
                        </TouchableOpacity>
                    )}
                </View>

                {totalItems > 0 && (
                    <Text style={tw`text-xs text-gray-500 mt-2`}>Tìm thấy {totalItems} sản phẩm trong kho</Text>
                )}
            </View>

            {loading && inventory.length === 0 ? (
                <View style={tw`flex-1 justify-center items-center`}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            ) : inventory.length > 0 ? (
                <FlatList
                    data={inventory}
                    renderItem={renderInventoryItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={tw`p-3 pb-20`}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    ListHeaderComponent={() => (
                        <View style={tw`bg-white mb-3 p-3 rounded-lg shadow-sm`}>
                            <Text style={tw`font-medium mb-2`}>Tổng quan kho hàng</Text>
                            <View style={tw`flex-row justify-between`}>
                                <View style={tw`flex items-center`}>
                                    <Text style={tw`text-xs text-gray-500`}>Tổng sản phẩm</Text>
                                    <Text style={tw`font-medium text-lg`}>{formatNumber(totalItems)}</Text>
                                </View>

                                <View style={tw`flex items-center`}>
                                    <Text style={tw`text-xs text-gray-500`}>Còn hàng</Text>
                                    <Text style={tw`font-medium text-lg text-green-600`}>
                                        {formatNumber(inventory.filter(item => getInStock(item) > 0).length)}
                                    </Text>
                                </View>

                                <View style={tw`flex items-center`}>
                                    <Text style={tw`text-xs text-gray-500`}>Hết hàng</Text>
                                    <Text style={tw`font-medium text-lg text-red-600`}>
                                        {formatNumber(inventory.filter(item => getInStock(item) <= 0).length)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                    ListFooterComponent={loading && inventory.length > 0 && (
                        <ActivityIndicator style={tw`py-5`} />
                    )}
                />
            ) : (
                <View style={tw`flex-1 justify-center items-center p-5`}>
                    <Icon name="cube-outline" size={60} style={tw`text-gray-300 mb-3`} />
                    <Text style={tw`text-gray-500 text-center`}>
                        {searchQuery ? 'Không tìm thấy sản phẩm nào' : 'Chưa có sản phẩm nào trong kho'}
                    </Text>
                </View>
            )}
        </View>
    );
}

export default ShopInventory;
