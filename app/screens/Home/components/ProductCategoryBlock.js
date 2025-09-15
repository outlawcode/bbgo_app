import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import { apiClient } from "app/services/client";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { FlatGrid } from "react-native-super-grid";
import ProductItem from "app/components/ProductItem";

function ProductCategoryBlock(props) {
	const dispatch = useDispatch()
	const [category, setCategory] = useState();
	const [products, setProducts] = useState();

	useEffect(() => {
		const dataRequests = [
			apiClient.get(`/category/${props.catId}`),
			apiClient.get('/product', {
				params: {
					limit: 8,
					category: [props.catId],
					status: 'ACTIVE'
				}
			}),
		]

		Promise.all(dataRequests)
			.then((result) => {
				setCategory(result[0].data);
				setProducts(result[1].data);
			})
			.catch((error) => {
				console.log(error);
			})
	}, [props.refresh, props.catId])

	return (
		<View style={tw`bg-white mb-5 py-4`}>
			<View style={tw`mx-3 mb-2 flex flex-row items-center justify-between`}>
				<View style={tw`flex flex-row items-center`}>
					<Text  style={tw`uppercase font-bold text-green-600`}>{category && category.detail && category.detail.name}</Text>
				</View>
			</View>
			{products && products.list.length > 0 ?
				<>
					<FlatGrid
						itemDimension={150}
						data={products.list}
						additionalRowStyle={tw`flex items-start`}
						spacing={10}
						renderItem={({ item }) => (
							<ProductItem item={item} navigation={props.navigation} />
						)} />
					<View style={tw`flex items-center content-center border-t border-gray-100 pt-3`}>
						<TouchableOpacity
							style={tw`flex flex-row items-center`}
							onPress={() => props.navigation.navigate("ProductCategory", {
								catId: category.detail.id,
								catSlug: category.detail.slug,
							})}
						>
							<Text  style={tw`mr-1 text-green-600 font-medium`}>Xem thêm</Text>
							<Icon name={"chevron-right"} style={tw`text-gray-500`} size={18} />
						</TouchableOpacity>
					</View>
				</>
				:
				<View style={tw`flex items-center content-center`}>
					<Icon name={"package-variant"} size={30} style={tw`text-gray-200`} />
					<Text  style={tw`text-gray-300`}>Chưa có sản phẩm</Text><Text style={tw`text-gray-400`}>trong danh mục</Text>
				</View>
			}
		</View>
	);
}

export default ProductCategoryBlock;
