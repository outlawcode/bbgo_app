import React from "react";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { View } from "react-native";
import tw from "twrnc";
import ProductItem from "app/components/ProductItem";
import { FlatGrid } from "react-native-super-grid";

function ProductPageLoading(props) {
	return (
		<SkeletonPlaceholder>
			<View style={tw`h-30 mb-5`} />
			<View style={tw`h-5 mx-3 mb-5`} />
			<View style={tw`flex flex-row items-center justify-between mb-5 mx-3`}>
				<View>
					<View style={tw`h-40 w-40 mb-2`} />
					<View style={tw`w-20 h-3`} />
				</View>
				<View>
					<View style={tw`h-40 w-40 mb-2`} />
					<View style={tw`w-20 h-3`} />
				</View>
			</View>
			<View style={tw`flex flex-row items-center justify-between mb-5 mx-3`}>
				<View>
					<View style={tw`h-40 w-40 mb-2`} />
					<View style={tw`w-20 h-3`} />
				</View>
				<View>
					<View style={tw`h-40 w-40 mb-2`} />
					<View style={tw`w-20 h-3`} />
				</View>
			</View>
		</SkeletonPlaceholder>
	);
}

export default ProductPageLoading;
