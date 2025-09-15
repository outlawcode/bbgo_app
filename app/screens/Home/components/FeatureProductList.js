import React, {useRef} from "react";
import {Dimensions, FlatList, Text, TouchableOpacity, View} from "react-native";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import ProductItem from "app/components/ProductItem";

function ProductList(props) {
	const { width: viewportWidth } = Dimensions.get('window');
	const ITEM_HORIZONTAL_MARGIN = 8;
	const SLIDE_WIDTH = Math.round((viewportWidth - ITEM_HORIZONTAL_MARGIN * 6) / 2);
	const ITEM_WIDTH = SLIDE_WIDTH;
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
				<FlatList
					ref={carouselRef}
					data={props.items && props.items}
					renderItem={({item}) => (
						<View style={[tw`px-1 py-1`, {width: ITEM_WIDTH}]}>
							<ProductItem item={item} navigation={props.navigation} />
						</View>
					)}
					horizontal
					showsHorizontalScrollIndicator={false}
					keyExtractor={(item, index) => index.toString()}
					contentContainerStyle={tw`px-1`}
					snapToInterval={ITEM_WIDTH + 8}
					decelerationRate="fast"
					snapToAlignment="start"
				/>
			</View>
		</View>
	);
}

export default React.memo(ProductList);
