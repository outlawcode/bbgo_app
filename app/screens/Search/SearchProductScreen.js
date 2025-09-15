import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import { apiClient } from "app/services/client";
import { FlatGrid } from "react-native-super-grid";
import ProductItem from "app/components/ProductItem";
import FeatureProductList from "app/screens/Home/components/FeatureProductList";
import { useSelector } from "react-redux";

function SearchProductScreen(props) {
	const [loading, setLoading] = useState(true);
	const [query, setQuery] = useState('');
	const [products, setProducts] = useState({list: [], count: 0});

	const state = props.route && props.route.params;
	const settings = useSelector(state => state.SettingsReducer.options)

	useEffect(() => {
		setLoading(true);
		if (settings && typeof query !== 'undefined') {
			const timer = setTimeout(() => {
				apiClient.get('/product', {
					params: {
						query,
					}
				}).then(function(response) {
					if(response.status === 200) {
						setProducts({
							list: response.data.list,
							count: response.data.count
						})
						setLoading(false);
					}
				}).catch((function(error) {
					console.log(error);
				}))
			}, 300)
			return () => clearTimeout(timer)
		}
		if (query === '' || typeof query === 'undefined') {
			setProducts({list: [], count: 0})
		}
	}, [query])

	return (
		<View>
			<View style={tw`bg-white ios:pt-14 android:pt-14 pb-4 flex-row justify-between items-center`}>
				<TouchableOpacity
					onPress={() => props.navigation.goBack()}
					style={tw`mr-3 ml-3`}
				>
					<Icon name="chevron-left" size={28}/>
				</TouchableOpacity>
				<View style={tw`flex-row items-center bg-gray-200 rounded w-4/5 mr-3 h-8`}>
					<Icon name="magnify" size={18} style={tw`text-gray-500 ml-2`} />
					<TextInput
						autoFocus
						style={tw`ml-2 w-4/5 android:h-20`}
						value={query}
						onChangeText={event => setQuery(event)}
						placeholder="Nhập tên sản phẩm..."
						returnKeyType={"done"}
					/>
					<TouchableOpacity onPress={() => setQuery()}>
						<Icon name="close-circle" size={18} style={tw`text-gray-500`}/>
					</TouchableOpacity>
				</View>
			</View>
				{loading ?
					<View style={tw`pb-40 pt-3`}>
						<FeatureProductList
							title={"Sản phẩm Khuyến mại - Hot"}
							icon={"brightness-percent"}
							iconColor={"text-red-500"}
							titleColor={"text-gray-800"}
							items={state.featuredProducts && state.featuredProducts}
							navigation={props.navigation}
						/>
					</View>
					:
					<View style={tw`pb-40 pt-3`}>
						<Text  style={tw`font-bold uppercase text-green-600 ml-3`}>Kết quả tìm kiếm</Text>
						<ScrollView>
							<View style={tw`pb-40`}>
								<FlatGrid
									itemDimension={150}
									data={products && products.list}
									additionalRowStyle={tw`flex items-start`}
									spacing={10}
									horizontal={false}
									renderItem={({item, index}) => (
										<ProductItem item={item} navigation={props.navigation} key={index}/>
									)} />
							</View>
							</ScrollView>

					</View>
				}
		</View>
	);
}

export default SearchProductScreen;
