import React, {useRef} from 'react';
import { Dimensions, Image, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import tw from 'twrnc';
import ApiConfig from "app/config/api-config";
import Swiper from 'react-native-swiper'
import apiConfig from "app/config/api-config";

const {width: screenWidth} = Dimensions.get('window');

function ProductGallery(props) {

	return (
		<View>
			<Swiper
				style={tw`h-80 rounded-md`}
				dot={
					<View
						style={{
							backgroundColor: 'rgba(0,119,50,0.2)',
							width: 5,
							height: 5,
							borderRadius: 4,
							marginLeft: 3,
							marginRight: 3,
							marginTop: 3,
							marginBottom: 3
						}}
					/>
				}
				activeDot={
					<View
						style={{
							backgroundColor: '#008A97',
							width: 8,
							height: 8,
							borderRadius: 4,
							marginLeft: 3,
							marginRight: 3,
							marginTop: 3,
							marginBottom: 3
						}}
					/>
				}
				paginationStyle={{
					bottom: 10,
				}}
				loop
			>
				{props.gallery.map((item, index) => (
					<Image source={{uri: item.url}} style={tw`w-full h-80 rounded-md`} resizeMode="contain" />
				))}
			</Swiper>
		</View>
	);
}

export default ProductGallery;
