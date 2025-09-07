import React from "react";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { View } from "react-native";
import tw from "twrnc";
import ProductItem from "app/components/ProductItem";
import { FlatGrid } from "react-native-super-grid";

function ProductDetailLoading(props) {
	return (
		<SkeletonPlaceholder>
			<View style={tw`h-80 mb-5`} />
			<View style={tw`h-5 w-100 mx-3 mb-5`} />
			<View style={tw`h-2 w-20 mx-3 mb-5`} />
			<View style={tw`h-10 mx-3 mb-5`} />
			<View style={tw`h-40 mx-3 mb-5`} />
		</SkeletonPlaceholder>
	);
}

export default ProductDetailLoading;
