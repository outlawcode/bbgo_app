import React, { useRef } from "react";
import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {FlatGrid} from "react-native-super-grid";
import ApiConfig from "app/config/api-config";
import ProductItem from "app/components/ProductItem";
import Carousel from "react-native-snap-carousel";
import ProjectItem from "app/components/ProjectItem";
import ShopItem from "app/components/ShopItem";
import ServiceShopItem from "app/components/ServiceShopItem";

function ShopList(props) {
	const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');
	const SLIDE_WIDTH = Math.round(viewportWidth / (props.type === 'Dự án' ? 1.3 : 2.6));
	const ITEM_HORIZONTAL_MARGIN = 15;
	const ITEM_WIDTH = SLIDE_WIDTH + ITEM_HORIZONTAL_MARGIN * 2;
	const SLIDER_WIDTH = viewportWidth;
	const carouselRef = useRef(null);

	return (
		<View style={tw`bg-white mb-5 pt-0 pb-2`}>
			<View style={tw`mx-3 relative`}>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					removeClippedSubviews={true}
				>
					{props.items && props.items.list.map((el, index) => (
						<View key={el.id || index}>
							{el.type === 'Product' ?
								<ShopItem item={el} navigation={props.navigation} />
								:
								<ServiceShopItem item={el} navigation={props.navigation} />
							}
						</View>
					))}
				</ScrollView>
			</View>
		</View>
	);
}

export default React.memo(ShopList);
