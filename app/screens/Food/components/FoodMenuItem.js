import React, {useState} from 'react';
import {Image, Text, TouchableOpacity, View} from "react-native";
import tw from "twrnc";
import {formatVND} from "app/utils/helper";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

function FoodMenuItem(props) {
    const {service} = props;
    const [quantity, setQuantity] = useState(props.quantity ? props.quantity.quantity : 0);

    return (
        <View style={tw`flex flex-row py-3 border-b border-gray-100`}>
            <View style={tw`w-1/5`}>
                <Image source={service.image ? {uri: service.image} : require('../../../assets/images/default-food.png')} style={tw`w-16 h-16 object-cover rounded`}/>
            </View>
            <View style={tw`w-4/5 relative`}>
                <Text numberOfLines={1} style={tw`font-medium text-gray-800 text-base`}>{service.name}</Text>
                <View style={tw`mt-3`}>
                    <View style={tw`flex items-center justify-between flex-row`}>
                        <View>
                            <Text style={tw`text-red-500`}>{formatVND(service.price)}</Text>
                        </View>
                        <View>
                            <View style={tw`flex items-center flex-row`}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setQuantity(Number(quantity) - 1)
                                        props.onChange({
                                            quantity: Number(quantity) - 1,
                                            serviceId: props.service.id,
                                            price: props.service.price,
                                            serviceName: props.service.name,
                                            serviceImage: props.service.image,
                                        })
                                    }}
                                    disabled={quantity === 0}
                                    style={tw`${quantity === 0 ? 'bg-gray-100' : 'bg-red-500'} px-2 py-2 rounded`}
                                >
                                    <Icon
                                        name={"minus"}
                                        style={tw`${quantity === 0 ? 'text-gray-700' : 'text-white'}`}
                                    />
                                </TouchableOpacity>
                                <View style={tw`mx-2`}>
                                    <Text style={tw`font-medium`}>{quantity}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        setQuantity(Number(quantity) + 1)
                                        props.onChange({
                                            quantity: Number(quantity) + 1,
                                            serviceId: props.service.id,
                                            price: props.service.price,
                                            serviceName: props.service.name,
                                            serviceImage: props.service.image,
                                        })
                                    }}
                                    style={tw`bg-green-600 px-2 py-2 rounded`}
                                >
                                    <Icon
                                        name={"plus"}
                                        style={tw`text-white`}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

            </View>
        </View>
    );
}

export default FoodMenuItem;
