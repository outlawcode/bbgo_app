import React, {useEffect, useState, useMemo, useCallback} from "react";
import {
	Animated,
	Dimensions,
	Image,
	Platform,
	RefreshControl,
	StatusBar,
	Text,
	TouchableOpacity,
	View
} from "react-native";
import {useDispatch, useSelector} from "react-redux";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from "twrnc";
import {apiClient} from "app/services/client";
import Slideshow from "app/screens/Home/components/Slideshow";
import CategoryHorizontalList from "app/screens/Home/components/CategoryHorizontalList";
import FeatureProductList from "app/screens/Home/components/FeatureProductList";
import News from "app/screens/Home/components/News";
import CartIcon from "app/screens/Cart/components/cartIcon";
import HomePageLoading from "app/screens/Home/components/HomePageLoading";
import HomeProducts from "app/screens/Home/components/HomeProducts";
import ShopList from "app/screens/Home/components/FeatureShopList";
import Restaurants from "app/screens/Home/components/Restaurants";
import LinearGradient from "react-native-linear-gradient";

const { width: screenWidth } = Dimensions.get('window');

const HomeScreen = (props) => {
	const dispatch = useDispatch();
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
		hotProducts: null,
		newProducts: null,
		featuredProducts: null,
		bestSelling: null,
		featuredProjects: null,
		slideShow: null,
		services: null,
		shop: null,
		userShop: null,
		restaurants: null
	});

	const [refresh, setRefresh] = useState(false);
	const [loading, setLoading] = useState(false);
	const [textSearchHolder, setTextSearchHolder] = useState('SME Mart');

	// Thay đổi placeholder search sau 3 giây
	useEffect(() => {
		let timer1 = setTimeout(() => setTextSearchHolder('Tìm kiếm sản phẩm...'), 3000);
		return () => {
			clearTimeout(timer1);
		};
	}, [dispatch]);

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
						type: 'Sản phẩm',
						tag: 'Sản phẩm hot',
					}
				}).then(response => {
					console.log('✅ Hot Products API Response:', response.status, response.data?.list?.length || 0, 'items');
					return { type: 'hotProducts', data: response.data };
				}).catch(error => {
					console.log('❌ Hot Products API Error:', error.message);
					return { type: 'hotProducts', data: null };
				})
			);

			promises.push(
				apiClient.get('/product', {
					params: {
						limit: 8,
						page: 1,
						type: 'Sản phẩm',
						tag: 'Sản phẩm mới',
					}
				}).then(response => {
					console.log('✅ New Products API Response:', response.status, response.data?.list?.length || 0, 'items');
					return { type: 'newProducts', data: response.data };
				}).catch(error => {
					console.log('❌ New Products API Error:', error.message);
					return { type: 'newProducts', data: null };
				})
			);

			promises.push(
				apiClient.get('/product', {
					params: {
						limit: 8,
						page: 1,
						type: 'Sản phẩm',
						tag: 'Sản phẩm nổi bật',
					}
				}).then(response => {
					console.log('✅ Featured Products API Response:', response.status, response.data?.list?.length || 0, 'items');
					return { type: 'featuredProducts', data: response.data };
				}).catch(error => {
					console.log('❌ Featured Products API Error:', error.message);
					return { type: 'featuredProducts', data: null };
				})
			);

			promises.push(
				apiClient.get('/product', {
					params: {
						limit: 8,
						page: 1,
						bestSelling: 'Yes'
					}
				}).then(response => {
					console.log('✅ Best Selling API Response:', response.status, response.data?.list?.length || 0, 'items');
					return { type: 'bestSelling', data: response.data };
				}).catch(error => {
					console.log('❌ Best Selling API Error:', error.message);
					return { type: 'bestSelling', data: null };
				})
			);

			promises.push(
				apiClient.get('/product', {
					params: {
						limit: 8,
						page: 1,
						type: 'Dự án',
						featured: 'Có'
					}
				}).then(response => {
					console.log('✅ Featured Projects API Response:', response.status, response.data?.list?.length || 0, 'items');
					return { type: 'featuredProjects', data: response.data };
				}).catch(error => {
					console.log('❌ Featured Projects API Error:', error.message);
					return { type: 'featuredProjects', data: null };
				})
			);

			// Slideshow
			if (settings?.pc_app_slideshow_id) {
				console.log('🎬 Setting up slideshow API call...');
				promises.push(
					apiClient.get('/slideshow/' + settings.pc_app_slideshow_id)
						.then(response => {
							console.log('✅ Slideshow API Response:', response.status, 'items:', response.data?.items ? JSON.parse(response.data.items).length : 0);
							return { type: 'slideShow', data: response.data };
						}).catch(error => {
						console.log('❌ Slideshow API Error:', error.message);
						return { type: 'slideShow', data: null };
					})
				);
			}

			// Services
			console.log('🍔 Setting up services API call...');
			promises.push(
				apiClient.get('/services/featured', {
					params: {
						map_lat: map && map.lat ? map.lat : null,
						map_lng: map && map.lng ? map.lng : null,
					}
				}).then(response => {
					console.log('✅ Services API Response:', response.status, response.data?.length || 0, 'items');
					return { type: 'services', data: response.data };
				}).catch(error => {
					console.log('❌ Services API Error:', error.message);
					return { type: 'services', data: null };
				})
			);

			// Shops
			console.log('🏪 Setting up shops API calls...');
			promises.push(
				apiClient.get('/user-shop', {
					params: {
						limit: 12,
						page: 1,
						isMart: 0,
						featured: 'Có'
					}
				}).then(response => {
					console.log('✅ Shops (isMart=0) API Response:', response.status, response.data?.list?.length || 0, 'items');
					return { type: 'shop', data: response.data };
				}).catch(error => {
					console.log('❌ Shops API Error:', error.message);
					return { type: 'shop', data: null };
				})
			);

			promises.push(
				apiClient.get('/user-shop', {
					params: {
						limit: 12,
						page: 1,
						isMart: 1,
						featured: 'Có'
					}
				}).then(response => {
					console.log('✅ User Shops (isMart=1) API Response:', response.status, response.data?.list?.length || 0, 'items');
					return { type: 'userShop', data: response.data };
				}).catch(error => {
					console.log('❌ User Shops API Error:', error.message);
					return { type: 'userShop', data: null };
				})
			);

			// Restaurants
			console.log('🍽️ Setting up restaurants API call...');
			promises.push(
				apiClient.get('/services', {
					params: {
						map_lat: map && map.lat ? map.lat : null,
						map_lng: map && map.lng ? map.lng : null,
						type: 'Đồ ăn',
						featured: 'Có',
						limit: 10
					}
				}).then(response => {
					console.log('✅ Restaurants API Response:', response.status, response.data?.restaurants?.length || 0, 'items');
					return { type: 'restaurants', data: response.data?.restaurants || [] };
				}).catch(error => {
					console.log('❌ Restaurants API Error:', error.message);
					return { type: 'restaurants', data: null };
				})
			);

			console.log('⏳ Waiting for all API calls to complete...');
			// Wait for all promises to complete
			const results = await Promise.all(promises);
			console.log('🎉 All API calls completed! Results:', results.length);

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
		hotProducts,
		newProducts,
		featuredProducts,
		bestSelling,
		featuredProjects,
		slideShow,
		services,
		shop,
		userShop,
		restaurants
	} = pageData;

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
						elevation: 8,
					}
				]}
			/>

			{/* Header content */}
			<View style={[
				tw`${Platform.OS === 'ios' ? 'pt-12' : 'pt-8'} pb-3 px-4 flex-row items-center justify-between`,
				{ height: '100%' }
			]}>
				{/* Logo only */}
				<View style={tw`flex-row items-center`}>
					<Image
						source={{uri: settings && settings.app_logo}}
						style={tw`h-9 w-9 mr-2`}
						resizeMode="contain"
					/>
					<Text style={tw`text-lg font-bold text-green-600`}>SME Mart</Text>
				</View>

				{/* Action buttons */}
				<View style={tw`flex-row items-center`}>
					<TouchableOpacity
						activeOpacity={0.7}
						onPress={() => props.navigation.navigate("SearchScreen", {
							featuredProducts: featuredProducts && featuredProducts.product
						})}
						style={tw`p-2 mr-2`}
					>
						<Icon name="magnify" size={22} style={tw`text-gray-700`} />
					</TouchableOpacity>

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

	// Search bar component
	const renderSearchBar = useCallback(() => (
		<TouchableOpacity
			activeOpacity={0.9}
			style={tw`flex flex-row items-center bg-gray-100 rounded-full px-4 py-3 mx-4 my-3 shadow-sm`}
			onPress={() => props.navigation.navigate("SearchScreen", {
				featuredProducts: featuredProducts && featuredProducts.product
			})}
		>
			<Icon name="magnify" size={20} style={tw`mr-2 text-gray-500`}/>
			<Text style={tw`text-gray-500`}>{textSearchHolder}</Text>
		</TouchableOpacity>
	), [textSearchHolder, featuredProducts, props.navigation]);

	// Login section with modern design
	const renderLoginSection = useCallback(() => (
		!currentUser && (
			<View style={tw`mx-4 mb-5 overflow-hidden rounded-2xl`}>
				<LinearGradient
					colors={['#4ade80', '#16a34a']}
					start={{x: 0, y: 0}}
					end={{x: 1, y: 0}}
					style={tw`p-4 rounded-2xl`}
				>
					<View style={tw`flex-row justify-between items-center`}>
						<View style={tw`w-3/4`}>
							<Text style={tw`text-white font-bold text-lg mb-1`}>
								Chào mừng bạn!
							</Text>
							<Text style={tw`text-white text-opacity-90 mb-3`}>
								Đăng nhập để nhận nhiều ưu đãi hấp dẫn và quản lý đơn hàng dễ dàng hơn
							</Text>
							<TouchableOpacity
								onPress={() => props.navigation.navigate('Login', {
									backScreen: 'Home'
								})}
								style={tw`bg-white px-4 py-2 rounded-full flex-row items-center self-start shadow-md`}
							>
								<Text style={tw`text-green-600 font-medium`}>ĐĂNG NHẬP</Text>
								<Icon name="arrow-right" size={16} style={tw`text-green-600 ml-1`} />
							</TouchableOpacity>
						</View>
						<View style={tw`absolute -right-5 -top-5 opacity-20`}>
							<Icon name="account-circle" size={100} style={tw`text-white`} />
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
				<Text style={tw`text-gray-800 font-bold text-base uppercase`}>{title}</Text>
			</View>
			{showViewAll && (
				<TouchableOpacity
					style={tw`flex-row items-center`}
					onPress={onPress}
				>
					<Text style={tw`mr-1 text-${color}-600 font-medium`}>Xem thêm</Text>
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
			titleColor="#16a34a"
			tintColor="#16a34a"
			colors={['#16a34a']}
		/>
	), [refresh]);

	return (
		<View style={tw`flex bg-gray-50 min-h-full`}>
			<StatusBar
				barStyle="dark-content"
				backgroundColor="transparent"
				translucent={true}
			/>

			{renderHeader()}

			<Animated.ScrollView
				showsVerticalScrollIndicator={false}
				overScrollMode={'never'}
				scrollEventThrottle={16}
				removeClippedSubviews={true}
				maxToRenderPerBatch={5}
				windowSize={10}
				onScroll={Animated.event(
					[{ nativeEvent: { contentOffset: { y: scrollY } } }],
					{ useNativeDriver: false }
				)}
				contentContainerStyle={tw`pb-20`}
				refreshControl={refreshControl}
			>
				{/* Padding to accommodate fixed header */}
				<View style={tw`${Platform.OS === 'ios' ? 'pt-24' : 'pt-16'}`} />

				{loading ? (
					<HomePageLoading />
				) : (
					<>
						{renderSearchBar()}

						{/* Slideshow with rounded corners */}
						{slideShow && slideShow.items && (
							<View style={tw`mx-4 rounded-2xl overflow-hidden shadow-sm bg-white`}>
								<Slideshow
									items={JSON.parse(slideShow.items)}
									navigation={props.navigation}
								/>
							</View>
						)}

						{/* Categories */}
						<View style={tw`mt-4 bg-white pb-3 mb-4`}>
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
						</View>

						{renderLoginSection()}

						{/* New Products */}
						{newProducts && newProducts.list && newProducts.list.length > 0 && (
							<View style={tw`mb-4 bg-white rounded-xl shadow-sm overflow-hidden`}>
								<SectionHeader
									title="Sản phẩm Mới"
									icon="star"
									color="red"
									onPress={() => props.navigation.navigate("Products")}
								/>
								<FeatureProductList
									title={"Sản phẩm Mới"}
									icon={"brightness-percent"}
									iconColor={"text-red-500"}
									titleColor={"text-gray-800"}
									items={newProducts}
									navigation={props.navigation}
									type={"Sản phẩm"}
									viewAllButton={false}
								/>
							</View>
						)}

						{/* Hot Products */}
						{hotProducts && hotProducts.list && hotProducts.list.length > 0 && (
							<View style={tw`mb-4 bg-white rounded-xl shadow-sm overflow-hidden`}>
								<SectionHeader
									title="Sản phẩm Hot"
									icon="fire"
									color="red"
									onPress={() => props.navigation.navigate("Products")}
								/>
								<FeatureProductList
									title={"Sản phẩm Khuyến mại - Hot"}
									icon={"brightness-percent"}
									iconColor={"text-red-500"}
									titleColor={"text-gray-800"}
									items={hotProducts}
									navigation={props.navigation}
									type={"Sản phẩm"}
									viewAllButton={false}
								/>
							</View>
						)}

						{/* Best Selling Products */}
						{bestSelling && bestSelling.list && bestSelling.list.length > 0 && (
							<View style={tw`mb-4 bg-white rounded-xl shadow-sm overflow-hidden`}>
								<SectionHeader
									title="Sản phẩm Bán chạy"
									icon="shopping"
									color="green"
									onPress={() => props.navigation.navigate("Products")}
								/>
								<FeatureProductList
									title={"Sản phẩm bán chạy"}
									icon={"shopping"}
									iconColor={"text-green-500"}
									titleColor={"text-gray-800"}
									items={bestSelling}
									navigation={props.navigation}
									type={"Sản phẩm"}
									viewAllButton={false}
								/>
							</View>
						)}

						{/* Shops */}
						{shop && shop.list && shop.list.length > 0 && (
							<View style={tw`mb-4 bg-white rounded-xl shadow-sm overflow-hidden`}>
								<SectionHeader
									title="Siêu thị"
									icon="storefront"
									color="yellow"
									onPress={() => props.navigation.navigate("Mart")}
								/>
								<ShopList
									title={"Siêu thị"}
									icon={"storefront"}
									iconColor={"text-yellow-500"}
									titleColor={"text-gray-800"}
									items={shop}
									navigation={props.navigation}
								/>
							</View>
						)}

						{/* User Shops */}
						{userShop && userShop.list && userShop.list.length > 0 && (
							<View style={tw`mb-4 bg-white rounded-xl shadow-sm overflow-hidden`}>
								<SectionHeader
									title="Gian hàng sản phẩm"
									icon="storefront"
									color="green"
									onPress={() => props.navigation.navigate("Stores")}
								/>
								<ShopList
									title={"Gian hàng sản phẩm"}
									icon={"storefront"}
									iconColor={"text-green-600"}
									titleColor={"text-gray-800"}
									items={userShop}
									navigation={props.navigation}
								/>
							</View>
						)}

						{/* Restaurants */}
						{restaurants && restaurants.length > 0 && (
							<View style={tw`mb-4 bg-white rounded-xl shadow-sm overflow-hidden`}>
								<SectionHeader
									title="Gian hàng dịch vụ"
									icon="silverware-fork-knife"
									color="orange"
									onPress={() => props.navigation.navigate("Foods", {
										screen: "Foods",
										params: {
											slug: "food"
										},
									})}
								/>
								<Restaurants
									items={restaurants}
									navigation={props.navigation}
								/>
							</View>
						)}

						{/* New Products */}
						{newProducts && newProducts.product && newProducts.product.list && newProducts.product.list.length > 0 && (
							<View style={tw`mb-4 bg-white rounded-xl shadow-sm overflow-hidden`}>
								<SectionHeader
									title="Sản phẩm Mới"
									icon="new-box"
									color="red"
									onPress={() => props.navigation.navigate("Products")}
								/>
								<FeatureProductList
									title={"Sản phẩm Mới"}
									icon={"check-decagram"}
									iconColor={"text-blue-500"}
									titleColor={"text-gray-800"}
									items={newProducts.product}
									navigation={props.navigation}
									type={"Sản phẩm"}
									viewAllButton={false}
								/>
							</View>
						)}

						{/* Home Products */}
						<View style={tw`mb-4 bg-white rounded-xl shadow-sm overflow-hidden`}>
							<HomeProducts
								settings={settings && settings}
								navigation={props.navigation}
								categories={categories && categories}
							/>
						</View>

						{/* Featured Projects */}
						{featuredProjects && featuredProjects.list && featuredProjects.list.length > 0 && (
							<View style={tw`mb-4 bg-white rounded-xl shadow-sm overflow-hidden`}>
								<SectionHeader
									title="Dự án nổi bật"
									icon="briefcase"
									color="blue"
									onPress={() => props.navigation.navigate("Projects")}
								/>
								<FeatureProductList
									title={"Dự án nổi bật"}
									icon={"check-decagram"}
									iconColor={"text-blue-500"}
									titleColor={"text-gray-800"}
									items={featuredProjects}
									navigation={props.navigation}
									type={"Dự án"}
									viewAllButton={false}
								/>
							</View>
						)}

						{/* News Section */}
						<View style={tw`mb-4 bg-white rounded-xl shadow-sm overflow-hidden`}>
							<News
								horizontal={true}
								navigation={props.navigation}
							/>
						</View>
					</>
				)}
			</Animated.ScrollView>
		</View>
	);
};

export default HomeScreen;
