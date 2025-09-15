import React, {useCallback, useEffect, useMemo, useState} from "react";
import {
	ActivityIndicator,
	Animated,
	Dimensions,
	FlatList,
	Image,
	Platform,
	RefreshControl, ScrollView,
	StatusBar,
	Text,
	TouchableOpacity,
	View
} from "react-native";
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from "react-redux";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from "twrnc";
import {apiClient} from "app/services/client";
import Slideshow from "app/screens/Home/components/Slideshow";
import FeatureProductList from "app/screens/Home/components/FeatureProductList";
import News from "app/screens/Home/components/News";
import CartIcon from "app/screens/Cart/components/cartIcon";
import HomePageLoading from "app/screens/Home/components/HomePageLoading";
import HomeProducts from "app/screens/Home/components/HomeProducts";
import LinearGradient from "react-native-linear-gradient";
import FeedbackList from "app/screens/Home/components/FeedbackList";

const { width: screenWidth } = Dimensions.get('window');

const HomeScreen = (props) => {
	const dispatch = useDispatch();
	const insets = useSafeAreaInsets();
	const settings = useSelector(state => state.SettingsReducer.options);
	const map = useSelector(state => state.SettingsReducer.map);
	const categories = useSelector(state => state.SettingsReducer.productCategories);
	const currentUser = useSelector(state => state.memberAuth.user);

	// Animated values for header
	const scrollY = new Animated.Value(0);
	const headerOpacity = scrollY.interpolate({
		inputRange: [0, 60, 90],
		outputRange: [0, 0.5, 1],
		extrapolate: 'clamp'
	});

	// State để quản lý tất cả dữ liệu
	const [pageData, setPageData] = useState({
		newProducts: null,
		featuredProducts: null,
	});

	const [refresh, setRefresh] = useState(false);
	const [loading, setLoading] = useState(false);

	// Fetch all data with Promise.all for better performance
	const fetchAllData = useCallback(async () => {
		if (!settings) return;

		setLoading(true);
		console.log('🚀 Starting to fetch all data...');

		try {
			const promises = [];

			// Products
			console.log('📦 Setting up product API calls...');
			promises.push(
				apiClient.get('/product', {
					params: {
						limit: 8,
						page: 1,
					}
				}).then(response => {
					console.log('✅ Hot Products API Response:', response.status, response.data?.list?.length || 0, 'items');
					return { type: 'newProducts', data: response.data };
				}).catch(error => {
					console.log('❌ Hot Products API Error:', error.message);
					return { type: 'newProducts', data: null };
				})
			);

			promises.push(
				apiClient.get('/product', {
					params: {
						limit: 8,
						page: 1,
						featured: 'Có'
					}
				}).then(response => {
					console.log('✅ New Products API Response:', response.status, response.data?.list?.length || 0, 'items');
					return { type: 'featuredProducts', data: response.data };
				}).catch(error => {
					console.log('❌ New Products API Error:', error.message);
					return { type: 'featuredProducts', data: null };
				})
			);

			const results = await Promise.all(promises);
			// Process results and update state
			const newPageData = { ...pageData };
			results.forEach((result, index) => {
				console.log(`📝 Processing result ${index + 1}:`, result?.type, result?.data ? 'has data' : 'no data');
				if (result && result.type) {
					newPageData[result.type] = result.data;
				}
			});

			console.log('💾 Updating page data with:', Object.keys(newPageData).map(key => `${key}: ${newPageData[key] ? '✅' : '❌'}`).join(', '));
			setPageData(newPageData);

		} catch (error) {
			console.log('💥 Error in fetchAllData:', error);
		} finally {
			setLoading(false);
			setRefresh(false);
			console.log('🏁 Fetch all data completed!');
		}
	}, [settings, map]);

	// Hook để lấy dữ liệu khi settings thay đổi hoặc refresh
	useEffect(() => {
		fetchAllData();
	}, [refresh, settings, map, fetchAllData]);

	// Destructure pageData để dễ dàng sử dụng trong JSX
	const {
		newProducts,
		featuredProducts,
	} = pageData;

	let testimonials = []
	let slideshow = []

	if (settings) {
		if (settings.testimonials) {
			testimonials = JSON.parse(settings && settings.testimonials);
		}
		if (settings.slideshow) {
			slideshow = JSON.parse(settings && settings.slideshow);
		}

	}

	// Memoized header component
	const renderHeader = useCallback(() => (
		<Animated.View
			style={[
				tw`absolute top-0 left-0 right-0 z-50`,
				{
					height: Platform.OS === 'ios' ? 100 : 80,
				}
			]}
		>
			{/* Solid white background with shadow */}
			<Animated.View
				style={[
					tw`absolute inset-0`,
					{
						opacity: headerOpacity,
						backgroundColor: '#ffffff',
						shadowColor: '#000',
						shadowOffset: { width: 0, height: 3 },
						shadowOpacity: 0.15,
						shadowRadius: 4,
						elevation: 2,
					}
				]}
			/>

			{/* Header content */}
			<View style={[
				tw`${Platform.OS === 'ios' ? 'pt-12' : 'pt-8'} pb-1 px-4 flex-row items-center justify-between bg-white`,
				{ height: '100%' }
			]}>
				{/* Logo only */}
				<View style={tw`flex-row items-center bg-white`}>
					<Image
						source={{uri: settings && settings.website_logo}}
						style={tw`h-12 w-12 mr-3`}
						resizeMode="contain"
					/>
					<TouchableOpacity
						activeOpacity={0.9}
						style={tw`flex flex-row items-center bg-gray-100 rounded-md px-3 py-2 w-52 shadow-sm relative`}
						onPress={() => props.navigation.navigate("SearchScreen", {
							featuredProducts: featuredProducts && featuredProducts.list
						})}
					>
						<Text style={tw`text-gray-500`}>Tìm kiếm sản phẩm...</Text>
						<Icon name="magnify" size={20} style={tw`absolute right-3 text-gray-500`}/>
					</TouchableOpacity>
				</View>

				{/* Action buttons */}
				<View style={tw`flex-row items-center`}>

					<CartIcon
						navigation={props.navigation}
						dark
					/>

					<TouchableOpacity
						activeOpacity={0.7}
						onPress={() => props.navigation.openDrawer()}
						style={tw`p-2 ml-2`}
					>
						<Icon name="menu" size={22} style={tw`text-gray-700`} />
					</TouchableOpacity>
				</View>
			</View>
		</Animated.View>
	), [headerOpacity, settings, featuredProducts, props.navigation]);

	// Login section with modern design
	const renderLoginSection = useCallback(() => (
		!currentUser && (
			<View style={tw`android:my-3 android:mx-4 overflow-hidden rounded-2xl`}>
				<LinearGradient
					colors={['#008a97', '#008A97']}
					start={{x: 0, y: 0}}
					end={{x: 1, y: 0}}
					style={tw`px-4 pt-3 h-38 rounded-2xl`}
				>
					<View style={tw`flex-row justify-between items-center`}>
						<View style={tw`w-3/4`}>
							<Text style={tw`text-white font-bold text-lg mb-1`}>
								Chào {getTimeOfDay()}!
							</Text>
							<Text style={tw`text-white text-opacity-90 mb-3`}>
								Hãy đăng nhập để nhận nhiều ưu đãi hấp dẫn và quản lý đơn hàng dễ dàng hơn!
							</Text>
							<TouchableOpacity
								onPress={() => props.navigation.navigate('Login', {
									backScreen: 'Home'
								})}
								style={tw`bg-white px-4 py-2 rounded-full flex-row items-center self-start shadow-md`}
							>
								<Text style={tw`text-cyan-600 font-medium`}>ĐĂNG NHẬP</Text>
								<Icon name="arrow-right" size={16} style={tw`text-cyan-600 ml-1`} />
							</TouchableOpacity>
						</View>
						<View style={tw`absolute -right-2 -top-2 opacity-20`}>
							<Icon name="gift-open-outline" size={100} style={tw`text-white`} />
						</View>
					</View>
				</LinearGradient>
			</View>
		)
	), [currentUser, props.navigation]);

	// Section Header component for consistent styling
	const SectionHeader = useCallback(({ title, icon, color, onPress, showViewAll = true }) => (
		<View style={tw`mx-4 pt-3 pb-3 flex-row items-center justify-between`}>
			<View style={tw`flex-row items-center`}>
				<View style={tw`bg-${color}-50 p-2 rounded-full mr-2`}>
					<Icon name={icon} size={20} style={tw`text-${color}-600`} />
				</View>
				<Text style={tw`text-gray-700 font-medium`}>{title}</Text>
			</View>
			{showViewAll && (
				<TouchableOpacity
					style={tw`flex-row items-center`}
					onPress={onPress}
				>
					<Text style={tw`mr-1 text-${color}-500 font-medium`}>Xem thêm</Text>
					<Icon name="chevron-right" size={16} style={tw`text-${color}-600`} />
				</TouchableOpacity>
			)}
		</View>
	), []);

	// Memoized refresh control
	const refreshControl = useMemo(() => (
		<RefreshControl
			refreshing={refresh}
			onRefresh={() => setRefresh(true)}
			title="đang tải"
			titleColor="#008A97"
			tintColor="#008A97"
			colors={['#008A97']}
		/>
	), [refresh]);

	const getTimeOfDay = () => {
		const now = new Date();
		const hour = now.getHours();

		if (hour >= 5 && hour < 12) {
			return 'Buổi sáng';
		} else if (hour >= 12 && hour < 18) {
			return 'Buổi chiều';
		} else if (hour >= 18 && hour < 22) {
			return 'Buổi tối';
		} else {
			return 'Buổi tối';
		}
	};

	return (
		<View style={tw`bg-gray-50`}>
			<StatusBar
				barStyle="dark-content"
				backgroundColor="transparent"
				translucent={true}
			/>

			{renderHeader()}

			<ScrollView
				removeClippedSubviews={false}
				nestedScrollEnabled={true}
				bounces={true}
				contentContainerStyle={tw`pb-20`}
				showsVerticalScrollIndicator={false}
				refreshControl={refreshControl}
				onScroll={Animated.event(
					[{ nativeEvent: { contentOffset: { y: scrollY } } }],
					{ useNativeDriver: false }
				)}
				overScrollMode={'never'}
			>
				{/* Padding to accommodate fixed header */}
				<View style={tw`${Platform.OS === 'ios' ? 'pt-28' : 'pt-22'}`} />

				{loading ? (
					<ActivityIndicator animating={loading} />
				) : (
					<>
						{/* Slideshow with rounded corners */}
						{settings && slideshow && (
							<View style={tw`mb-2 mx-4 rounded-md shadow-sm bg-white`}>
								<Slideshow
									items={slideshow}
									navigation={props.navigation}
								/>
							</View>
						)}

						{/* Categories */}
						{/*<View style={tw`mt-4 bg-white pb-3 mb-4`}>
							<SectionHeader
								title="Danh mục sản phẩm"
								icon="view-grid"
								color="green"
								showViewAll={false}
							/>
							<CategoryHorizontalList
								category={categories && categories}
								navigation={props.navigation}
							/>
						</View>*/}

						{/* New Products */}
						{featuredProducts && featuredProducts.list && featuredProducts.list.length > 0 && (
							<View style={tw`bg-white`}>
								<SectionHeader
									title="Dành cho bạn"
									icon="check-decagram"
									color="cyan"
									onPress={() => props.navigation.navigate("Products")}
								/>
								<FeatureProductList
									title={"Dành cho bạn"}
									icon={"brightness-percent"}
									iconColor={"text-red-500"}
									titleColor={"text-gray-800"}
									items={featuredProducts.list}
									navigation={props.navigation}
									type={"Sản phẩm"}
									viewAllButton={false}
								/>
							</View>
						)}

						{renderLoginSection()}

						{/* New Products */}
						{newProducts && newProducts.list && newProducts.list.length > 0 && (
							<View style={tw`mb-4 bg-white`}>
								<SectionHeader
									title="Sản phẩm Mới"
									icon="new-box"
									color="orange"
									onPress={() => props.navigation.navigate("Products")}
								/>
								<FeatureProductList
									title={"Sản phẩm Mới"}
									icon={"check-decagram"}
									iconColor={"text-blue-500"}
									titleColor={"text-gray-800"}
									items={newProducts.list}
									navigation={props.navigation}
									type={"Sản phẩm"}
									viewAllButton={false}
								/>
							</View>
						)}

						{/* Home Products */}
						<View style={tw`bg-white rounded-xl shadow-sm`}>
							<HomeProducts
								settings={settings && settings}
								navigation={props.navigation}
								categories={categories && categories}
							/>
						</View>

						{settings && settings.about_section_image2 &&
							<View style={tw`mb-3 bg-gray-100`}>
								<Image source={{uri: settings.about_section_image2}} style={tw`w-full h-auto`} />
							</View>
						}

						{settings && testimonials && (
							<FeedbackList
								items={testimonials}
							/>
						)}

						{/* News Section */}
						<View style={tw`mb-4 bg-white rounded-xl shadow-sm`}>
							<News
								horizontal={true}
								navigation={props.navigation}
							/>
						</View>
					</>
				)}
			</ScrollView>
		</View>
	);
};

export default HomeScreen;
