import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StatusBar, Text, TextInput, TouchableOpacity, View, Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import { useIsFocused } from "@react-navigation/native";
import { formatVND } from "app/utils/helper.js";
import { showMessage } from "react-native-flash-message";
import defaultImage from "app/assets/images/default-shop-cover.png";

function ShopProducts(props) {
    const isFocused = useIsFocused();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        props.navigation.setOptions({
            title: 'Quản lý Sản phẩm',
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
                    onPress={() => props.navigation.navigate('AddProduct')}
                    style={tw`mr-3`}
                >
                    <Icon name="plus-circle" size={26} style={tw`text-white`} />
                </TouchableOpacity>
            ),
        });
    }, []);

    useEffect(() => {
        if (isFocused) {
            fetchProducts();
        }
    }, [isFocused, page, limit, searchQuery]);

    const fetchProducts = async () => {
        setLoading(true);
        const token = await AsyncStorage.getItem('sme_user_token');

        try {
            const response = await axios({
                method: 'get',
                url: `${apiConfig.BASE_URL}/member/product`,
                params: {
                    query: searchQuery || null,
                    page,
                    limit
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                if (page === 1) {
                    setProducts(response.data.list);
                } else {
                    setProducts([...products, ...response.data.list]);
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
                message: error.response?.data?.message || 'Đã xảy ra lỗi khi tải sản phẩm',
                type: 'danger',
                icon: 'danger',
                duration: 3000,
            });
        }
    };

    console.log(products);

    const handleRefresh = () => {
        setRefreshing(true);
        setPage(1);
        fetchProducts();
    };

    const handleLoadMore = () => {
        if (loading) return;
        if (products.length < totalItems) {
            setPage(page + 1);
        }
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
        setPage(1);
    };

    const renderProductItem = ({ item }) => (
        <TouchableOpacity
            style={tw`bg-white mb-3 rounded-lg overflow-hidden shadow-sm flex-row`}
            onPress={() => props.navigation.navigate('EditProduct', { id: item.id })}
        >
            <Image
                source={item.featureImage ? { uri: item.featureImage } : defaultImage}
                style={tw`w-24 h-24 bg-gray-100`}
                resizeMode="cover"
            />

            <View style={tw`flex-1 p-3 justify-between`}>
                <View>
                    <Text style={tw`font-medium text-gray-800 mb-1`} numberOfLines={2}>{item.name}</Text>
                </View>

                <View style={tw`flex-row justify-between items-center`}>
                    <Text style={tw`text-green-600 font-medium`}>{formatVND(item.prices[0]?.price || 0)}</Text>
                    <View style={tw`${item.status === 'Đăng' ? 'bg-green-100' : 'bg-gray-100'} px-2 py-1 rounded`}>
                        <Text style={tw`text-xs ${item.status === 'Đăng' ? 'text-green-700' : 'text-gray-700'}`}>
                            {item.status === 'Đăng' ? 'Đang bán' : 'Ngừng bán'}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
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
                        onSubmitEditing={() => fetchProducts()}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => handleSearch('')}>
                            <Icon name="close-circle" size={18} style={tw`text-gray-500`} />
                        </TouchableOpacity>
                    )}
                </View>

                {totalItems > 0 && (
                    <Text style={tw`text-xs text-gray-500 mt-2`}>Tìm thấy {totalItems} sản phẩm</Text>
                )}
            </View>

            {loading && products.length === 0 ? (
                <View style={tw`flex-1 justify-center items-center`}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            ) : products.length > 0 ? (
                <FlatList
                    data={products}
                    renderItem={renderProductItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={tw`p-3 pb-20`}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    ListFooterComponent={loading && products.length > 0 && (
                        <ActivityIndicator style={tw`py-5`} />
                    )}
                />
            ) : (
                <View style={tw`flex-1 justify-center items-center p-5`}>
                    <Icon name="package-variant" size={60} style={tw`text-gray-300 mb-3`} />
                    <Text style={tw`text-gray-500 text-center mb-5`}>
                        {searchQuery ? 'Không tìm thấy sản phẩm nào' : 'Chưa có sản phẩm nào'}
                    </Text>
                    <TouchableOpacity
                        style={tw`bg-blue-500 py-2 px-4 rounded-lg flex-row items-center`}
                        onPress={() => props.navigation.navigate('AddProduct')}
                    >
                        <Icon name="plus" size={18} style={tw`text-white mr-1`} />
                        <Text style={tw`text-white font-medium`}>Thêm sản phẩm mới</Text>
                    </TouchableOpacity>
                </View>
            )}

            {products.length > 0 && (
                <TouchableOpacity
                    style={tw`absolute bottom-5 right-5 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-md`}
                    onPress={() => props.navigation.navigate('AddProduct')}
                >
                    <Icon name="plus" size={30} style={tw`text-white`} />
                </TouchableOpacity>
            )}
        </View>
    );
}

export default ShopProducts;
