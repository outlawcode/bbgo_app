import React from "react";
import tw from "twrnc";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

function ShopInfoBox({ shop, navigation }) {
    if (!shop) return null;

    return (
        <View style={tw`bg-white mb-3 p-3 rounded`}>
            <View style={tw`flex flex-row items-center justify-between`}>
                <Text style={tw`uppercase text-gray-600 font-medium mb-2`}>Thông tin gian hàng</Text>
            </View>

            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate('StoreDetail', { name: shop.niceName })}
                style={tw`flex flex-row items-center mt-1`}
            >
                <View style={tw`mr-3`}>
                    {shop.avatar ? (
                        <Image
                            source={{ uri: shop.avatar }}
                            style={tw`w-14 h-14 rounded-full border border-gray-200`}
                            resizeMode="cover"
                        />
                    ) : (
                        <Image
                            source={require('../../../assets/images/shop-default-avatar.png')}
                            style={tw`w-14 h-14 rounded-full border border-gray-200`}
                            resizeMode="cover"
                        />
                    )}
                </View>

                <View style={tw`flex-1`}>
                    <Text style={tw`font-bold text-base`} numberOfLines={1} ellipsizeMode="tail">
                        {shop.name}
                    </Text>

                    {shop.type && (
                        <View style={tw`bg-blue-100 self-start rounded-full px-2 py-0.5 mt-1`}>
                            <Text style={tw`text-blue-600 text-xs`}>{shop.type}</Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    style={tw`bg-green-600 px-3 py-2 rounded flex flex-row items-center`}
                    onPress={() => navigation.navigate('StoreDetail', { name: shop.niceName })}
                >
                    <Icon name="storefront-outline" size={16} style={tw`text-white mr-1`} />
                    <Text style={tw`text-white font-medium text-xs`}>Xem shop</Text>
                </TouchableOpacity>
            </TouchableOpacity>

            {shop.address && (
                <View style={tw`flex flex-row items-start mt-3`}>
                    <Icon name="map-marker-outline" size={18} style={tw`text-gray-500 mr-2 mt-0.5`} />
                    <Text style={tw`text-gray-600 text-sm flex-1`} numberOfLines={2}>
                        {shop.address}
                    </Text>
                </View>
            )}

            {shop.phone && (
                <View style={tw`flex flex-row items-center mt-2`}>
                    <Icon name="phone-outline" size={18} style={tw`text-gray-500 mr-2`} />
                    <Text style={tw`text-gray-600 text-sm`}>{shop.phone}</Text>
                </View>
            )}

            <View style={tw`flex flex-row items-center mt-2`}>
                <Icon name="package-variant-closed" size={18} style={tw`text-gray-500 mr-2`} />
                <Text style={tw`text-gray-600 text-sm`}>
                    {shop.products ? `${shop.products} sản phẩm` : "Nhiều sản phẩm đa dạng"}
                </Text>
            </View>

            {shop.description && (
                <View style={tw`mt-3 pt-3 border-t border-gray-100`}>
                    <Text style={tw`text-gray-600 text-sm`} numberOfLines={2} ellipsizeMode="tail">
                        {shop.description}
                    </Text>
                </View>
            )}
        </View>
    );
}

export default ShopInfoBox;
