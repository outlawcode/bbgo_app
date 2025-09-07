import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View, Dimensions } from "react-native";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import NewsItem from "app/components/NewsItem";
import { apiClient } from "app/services/client";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { useDispatch } from "react-redux";
import LinearGradient from "react-native-linear-gradient";

const { width: screenWidth } = Dimensions.get('window');

// Memoized components
const MemoizedNewsItem = React.memo(NewsItem);

function News(props) {
	const dispatch = useDispatch();
	const [result, setResult] = useState();
	const [catId, setCatId] = useState('ALL');
	const [categories, setCategories] = useState();
	const [loading, setLoading] = useState(false);

	// Optimized category fetch
	const fetchCategories = useCallback(async () => {
		setLoading(true);
		try {
			const response = await apiClient.get('/post-category');
			if (response.status === 200) {
				setCategories(response.data);
			}
		} catch (error) {
			console.log('Error fetching categories:', error);
		} finally {
			setLoading(false);
		}
	}, []);

	// Optimized posts fetch
	const fetchPosts = useCallback(async (categoryId) => {
		setLoading(true);
		try {
			const response = await apiClient.get('/post', {
				params: {
					catId: categoryId === 'ALL' ? 'ALL' : [categoryId],
					limit: 8,
					page: 1,
					status: 'Đăng',
				}
			});
			if (response.status === 200) {
				setResult(response.data);
			}
		} catch (error) {
			console.log('Error fetching posts:', error);
			setResult(null);
		} finally {
			setLoading(false);
		}
	}, []);

	// Effects
	useEffect(() => {
		fetchCategories();
	}, [dispatch, fetchCategories]);

	useEffect(() => {
		fetchPosts(catId);
	}, [catId, fetchPosts]);

	// Memoized section header
	const renderSectionHeader = useMemo(() => (
		<View style={tw`px-4 flex-row items-center justify-between mb-4`}>
			<View style={tw`flex-row items-center`}>
				<View style={tw`bg-cyan-50 p-2 rounded-full mr-2`}>
					<Icon name="newspaper-variant" size={20} style={tw`text-cyan-600`} />
				</View>
				<Text style={tw`text-gray-7 font-medium`}>Tin tức & Sự kiện</Text>
			</View>
			<TouchableOpacity
				style={tw`flex-row items-center`}
				onPress={() => props.navigation.navigate("Posts")}
			>
				<Text style={tw`mr-1 text-cyan-600 font-medium`}>Xem tất cả</Text>
				<Icon name="chevron-right" size={16} style={tw`text-cyan-600`} />
			</TouchableOpacity>
		</View>
	), [props.navigation]);

	// Memoized categories with optimization
	const renderCategories = useMemo(() => {
		if (!categories?.length) return null;

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
						style={tw`mr-2 rounded-md px-4 py-2 ${catId === 'ALL' ? 'bg-cyan-600' : 'bg-gray-100'}`}
					>
						<Text style={tw`font-medium ${catId === 'ALL' ? 'text-white' : 'text-gray-700'}`}>Tất cả</Text>
					</TouchableOpacity>
					{categories.map((item) => (
						<TouchableOpacity
							key={item.id}
							activeOpacity={0.7}
							style={tw`mr-2 rounded-md px-4 py-2 ${catId === item.id ? 'bg-cyan-600' : 'bg-gray-100'}`}
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
	}, [categories, catId]);

	// Optimized skeleton
	const renderSkeleton = useMemo(() => (
		<SkeletonPlaceholder>
			<View style={tw`mb-5 mx-4`}>
				<View style={tw`h-52 w-full rounded-xl mb-2`} />
				<View style={tw`w-3/4 h-4 rounded-full mb-1`} />
				<View style={tw`w-1/2 h-3 rounded-full`} />
			</View>
			<View style={tw`flex-row justify-between mb-5 mx-4`}>
				{[...Array(2)].map((_, index) => (
					<View key={index} style={tw`w-48`}>
						<View style={tw`h-32 w-full rounded-xl mb-2`} />
						<View style={tw`w-full h-3 rounded-full mb-1`} />
						<View style={tw`w-2/3 h-3 rounded-full`} />
					</View>
				))}
			</View>
		</SkeletonPlaceholder>
	), []);

	// Memoized featured news
	const renderFeaturedNews = useCallback((item) => (
		<TouchableOpacity
			activeOpacity={0.9}
			onPress={() => props.navigation.navigate('PostDetail', {slug: item.slug})}
			style={tw`px-4 mb-4`}
		>
			<View style={tw`rounded-md overflow-hidden shadow-sm`}>
				<Image
					source={{uri: item.featureImage}}
					style={[tw`w-full h-48 rounded-md`, {resizeMode: 'cover'}]}
				/>
				<LinearGradient
					colors={['transparent', 'rgba(0,0,0,0.9)']}
					style={tw`absolute bottom-0 left-0 right-0 px-3 py-4`}
				>
					<Text style={tw`text-white font-medium`} numberOfLines={2} ellipsizeMode='tail'>
						{item.title}
					</Text>
					<View style={tw`flex-row items-center mt-1`}>
						<Icon name="clock-outline" size={14} style={tw`text-white opacity-80 mr-1`} />
						<Text style={tw`text-white text-xs opacity-80`}>
							{new Date(item.createdAt).toLocaleDateString('vi-VN')}
						</Text>
					</View>
				</LinearGradient>
			</View>
		</TouchableOpacity>
	), [props.navigation]);

	// Optimized news list with memoization
	const renderNewsList = useCallback((items) => (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={tw`px-4 pb-2`}
			removeClippedSubviews={true}
		>
			{items.map((item) => (
				<View key={item.id} style={tw`mr-4 w-48`}>
					<MemoizedNewsItem
						horizontal={false}
						item={item}
						navigation={props.navigation}
					/>
				</View>
			))}
			<View style={tw`h-full flex items-center justify-center mr-3 w-20`}>
				<TouchableOpacity
					onPress={() => props.navigation.navigate('Posts')}
					style={tw`items-center justify-center`}
				>
					<View style={tw`bg-cyan-50 flex-row items-center justify-center rounded-full h-12 w-12 mb-2`}>
						<Icon name="arrow-right" size={24} style={tw`text-cyan-600`} />
					</View>
					<Text style={tw`text-cyan-600 text-xs font-medium`}>Xem thêm</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
	), [props.navigation]);

	// Memoized empty state
	const renderEmptyState = useMemo(() => (
		<View style={tw`items-center justify-center py-6`}>
			<Icon name="newspaper-variant-outline" size={50} style={tw`text-gray-300 mb-2`} />
			<Text style={tw`text-gray-400 text-center mb-1`}>Chuyên mục này</Text>
			<Text style={tw`text-gray-500 text-center`}>hiện chưa có bài viết!</Text>
		</View>
	), []);

	// Memoized posts data
	const postsData = useMemo(() => {
		return result?.posts || [];
	}, [result?.posts]);

	return (
		<View style={tw`py-4`}>
			{renderSectionHeader}
			{renderCategories}

			{loading ? (
				renderSkeleton
			) : postsData.length > 0 ? (
				<>
					{postsData[0] && renderFeaturedNews(postsData[0])}
					{postsData.length > 1 && renderNewsList(postsData.slice(1))}
				</>
			) : (
				renderEmptyState
			)}
		</View>
	);
}

export default React.memo(News);
