import React from "react";
import {Dimensions, Text, TouchableOpacity, View} from "react-native";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Carousel from "react-native-snap-carousel";
import FoodItem from "app/components/FoodItem";

function FeatureFoodList(props) {
	const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');
	const SLIDE_WIDTH = Math.round(viewportWidth / (2.6));
	const ITEM_HORIZONTAL_MARGIN = 15;
	const ITEM_WIDTH = SLIDE_WIDTH + ITEM_HORIZONTAL_MARGIN * 0.2;
	const SLIDER_WIDTH = viewportWidth;
	return (
		<View style={tw`bg-white mb-5 py-4`}>
			<View style={tw`mx-3 mb-3 flex flex-row items-center justify-between`}>
				<View style={tw`flex flex-row items-center`}>
					<Icon name={props.icon} style={tw`${props.iconColor} mr-2 -mt-1`} size={24}/>
					<Text  style={tw`uppercase font-bold ${props.titleColor ? props.titleColor : 'text-gray-800'}`}>{props.title}</Text>
				</View>
				<TouchableOpacity
					style={tw`flex flex-row items-center`}
					onPress={() => props.navigation.navigate("Foods", {
						screen: "Foods",
						params: {
							slug: "food"
						},
					})}
				>
					<Text style={tw`mr-1 text-gray-700`}>Xem thêm</Text>
					<Icon name={"chevron-right"} style={tw`text-gray-700`} size={16} />
				</TouchableOpacity>
			</View>
			<View style={tw`mx-3 relative`}>
				<Carousel
					//ref={(c) => this.carousel = c}
					sliderWidth={SLIDER_WIDTH}
					itemWidth={ITEM_WIDTH}
					activeSlideAlignment={'start'}
					inactiveSlideScale={1}
					inactiveSlideOpacity={1}
					data={props.items && props.items}
					renderItem={({item}) => (
						<View style={tw`mr-2`}>
							<FoodItem
								item={item}
								navigation={props.navigation}
							/>
						</View>
					)}
					hasParallaxImages={false}
					autoplay={false}
					autoplayInterval={4000}
					loop
				/>
			</View>
		</View>
	);
}

export default FeatureFoodList;
