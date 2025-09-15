import React from "react";
import { ScrollView, View } from "react-native";
import tw from "twrnc";
import RestaurantShopItem from "app/components/RestaurantShopItem";

function Restaurants(props) {
  return (
    <View style={tw`py-2`}>
      <View style={tw`mx-2 relative`}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          removeClippedSubviews={true}
          contentContainerStyle={tw`px-2`}
        >
          {props.items && props.items.length > 0 && props.items.map((restaurant, index) => (
            <RestaurantShopItem 
              key={restaurant.id || index}
              item={restaurant} 
              navigation={props.navigation} 
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

export default React.memo(Restaurants); 