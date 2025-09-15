import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import { showMessage } from "react-native-flash-message";
import LinearGradient from "react-native-linear-gradient"; // You'll need to install this

function QuickMenu(props) {
    const menus = [
        {
            name: 'Internet',
            link: 'internet',
            icon: 'wifi',
            color: 'bg-red-500',
            gradientFrom: 'from-red-400',
            gradientTo: 'to-red-600'
        },
        {
            name: 'Điện thoại trả sau',
            link: 'mobile',
            icon: 'cellphone-charging',
            color: 'bg-green-600',
            gradientFrom: 'from-green-400',
            gradientTo: 'to-green-600'
        },
        {
            name: 'Thanh toán Điện nước',
            link: 'electric',
            icon: 'lightbulb',
            color: 'bg-purple-500',
            gradientFrom: 'from-purple-400',
            gradientTo: 'to-purple-600'
        },
        {
            name: 'Nạp điện thoại',
            link: 'mobileafter',
            icon: 'cellphone-check',
            color: 'bg-blue-600',
            gradientFrom: 'from-blue-400',
            gradientTo: 'to-blue-600'
        },
        {
            name: 'Đặt vé máy bay',
            link: 'airplane',
            icon: 'airplane',
            color: 'bg-yellow-500',
            gradientFrom: 'from-yellow-400',
            gradientTo: 'to-yellow-600'
        },
        {
            name: 'Mua vé xem phim',
            link: 'movie',
            icon: 'ticket',
            color: 'bg-orange-500',
            gradientFrom: 'from-orange-400',
            gradientTo: 'to-orange-600'
        },
    ];

    return (
        <View style={tw`py-4 px-2`}>
            <View style={tw`flex-row items-center mb-4 px-2`}>
                <Icon name="credit-card-outline" size={20} style={tw`text-green-600 mr-2`} />
                <Text style={tw`text-base font-bold text-gray-800`}>Dịch vụ thanh toán</Text>
            </View>

            <View style={tw`flex-row flex-wrap -mx-1`}>
                {menus.map((el, index) => (
                    <View key={index} style={tw`w-1/3 px-1 mb-3`}>
                        <TouchableOpacity
                            style={tw`items-center`}
                            activeOpacity={0.8}
                            onPress={() => {
                                showMessage({
                                    message: `Tính năng ${el.name} đang được xây dựng`,
                                    type: 'success',
                                    icon: 'success',
                                    duration: 2000,
                                });
                            }}
                        >
                            <LinearGradient
                                colors={['#f3f4f6', '#f9fafb']}
                                style={tw`rounded-xl shadow-sm p-3 w-full items-center mb-1`}
                            >
                                <View style={tw`bg-${el.gradientFrom} ${el.gradientTo} bg-gradient-to-br p-2 rounded-lg mb-1`}>
                                    <Icon name={el.icon} size={20} style={tw`text-white`} />
                                </View>
                                <Text style={tw`text-xs text-center text-gray-800 font-medium mt-1`}>{el.name}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </View>
    );
}

export default QuickMenu;
