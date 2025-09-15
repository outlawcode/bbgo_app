import React, { useEffect, useState } from "react";
import {
	Image,
	Platform,
	RefreshControl,
	ScrollView,
	Share, StatusBar,
	Text,
	TextInput,
	TouchableOpacity,
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
import ProjectItem from "app/components/ProjectItem";
import InfoBox from "app/components/InfoBox";

function ProjectDetailScreen(props) {
	const dispatch = useDispatch()
	const [result, setResult] = useState();
	const [quantity, setQuantity] = useState(1);
	const [refresh, setRefresh] = useState(false);
	const [variableChoosen, setVariableChoosen] = useState(null)
	const [productName, setProductName] = useState('')
	const slug = props.route.params.slug;
	const settings = useSelector(state => state.SettingsReducer.options)
	const currentUser = useSelector(state => state.memberAuth.user);
	const cart = useSelector(state => state.CartReducer);
	const [showPrices, setShowPrices] = useState(false);
	const [error, setError] = useState(false);
	const [priceId, setPriceId] = useState(null);

	useEffect(() => {
		async function getProducts() {
			apiClient.get(apiConfig.BASE_URL+'/product/'+slug)
				.then(function (response) {
				if (response.status === 200) {
					setRefresh(false)
					setResult(response.data)
					setQuantity(1)
					setProductName(response.data && response.data.product && response.data.product.name)
				}
			}).catch(function(error){
				setRefresh(false)
				console.log(error);
			})
		}
		_scrollView.current?.scrollTo({y: 0, animated: true})
		getProducts();
	},[slug, refresh])

	let description;
	let gallery = [];
	let listIRates = []
	let maxIRate = 0;

	if (result) {
		gallery = JSON.parse(result.product.gallery)
		const prices = result.product.prices
		listIRates = prices.map((el) => Number(el.interestedRate));
		listIRates.sort()
		maxIRate = listIRates[listIRates.length-1];

		description = {
			html: `<head>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        p, h1, h2, h3, h4, h5, h6, ul, li, a, strong, italic {
                       font-size: 16px;
                        }
                        li {
                        box-sizing: unset !important;;
                        line-height: unset !important;
                        }
                        img { display: block; max-width: 100%; height: auto; }
                    </style>
                    
                    </head>
                    <body>${result.product.description}</body>`
		}
	}

	const _scrollView = React.useRef(null);

	function handleShare() {
		let  text = productName ? productName + '\n' : '';
		if(Platform.OS === 'android')
			text = text.concat(`${settings && settings.mk_website_url}/project/${slug}${currentUser ? '?ref='+currentUser.refId : ''}`)
		else
			text = text.concat(`${settings && settings.mk_website_url}/project/${slug}${currentUser ? '?ref='+currentUser.refId : ''}`)

		Share.share({
			subject: 'Chia sẻ',
			title: 'Chia sẻ',
			message: text,
			url: text,

		}, {
			// Android only:
			dialogTitle: 'Chia sẻ',
			// iOS only:
			excludedActivityTypes: []
		})
	}

	async function handleCheckout() {
		const token = await AsyncStorage.getItem('sme_user_token');
		await axios({
			method: 'get',
			url: `${apiConfig.BASE_URL}/member/transactions/checkiprice`,
			params: {
				priceId,
			},
			headers: { Authorization: `Bearer ${token}` }
		}).then(function (response) {
			if (response.status === 200) {
				const checkoutParams = {
					priceId,
					price: response.data,
				}
				props.navigation.navigate('InvestmentPaymentMethod', checkoutParams)
			}
		}).catch(function(error) {
			console.log(error);
			showMessage({
				message: error.response.data.message,
				type: 'danger',
				icon: 'info',
				duration: 3000,
			});
		})
	}

	return (
		!result ? <ProductDetailLoading /> :
		<View style={tw`flex bg-gray-100 min-h-full content-between`}>
			<StatusBar barStyle={"light-content"} backgroundColor={'#2ea65d'} />
			<View style={[tw`${Platform.OS === 'android' ? 'pt-4' : 'pt-14'} pb-3`, {backgroundColor: '#2ea65d'}]}>
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
						<TouchableOpacity
							activeOpacity={1}
							onPress={() => handleShare()}
						>
							<Icon name="share-variant"
							      size={23}
							      style={tw`text-white mr-5`}
							/>
						</TouchableOpacity>
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
					{gallery && gallery.length > 0 ?
						<View>
							<ProductGallery gallery={gallery}/>
						</View>
						:
						<View>
							<Image
								source={{uri: result.product.featureImage}}
								style={tw`h-96 w-full`}
							/>
						</View>
					}

					<View style={tw`bg-white mb-3 p-3`}>
						<Text  style={tw`font-bold text-xl mb-2`} numberOfLines={2} ellipsizeMode={"tail"}>
							{result && result.product.name}
						</Text>
						{result.product && result.product.prices.length > 0 &&
							<>
								<View
									style={tw`py-2 flex items-center justify-between flex-row border-b border-gray-200`}>
									<Text>Gói đầu tư</Text>
									<View style={tw`flex items-center flex-row`}>
										<Text>{result && result.product && result.product.prices[0] && formatVND(result.product.prices[0].price)}</Text>
										<Text>-</Text>
										<Text>{result && result.product && result.product.prices[0] && formatVND(result.product.prices[result.product.prices.length - 1].price)}</Text>
									</View>
								</View>
								<View
									style={tw`py-2 flex items-center justify-between flex-row border-b border-gray-200`}>
									<Text>Lợi nhuận (kỳ vọng)</Text>
									<View style={tw`flex items-center flex-row`}>
										<Text>{maxIRate}%</Text>
									</View>
								</View>
								<View style={tw`py-2 flex items-center justify-between flex-row`}>
									<Text>Kỳ hạn</Text>
									<View style={tw`flex items-center flex-row`}>
										<Text>{result && result.product && result.product.prices[0] && result.product.prices[result.product.prices.length - 1].monthQty} tháng</Text>
									</View>
								</View>
							</>
						}
					</View>
					{result.product && result.product.prices.length > 0 &&
						<View style={tw`bg-white mb-3 p-3`}>
							<Text style={tw`font-bold text-gray-600 mb-5`}>Xin mời chọn gói đầu tư</Text>
							{result.product && result.product.prices.map((el, index) => (
								<TouchableOpacity
									onPress={() => setPriceId(el.id)}
									style={tw`flex items-center justify-between flex-row mb-3 bg-blue-50 rounded p-3`}
								>
									<View>
										<Text style={tw`font-medium text-lg`}>{el.monthQty} tháng</Text>
										<Text>{formatVND(el.price)}</Text>
										<Text>Lợi nhuận: {el.interestedRate}%</Text>
									</View>
									<View>
										<Icon
											name={el.id === priceId ? 'check-circle' : 'checkbox-blank-circle-outline'}
											size={32}
											style={tw`${el.id === priceId ? 'text-green-500' : 'text-blue-50'}`} />
									</View>
								</TouchableOpacity>
							))}
						</View>
					}
					{/*<View style={tw`bg-white mb-3 px-3 py-3 flex items-center justify-between flex-row`}>
						<View style={tw`flex-1 bg-red-500 mr-2 p-3 rounded relative`}>
							<View>
								<Text style={tw`text-white text-xs`}>Tặng</Text>
								<Text style={tw`text-white font-medium`}>+{result.product.rewardPoint} Điểm</Text>
							</View>
							<View style={tw`absolute top-2 right-2`}>
								<Icon name={"cart"} size={40} style={tw`opacity-20 text-white`}/>
							</View>
							<View style={tw`absolute top-5 -right-2 w-4 h-4 bg-white rounded-full`} />
						</View>
						<View style={tw`flex-1 bg-green-600 ml-2 p-3 rounded relative`}>
							<View>
								<Text style={tw`text-white text-xs`}>Chiết khấu</Text>
								<Text style={tw`text-white font-medium`}>{result.product.chietkhauPercent}%</Text>
							</View>
							<View style={tw`absolute top-2 right-2`}>
								<Icon name={"share-variant"} size={40} style={tw`opacity-20 text-white`}/>
							</View>
							<View style={tw`absolute top-5 -right-2 w-4 h-4 bg-white rounded-full`} />
						</View>
					</View>*/}
					<View style={tw`bg-white mb-3`}>
						<View style={tw`px-3 pt-3`}>
							<Text  style={tw`uppercase text-gray-600 font-medium`}>Thông tin dự án</Text>
						</View>
						<View style={tw`px-3 pt-3`}>
							<Text style={tw`font-medium text-base text-gray-500`}>Tổng đầu tư: <Text style={tw`text-green-600 font-bold`}>{result && result.product.totalInvestment}</Text></Text>
						</View>
						{/*<View style={tw`p-3 flex items-center justify-between flex-row`}>
							<View style={tw`relative bg-green-600 rounded w-2/5 px-3 py-1`}>
								<Text style={tw`text-white`}>Tặng:</Text>
								<Text style={tw`text-white text-lg font-bold`}>{result.product.rewardPoint} điểm</Text>
								<Icon name={"gift"} style={tw`absolute right-2 bottom-2 text-white opacity-50`} size={22} />
							</View>
							<View style={tw`relative bg-red-500 rounded w-2/5 px-3 py-1`}>
								<Text style={tw`text-white`}>Chiết khấu:</Text>
								<Text style={tw`text-white text-lg font-bold`}>{result.product.chietkhauPercent}%</Text>
								<Icon name={"share-variant"} style={tw`absolute right-2 bottom-2 text-white opacity-50`} size={22}/>
							</View>
						</View>*/}

						{result && result.product && result.product.content ?
							<InfoBox slug={result && result.product.slug} content={result && result.product.content} title="Thông tin dự án" navigation={props.navigation} backScreen={'ProductDetail'}/>
							:
							<View style={tw`mt-5 mb-5`}>
								<Text  style={tw`text-center`}>Đang cập nhật nội dung...</Text>
							</View>
						}
					</View>
					{result && result.relatedProducts && result.relatedProducts.length > 0 &&
						<View style={tw`bg-white mb-3`}>
							<View style={tw`px-3 pt-3`}>
								<Text  style={tw`uppercase text-gray-600 font-medium`}>Có thể bạn quan tâm</Text>
							</View>

							<FlatGrid
								itemDimension={150}
								data={result.relatedProducts}
								additionalRowStyle={tw`flex items-start`}
								spacing={10}
								renderItem={({item}) => (
									<ProjectItem item={item} navigation={props.navigation}/>
								)} />
						</View>
					}
				</View>
			</ScrollView>
			{currentUser ?
				<>
					{priceId &&
						<View style={tw`absolute bottom-20 android:bottom-14 bg-white w-full pb-4 pt-2 shadow-lg px-3`}>
							<View style={tw`flex flex-col items-center justify-between`}>
								<TouchableOpacity
									style={tw`${!priceId ? 'bg-gray-400' : 'bg-green-600'} px-10 py-3 rounded flex flex-row items-center`}
									onPress={() => handleCheckout()}
									disabled={!priceId}
								>
									<Text style={tw`text-white font-bold uppercase`}>Bước tiếp theo</Text>
									<Icon name={"chevron-right"} style={tw`text-white ml-1`} size={18} />
								</TouchableOpacity>
							</View>
						</View>
					}
				</>
				:
				<>
					<View style={tw`absolute bottom-20 android:bottom-14 bg-white w-full py-3 shadow-lg px-3`}>
						<TouchableOpacity
							onPress={() => props.navigation.navigate('Login')}
							style={tw`bg-orange-500 px-5 py-3 rounded flex items-center`}
						>
							<Text  style={tw`text-white uppercase font-medium`}>Đăng nhập để đầu tư</Text>
						</TouchableOpacity>
					</View>
				</>
			}



		</View>
	);
}

export default ProjectDetailScreen;
