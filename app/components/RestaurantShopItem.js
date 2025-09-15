import React from "react";
import tw from "twrnc";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

function RestaurantShopItem(props) {
  const { item } = props;
  
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => props.navigation.navigate('RestaurantDetails', {
        id: item.id
      })}
      style={tw`border border-gray-100 h-52 w-64 relative bg-white mr-2 rounded-lg overflow-hidden shadow-sm`}
    >
      <View>
        {item.coverImage || item.image ?
          <Image 
            source={{uri: item.coverImage || item.image}} 
            style={[tw`w-full h-32`, { resizeMode: 'cover' }]} 
          />
          :
          <View style={tw`w-full h-32 bg-orange-100 items-center justify-center`}>
            <Icon name="silverware-fork-knife" size={40} style={tw`text-orange-300`} />
          </View>
        }
        
        {/* Restaurant avatar/logo */}
        {item.image ?
          <Image
            source={{uri: item.image}}
            style={[tw`w-14 h-14 rounded-full absolute -bottom-5 left-5 border-2 border-white`, { resizeMode: 'cover' }]}
          />
          :
          <View style={tw`w-14 h-14 rounded-full absolute -bottom-5 left-5 border-2 border-white bg-orange-200 items-center justify-center`}>
            <Icon name="silverware-fork-knife" size={20} style={tw`text-orange-600`} />
          </View>
        }
        
        {/* Featured badge */}
        <View style={tw`absolute top-2 right-2 bg-orange-500 px-2 py-1 rounded-full`}>
          <Text style={tw`text-white text-xs font-medium`}>Nổi bật</Text>
        </View>
      </View>
      
      <View style={tw`p-2 mt-4`}>
        <Text style={tw`font-medium text-gray-800`} numberOfLines={1} ellipsizeMode='tail'>
          {item.name}
        </Text>
        <View style={tw`flex-row items-center mt-1`}>
          <Icon name="map-marker" size={12} style={tw`text-gray-400 mr-1`} />
          <Text style={tw`text-gray-500 text-xs flex-1`} numberOfLines={1}>
            {item.address || 'Địa chỉ không có'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default RestaurantShopItem; 