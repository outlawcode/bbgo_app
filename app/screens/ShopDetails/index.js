import React, { useEffect, useState } from "react";
import {
	Image, ImageBackground,
	Platform,
	RefreshControl,
	ScrollView,
	Share, StatusBar,
	Text,
	TextInput,
	TouchableOpacity, useWindowDimensions,
	View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { apiClient } from "app/services/client";
import apiConfig from "app/config/api-config";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import Slideshow from "app/screens/Home/components/Slideshow";
import ProductGallery from "app/screens/ProductDetail/components/ProductGallery";
import { formatVND } from "app/utils/helper";
import ProductItem from "app/components/ProductItem";
import { FlatGrid } from "react-native-super-grid";
import {WebView} from 'react-native-webview';
import InfoModalContent from "app/components/ModalContent";
import InputSpinner from "react-native-input-spinner";
import {Col, Grid, Row} from 'react-native-easy-grid';
import NumericInput from 'react-native-numeric-input'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { addToCart } from "app/screens/Cart/action";
import { showMessage } from "react-native-flash-message";
import CartIcon from "app/screens/Cart/components/cartIcon";
import ProductDetailLoading from "app/screens/ProductDetail/components/ProductDetailLoading";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import InfoBox from "app/components/InfoBox";
import RenderHtml from "react-native-render-html";
import ShopSmallItem from "app/components/ShopSmallItem";
import ProjectItem from "app/components/ProjectItem";

function ShopDetailScreen(props) {
	const { width } = useWindowDimensions();
	const dispatch = useDispatch()
	const [result, setResult] = useState();
	const [query, setQuery] = useState();
	const [refresh, setRefresh] = useState(false);
	const slug = props.route.params.name;
	const settings = useSelector(state => state.SettingsReducer.options)
	const currentUser = useSelector(state => state.memberAuth.user);
	const [catId, setCatId] = useState('ALL')

	useEffect(() => {
		async function getProducts() {
			apiClient.get(apiConfig.BASE_URL+'/shop-product', {
				params: {
					shopId: slug,
					query,
					category: catId === 'ALL' ? 'ALL' : [catId],
					limit: 500000000,
					page: 1
				}
			})
				.then(function (response) {
					if (response.status === 200) {
						setRefresh(false)
						setResult(response.data)
					}
				}).catch(function(error){
				setRefresh(false)
				console.log(error);
			})
		}
		_scrollView.current?.scrollTo({y: 0, animated: true})
		getProducts();
	},[slug, refresh, query])

	const _scrollView = React.useRef(null);

	console.log(result);

	return (
		!result ? <ProductDetailLoading /> :
			<View style={tw`flex bg-gray-100 min-h-full content-between`}>
				<StatusBar barStyle={"light-content"} backgroundColor={'#ff0021'} />
				<View style={[tw`${Platform.OS === 'android' ? 'pt-4' : 'pt-14'} pb-3`, {backgroundColor: '#ff0021'}]}>
					<View style={tw`flex flex-row items-center justify-between`}>
						<TouchableOpacity
							activeOpacity={1}
							onPress={() => props.navigation.goBack()}>
							<Icon name="chevron-left"
							      size={28}
							      style={tw`text-white ml-3`}
							/>
						</TouchableOpacity>
						<View style={tw`flex flex-row items-center mr-3`}>
							<CartIcon navigation={props.navigation} />
							<TouchableOpacity
								activeOpacity={1}
								onPress={() => props.navigation.openDrawer()}
							>
								<Icon name={"menu"} size={30} style={tw`text-white ml-3`} />
							</TouchableOpacity>
						</View>
					</View>
				</View>
				<ScrollView
					ref={_scrollView}
					showsVerticalScrollIndicator={false}
					overScrollMode={'never'}
					scrollEventThrottle={16}
					refreshControl={
						<RefreshControl
							refreshing={refresh}
							onRefresh={() => setRefresh(true)}
							title="đang tải"
							titleColor="#000"
							tintColor="#000"
						/>
					}
				>
					<View style={tw`pb-40`}>
						<View style={tw`mb-5`}>
							<View
								style={tw`relative`}
							>
								{result.shop.coverImage ?
									<Image source={{uri: result.shop.coverImage}} style={[tw`w-full h-32`, { resizeMode: 'cover' }]} />
									:
									<Image
										source={require('../../assets/images/default-shop-cover.png')}
										resizeMode='stretch'
										style={[tw`w-full h-32`, { resizeMode: 'cover' }]}
									/>
								}
								<View
									style={tw`w-full h-32 bg-gray-800 absolute top-0 left-0 bg-opacity-90`}
								/>
								<View style={tw`absolute top-2 left-5`}>
									<View style={tw`flex flex-row`}>
										{result.shop.avatar ?
											<Image
												source={{uri: result.shop.avatar}}
												style={[tw`w-14 h-14 rounded-full border-2 border-white`, { resizeMode: 'cover' }]}
											/>
											:
											<Image
												source={require('../../assets/images/shop-default-avatar.png')}
												resizeMode='stretch'
												style={[tw`w-16 h-16 rounded-full border-2 border-white`, { resizeMode: 'cover' }]}
											/>
										}
										<View style={tw`ml-3 flex w-4/5`}>
											<Text
												style={tw`font-medium text-white text-base`}
												numberOfLines={1} ellipsizeMode='tail'
											>
												{result.shop.name}
											</Text>
											<Text
												style={tw`font-medium text-xs text-white`}
												numberOfLines={2} ellipsizeMode='tail'
											>
												{result.shop.address}
											</Text>
											<Text
												style={tw`font-medium text-xs text-white`}
												numberOfLines={2} ellipsizeMode='tail'
											>
												{result.shop.phone}
											</Text>
										</View>
									</View>
								</View>

								<View style={tw`absolute bottom-3 left-5`}>
									<View style={tw`flex-row items-center bg-gray-200 rounded w-full h-8`}>
										<Icon name="magnify" size={18} style={tw`text-gray-500 ml-2`} />
										<TextInput
											style={tw`ml-5 w-4/5 android:h-20`}
											value={query}
											onChangeText={event => setQuery(event)}
											placeholder="Nhập tên sản phẩm..."
											returnKeyType={"done"}
										/>
									</View>
								</View>
							</View>
						</View>
						{result && result.product && result.product.count > 0 ?
							<FlatGrid
								itemDimension={150}
								data={result && result.product && result.product.list}
								additionalRowStyle={tw`flex items-start`}
								spacing={10}
								renderItem={({ item, index }) => (
									item.type === 'Dự án' ?
										<ProjectItem item={item} navigation={props.navigation} key={index} /> :
										<ProductItem item={item} navigation={props.navigation} key={index} />
								)} />
							:
							<View style={tw`flex items-center content-center`}>
								<Icon name={"package-variant"} size={52} style={tw`text-gray-300`} />
								<Text style={tw`text-gray-400`}>Chưa có sản phẩm</Text><Text style={tw`text-gray-500`}>trong
								gian hàng này!</Text>
							</View>
						}
					</View>
				</ScrollView>
			</View>
	);
}

export default ShopDetailScreen;
