import React, { useEffect, useState, useCallback, useMemo } from "react";
import { apiClient } from "app/services/client";
import tw from "twrnc";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { FlatGrid } from "react-native-super-grid";
import ProductItem from "app/components/ProductItem";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import ProjectItem from "app/components/ProjectItem";

// Memoized components
const MemoizedProductItem = React.memo(ProductItem);
const MemoizedProjectItem = React.memo(ProjectItem);

function HomeProducts(props) {
	const [result, setResult] = useState();
	const [catId, setCatId] = useState('ALL');
	const [category, setCategory] = useState();
	const [loading, setLoading] = useState(false);

	// Debounced category fetch to prevent excessive API calls
	const fetchCategory = useCallback(async (categoryId) => {
		if (categoryId === 'ALL') return;

		try {
			const response = await apiClient.get(`/product-category/${categoryId}`);
			if (response.status === 200) {
				setCategory(response.data);
			}
		} catch (error) {
			console.log('Error fetching category:', error);
		}
	}, []);

	// Optimized product fetch with error handling
	const fetchProducts = useCallback(async (categoryId, settingsExist) => {
		if (!settingsExist) return;

		setLoading(true);
		try {
			const response = await apiClient.get('/product', {
				params: {
					category: categoryId === 'ALL' ? 'ALL' : [categoryId],
					limit: 8,
					page: 1,
				}
			});

			if (response.status === 200) {
				setResult(response.data);
			}
		} catch (error) {
			console.log('Error fetching products:', error);
			setResult(null);
		} finally {
			setLoading(false);
		}
	}, []);

	// Effect for category fetch
	useEffect(() => {
		fetchCategory(catId);
	}, [catId, fetchCategory]);

	// Effect for products fetch
	useEffect(() => {
		fetchProducts(catId, !!props.settings);
	}, [catId, props.settings, fetchProducts]);

	// Memoized header component
	const renderHeader = useMemo(() => (
		<View style={tw`px-4 flex-row items-center justify-between mb-3`}>
			<View style={tw`flex-row items-center`}>
				<View style={tw`bg-red-50 p-2 rounded-full mr-2`}>
					<Icon name="storefront" size={20} style={tw`text-red-600`} />
				</View>
				<Text style={tw`text-gray-800 font-bold text-base uppercase`}>Cửa hàng SME</Text>
			</View>
		</View>
	), []);

	// Memoized category tabs with optimized rendering
	const renderCategoryTabs = useMemo(() => {
		if (!props.categories?.length) return null;

		return (
			<View style={tw`mb-4 px-4`}>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={tw`py-1`}
					removeClippedSubviews={true}
				>
					<TouchableOpacity
						activeOpacity={0.7}
						onPress={() => setCatId('ALL')}
						style={tw`mr-2 rounded-full px-4 py-2 ${catId === 'ALL' ? 'bg-green-600' : 'bg-gray-100'}`}
					>
						<Text style={tw`font-medium ${catId === 'ALL' ? 'text-white' : 'text-gray-700'}`}>Tất cả</Text>
					</TouchableOpacity>
					{props.categories.map((item) => (
						<TouchableOpacity
							key={item.id}
							activeOpacity={0.7}
							style={tw`mr-2 rounded-full px-4 py-2 ${catId === item.id ? 'bg-green-600' : 'bg-gray-100'}`}
							onPress={() => setCatId(item.id)}
						>
							<Text style={tw`font-medium ${catId === item.id ? 'text-white' : 'text-gray-700'}`}>
								{item.name}
							</Text>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>
		);
	}, [props.categories, catId]);

	// Optimized skeleton with fewer elements
	const renderSkeleton = useMemo(() => (
		<SkeletonPlaceholder>
			<View style={tw`flex-row flex-wrap justify-between px-4`}>
				{[...Array(4)].map((_, index) => (
					<View key={index} style={tw`w-[48%] mb-4`}>
						<View style={tw`h-32 w-full rounded-xl mb-2`} />
						<View style={tw`w-3/4 h-3 rounded-full mb-1`} />
						<View style={tw`w-1/2 h-3 rounded-full`} />
					</View>
				))}
			</View>
		</SkeletonPlaceholder>
	), []);

	// Memoized empty state
	const renderEmptyState = useMemo(() => (
		<View style={tw`items-center justify-center py-8`}>
			<View style={tw`bg-gray-100 p-5 rounded-full mb-3`}>
				<Icon name="package-variant" size={40} style={tw`text-gray-300`} />
			</View>
			<Text style={tw`text-gray-400 text-base mb-1`}>Chưa có sản phẩm</Text>
			<Text style={tw`text-gray-500 text-sm`}>trong danh mục này</Text>
		</View>
	), []);

	// Memoized view all button
	const renderViewAllButton = useMemo(() => (
		<View style={tw`items-center border-t border-gray-100 pt-4 pb-2`}>
			<TouchableOpacity
				style={tw`bg-green-50 rounded-full px-6 py-2 flex-row items-center`}
				onPress={() => props.navigation.navigate(catId === 'ALL' ? 'Products' : "ProductCategory", {
					catId: category?.detail?.id,
					catSlug: category?.detail?.slug,
				})}
			>
				<Text style={tw`mr-1 text-green-600 font-medium`}>Xem thêm sản phẩm</Text>
				<Icon name="chevron-right" size={16} style={tw`text-green-600`} />
			</TouchableOpacity>
		</View>
	), [catId, category, props.navigation]);

	// Optimized render item function
	const renderItem = useCallback(({ item }) => {
		return item.type === 'Dự án' ? (
			<MemoizedProjectItem item={item} navigation={props.navigation} />
		) : (
			<MemoizedProductItem item={item} navigation={props.navigation} />
		);
	}, [props.navigation]);

	// Memoized product grid
	const renderProductGrid = useMemo(() => {
		if (!result?.list?.length) return renderEmptyState;

		return (
			<FlatGrid
				itemDimension={150}
				data={result.list}
				spacing={10}
				renderItem={renderItem}
				removeClippedSubviews={true}
				maxToRenderPerBatch={6}
				windowSize={8}
				getItemLayout={(data, index) => ({
					length: 200, // Approximate item height
					offset: 200 * index,
					index,
				})}
				keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
			/>
		);
	}, [result?.list, renderItem, renderEmptyState]);

	return (
		<View style={tw`py-4`}>
			{renderHeader}
			{renderCategoryTabs}

			{result?.list?.length > 0 ? (
				loading ? (
					renderSkeleton
				) : (
					<>
						{renderProductGrid}
						{renderViewAllButton}
					</>
				)
			) : (
				renderEmptyState
			)}
		</View>
	);
}

export default React.memo(HomeProducts);
