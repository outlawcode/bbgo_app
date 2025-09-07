import React, {useRef} from "react";
import {Dimensions, Text, TouchableOpacity, View} from "react-native";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Carousel from "react-native-snap-carousel";
import ProductItem from "app/components/ProductItem";

function ProductList(props) {
	const { width: viewportWidth } = Dimensions.get('window');
	const SLIDE_WIDTH = Math.round(viewportWidth / (props.type === 'Dự án' ? 1.3 : 2.2));
	const ITEM_HORIZONTAL_MARGIN = 10;
	const ITEM_WIDTH = SLIDE_WIDTH + ITEM_HORIZONTAL_MARGIN * 2;
	const SLIDER_WIDTH = viewportWidth;
	const carouselRef = useRef(null);

	return (
		<View style={tw`pt-0 pb-2`}>
			{props.viewAllButton && (
				<TouchableOpacity
					style={tw`absolute right-4 top-4 z-10 flex-row items-center`}
					onPress={() => props.navigation.navigate("Products")}
				>
					<Text style={tw`mr-1 text-gray-700`}>Xem thêm</Text>
					<Icon name={"chevron-right"} style={tw`text-gray-700`} size={16} />
				</TouchableOpacity>
			)}

			<View style={tw`mx-2 relative`}>
				<Carousel
					ref={carouselRef}
					sliderWidth={SLIDER_WIDTH}
					itemWidth={ITEM_WIDTH}
					activeSlideAlignment={'start'}
					inactiveSlideScale={1}
					inactiveSlideOpacity={1}
					data={props.items && props.items}
					renderItem={({item}) => (
						<View style={tw`px-2 py-1`}>
							<ProductItem item={item} navigation={props.navigation} />
						</View>
					)}
					hasParallaxImages={false}
					autoplay
					autoplayInterval={4000}
					loop
					removeClippedSubviews={true}
					maxToRenderPerBatch={5}
					windowSize={10}
				/>
			</View>
		</View>
	);
}

export default React.memo(ProductList);
