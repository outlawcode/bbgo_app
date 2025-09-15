import React, {useEffect, useState} from 'react';
import {Dimensions, Image, Text, TouchableOpacity, View} from "react-native";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as geolib from 'geolib';

function RestaurantItem(props) {
    const [distance, setDistance] = useState(0)
    const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');
    const CONTENT_WIDTH = Math.round(viewportWidth - 50);
    const {item, map} = props;

    useEffect(() => {
        if (map) {
            setDistance(
                geolib.getDistance({
                    latitude: map.lat,
                    longitude: map.lng
                }, {
                    latitude: item.map_lat,
                    longitude: item.map_lng,
                })
            )
        }

    }, [navigator, map])

    return (
        <TouchableOpacity
            onPress={() => props.navigation.navigate('RestaurantDetails', {
                id: item.id
            })}
            activeOpacity={1}
        >
            <View
                style={tw`mb-2 bg-white p-3`}
            >
                <View style={tw`flex flex-row`}>
                    <View style={tw`mr-2`}>
                        {item.image
                            ?
                            <Image source={{uri: item.image}} style={tw`w-14 h-14 object-cover rounded`} />
                            :
                            <Image source={require('../../../assets/images/default-food.png')} style={tw`w-14 h-14 object-cover rounded`} />
                        }
                    </View>
                    <View>
                        <View style={[tw`flex flex-row`, {width: CONTENT_WIDTH}]}>
                            <Icon name={"shield-check"} size={16} style={tw`text-orange-400 mr-2 mt-1`}/>
                            <Text style={[tw`font-medium text-base text-gray-800`]} numberOfLines={2}>{item.name}</Text>
                        </View>
                        <View>
                            <Text style={tw`text-gray-500 text-xs`}>{Number(Number(distance)/1000).toFixed(2)} km</Text>
                            <Text style={tw`text-gray-500 text-xs`}>{item.address && item.address}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>

    );
}

export default RestaurantItem;
