import React, { useRef } from "react";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {FlatGrid} from "react-native-super-grid";
import ApiConfig from "app/config/api-config";
import ProductItem from "app/components/ProductItem";
import Carousel from "react-native-snap-carousel";
import apiConfig from "app/config/api-config";

const {width: screenWidth} = Dimensions.get('window');

function FeedbackList(props) {
	return (
		<View style={tw`py-3`}>
			<View style={tw`mx-3`}>
				<Carousel
					sliderWidth={screenWidth}
					sliderHeight={screenWidth}
					itemWidth={screenWidth}
					ref={(c) => this.carousel = c}
					data={props.items}
					renderItem={({item}) => (
						<View style={tw`flex items-center bg-white mr-6 px-3 pt-3 pb-10 rounded relative`}>
							<Image source={{uri: apiConfig.BASE_URL+item.avatar}} style={tw`w-20 h-20 rounded-full mb-2`} />
							<Text style={tw`font-bold`}>{item.name}</Text>
							<Text style={tw`text-gray-600 mb-2`}>{item.job}</Text>

							<View style={tw`flex flex-row items-center mb-3`}>
								<Icon name={"star"} style={tw`text-yellow-300`} size={20}/>
								<Icon name={"star"} style={tw`text-yellow-300`} size={20}/>
								<Icon name={"star"} style={tw`text-yellow-300`} size={20}/>
								<Icon name={"star"} style={tw`text-yellow-300`} size={20}/>
								<Icon name={"star"} style={tw`text-yellow-300`} size={20}/>
							</View>
							<Text style={tw`text-center text-gray-700`}>{item.content}</Text>
							<View style={tw`absolute top-0 left-0`}>
								<Icon name={"format-quote-open-outline"} size={60} style={tw`text-gray-200`} />
							</View>
							<View style={tw`absolute bottom-0 right-0`}>
								<Icon name={"format-quote-close-outline"} size={60} style={tw`text-gray-200`} />
							</View>
						</View>
					)}
					hasParallaxImages={false}
					autoplay
					autoplayInterval={5000}
					loop
				/>
				{/*<View style={tw`absolute top-1/2 -right-2`}>
					<TouchableOpacity
						onPress={() => this.carousel.snapToNext()}
						style={tw`flex items-center justify-center`}
						activeOpacity={1}
					>
						<View
							style={tw`bg-white flex flex-row items-center justify-center bg-green-600 rounded-3xl h-8 w-8`}>
							<Icon name="chevron-right" size={26} style={tw`text-white ml-1`} />
						</View>
					</TouchableOpacity>
				</View>
				<View style={tw`absolute top-1/2 -left-2`}>
					<TouchableOpacity
						onPress={() => this.carousel.snapToPrev()}
						style={tw`flex items-center justify-center`}
						activeOpacity={1}
					>
						<View
							style={tw`bg-white flex flex-row items-center justify-center bg-green-600 rounded-3xl h-8 w-8`}>
							<Icon name="chevron-left" size={26} style={tw`text-white`} />
						</View>
					</TouchableOpacity>
				</View>*/}
			</View>
		</View>
	);
}

export default FeedbackList;
