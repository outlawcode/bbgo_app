import React, { useEffect, useState, useRef } from "react";
import {
	Image,
	Platform,
	RefreshControl,
	ScrollView,
	Share,
	StatusBar,
	Text,
	TouchableOpacity,
	useWindowDimensions,
	View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import { formatVND, displayNumber } from "app/utils/helper";
import ProductItem from "app/components/ProductItem";
import { FlatGrid } from "react-native-super-grid";
import InputSpinner from "react-native-input-spinner";
import { addToCart } from "app/screens/Cart/action";
import { showMessage } from "react-native-flash-message";
import CartIcon from "app/screens/Cart/components/cartIcon";
import ProductDetailLoading from "app/screens/ProductDetail/components/ProductDetailLoading";
import AsyncStorage from "@react-native-community/async-storage";
import ProductGallery from "app/screens/ProductDetail/components/ProductGallery";
import RenderHtml from "react-native-render-html";
import ShopSmallItem from "app/components/ShopSmallItem";
import InfoBox from "app/components/InfoBox";
import apiConfig from "app/config/api-config";
import ShopInfoBox from "app/screens/ProductDetail/components/ShopInfoBox";

function ProductDetail(props) {
	const { width } = useWindowDimensions();
	const dispatch = useDispatch();
	const { slug } = props.route.params;
	const shopId = props.route.params.shopId || props.route.params?.query?.shopId;
	const [result, setResult] = useState();
	const [priceId, setPriceId] = useState(null);
	const [error, setError] = useState(false);
	const [quantity, setQuantity] = useState(1);
	const [refresh, setRefresh] = useState(false);
	const [productName, setProductName] = useState('');

	const settings = useSelector(state => state.SettingsReducer.options);
	const currentUser = useSelector(state => state.memberAuth.user);
	const cart = useSelector(state => state.CartReducer);

	const _scrollView = useRef(null);

	useEffect(() => {
		if (quantity === 0 || quantity === null) {
			setQuantity(1);
		}
	}, [quantity]);

	useEffect(() => {
		async function getProduct() {
			if (!slug) {
				console.log('No slug provided');
				showMessage({
					message: 'Không tìm thấy sản phẩm!',
					type: 'danger',
					icon: 'danger',
					duration: 3000,
				});
				props.navigation.goBack();
				return;
			}

			if (!shopId) {
				console.log('No shopId provided');
				showMessage({
					message: 'Không tìm thấy thông tin cửa hàng!',
					type: 'danger',
					icon: 'danger',
					duration: 3000,
				});
				props.navigation.goBack();
				return;
			}

			try {
				console.log('Fetching product with slug:', slug, 'shopId:', shopId);
				const response = await axios({
					method: 'get',
					url: `${apiConfig.BASE_URL}/shop-product/${shopId}/${slug}`,
				});

				if (response.status === 200) {
					console.log('Product found:', response.data);
					setResult(response.data);
					setRefresh(false);
					setQuantity(1);
					setError(false);
					setProductName(response.data && response.data.product && response.data.product.name);
				}
			} catch (error) {
				console.log('Error fetching product:', error.response?.data || error.message);
				setError(true);
				setRefresh(false);
				showMessage({
					message: 'Không tìm thấy sản phẩm!',
					type: 'danger',
					icon: 'danger',
					duration: 3000,
				});
				setTimeout(() => {
					props.navigation.goBack();
				}, 2000);
			}
		}

		_scrollView.current?.scrollTo({y: 0, animated: true});
		getProduct();
	}, [slug, shopId, refresh]);

	useEffect(() => {
		if (result && result.prices && result.prices.length > 0) {
			setPriceId(result.prices[0].id);
		}
	}, [slug, dispatch, result, refresh]);

	let gallery = [];
	let discountPercent = 0;
	let normalPrice = 0;
	let salePrice = 0;
	let instock = 0;
	let tagsStyles = {};
	let source = {};

	if (result && result.product) {
		gallery = JSON.parse(result.product.gallery);

		if (result.prices && result.prices.length > 0) {
			if (priceId) {
				result.prices.map((item) => {
					if (item.id === priceId) {
						discountPercent = item.totalDiscountPercent;
						normalPrice = item.price;
						salePrice = item.salePrice;
						instock = item.inStock;
					}
				});
			}
		}

		source = result.product.description ? {
			html: `<head>
        <link rel="preconnect" href="https://fonts.gstatic.com">
        <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body {
                color: grey;
                font-size: 16px;
            }
            p, h1, h2, h3, h4, h5, h6, ul, li, a, strong, italic {
                color: grey;
                font-size: 14px;
            }
            li {
                box-sizing: unset !important;
                line-height: unset !important;
            }
            img { display: block; max-width: 100%; height: auto; }
            p {
                color: grey;
                margin-bottom: 0px !important;
            }
        </style>
        </head>
        <body>${result.product.description}</body>`
		} : {};

		tagsStyles = {
			body: {
				color: '#292929',
				whiteSpace: 'normal',
				fontSize: 14,
			},
			a: {
				color: 'blue'
			},
			img: {
				marginTop: 10,
				marginBottom: 20,
				width: '100%'
			},
			ul: {
				marginTop: 50
			}
		};
	}

	async function handleAddToCart(Item) {
		if (cart) {
			const index = cart.items.findIndex(item => Number(item.productPrice) === Number(Item.productPrice));
			if (index !== -1) {
				let currentItem = cart.items[index];
				if ((Number(currentItem.quantity) + Number(Item.quantity)) > Number(Item.inStock)) {
					showMessage({
						message: `Giỏ hàng của bạn đã có đủ số lượng sản phẩm trong kho - ${currentItem.quantity}`,
						type: 'danger',
						icon: 'info',
						duration: 3000,
					});
				} else {
					dispatch(addToCart(Item));
					showMessage({
						message: `Sản phẩm ${result.product.name} đã được thêm vào giỏ hàng`,
						type: 'success',
						icon: 'success',
						duration: 3000,
					});
				}
			} else {
				dispatch(addToCart(Item));
				showMessage({
					message: `Sản phẩm ${result.product.name} đã được thêm vào giỏ hàng`,
					type: 'success',
					icon: 'success',
					duration: 3000,
				});
			}
		} else {
			dispatch(addToCart(Item));
			showMessage({
				message: `Sản phẩm ${result.product.name} đã được thêm vào giỏ hàng`,
				type: 'success',
				icon: 'success',
				duration: 3000,
			});
		}
	}

	async function handleBuyNow(Item) {
		const token = await AsyncStorage.getItem('sme_user_token');
		try {
			const response = await axios({
				method: 'get',
				url: `${apiConfig.BASE_URL}/member/order/calcPrice`,
				params: {
					productPrice: Item.productPrice,
					quantity: Item.quantity,
					shopId: Item.shopId
				},
				headers: { Authorization: `Bearer ${token}` }
			});

			if (response.status === 200) {
				const res = await axios({
					method: 'post',
					url: `${apiConfig.BASE_URL}/member/order/create-online`,
					data: {
						items: JSON.stringify([response.data]),
						shopId: Number(shopId)
					},
					headers: { Authorization: `Bearer ${token}` }
				});

				if (res.status === 201) {
					props.navigation.navigate('CheckoutScreen', {
						result: [res.data]
					});
				}
			}
		} catch (error) {
			console.log(error);
			showMessage({
				message: error.response?.data?.message || 'Có lỗi xảy ra',
				type: 'danger',
				icon: 'danger',
				duration: 3000,
			});
		}
	}

	function handleShare() {
		let text = productName ? productName + '\n' : '';
		text = text.concat(`${settings && settings.mk_website_url}/product/${shopId}/${slug}${currentUser ? '?ref=' + currentUser.refId : ''}`);

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
		});
	}

	if (error) {
		return (
			<View style={tw`flex items-center justify-center h-full`}>
				<Text style={tw`text-red-500 text-xl`}>Không tìm thấy sản phẩm</Text>
			</View>
		);
	}

	if (!result) {
		return <ProductDetailLoading />;
	}

	return (
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
					{gallery && gallery.length > 0 ? (
						<View>
							<ProductGallery gallery={gallery} />
						</View>
					) : (
						<View>
							<Image
								source={{ uri: result.product.featureImage }}
								style={tw`h-96 w-full`}
							/>
						</View>
					)}

					<View style={tw`bg-white mb-3 p-3`}>
						<Text style={tw`font-bold text-xl`} numberOfLines={2} ellipsizeMode={"tail"}>
							{result.product.name}
						</Text>
						<View style={tw`flex flex-row items-center justify-between mt-2`}>
							<View>
								{discountPercent > 0 ? (
									<View>
										<Text style={tw`text-gray-500 line-through`}>{formatVND(normalPrice)}</Text>
										<Text style={tw`text-red-600 font-bold text-lg`}>{formatVND(salePrice)}</Text>
									</View>
								) : (
									<Text style={tw`text-red-600 font-bold text-lg`}>{formatVND(salePrice)}</Text>
								)}
							</View>
							<View>
								<Text>Kho: {displayNumber(instock)} </Text>
							</View>
						</View>

						{result.product.description && result.product.description.trim() !== "" && (
							<View style={tw`my-2`}>
								<RenderHtml
									source={source}
									width={width}
									tagsStyles={tagsStyles}
									allowedStyles={[]}
								/>
							</View>
						)}
					</View>

					{result && result.shop && (
						<ShopInfoBox
							navigation={props.navigation}
							shop={result.shop}
						/>
					)}

					{result.prices && result.prices.length > 1 && (
						<View style={tw`bg-white mb-3 p-3`}>
							<View style={tw`flex flex-row items-center flex-wrap`}>
								{result.prices.map((item) => (
									<TouchableOpacity
										key={item.id}
										disabled={Number(item.inStock) <= 0}
										onPress={() => setPriceId(item.id)}
										style={tw`px-4 py-2 rounded border border-gray-200 mr-3 my-1 ${priceId === item.id && 'bg-green-600'} ${Number(item.inStock) <= 0 && 'bg-gray-100'}`}
										activeOpacity={1}
									>
										<Text>
											{Number(item.inStock) <= 0 && "\u2715 "} {/* Use a Unicode character instead */}
											<Text style={tw`${priceId === item.id && 'text-white'} ${Number(item.inStock) <= 0 && 'text-gray-400'}`}>
												{item.variableName}
											</Text>
										</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>
					)}

					{instock > 0 ? (
						<View style={tw`bg-white mb-3 p-3 flex flex-row items-center justify-between`}>
							<View>
								<Text style={tw`font-medium`}>
									Chọn số lượng
								</Text>
								<Text style={tw`italic text-xs`}>Kho: {displayNumber(instock)}</Text>
							</View>

							<InputSpinner
								max={instock}
								min={1}
								step={1}
								height={40}
								width={140}
								style={tw`shadow-none border border-gray-200`}
								skin={"square"}
								colorMax={"#f04048"}
								colorMin={"#cbcbcb"}
								value={Number(quantity)}
								onChange={(num) => {
									setQuantity(num);
								}}
							/>
						</View>
					) : (
						<View style={tw`bg-red-50 border border-red-200 mb-3 p-3 flex flex-row items-center`}>
							<Icon name={"information"} style={tw`text-red-600 mr-2`} size={16} />
							<Text style={tw`text-red-500`}>Sản phẩm cuối cùng đã được bán hết. Vui lòng xem sản phẩm khác!</Text>
						</View>
					)}

					<View style={tw`bg-white mb-3`}>
						<View style={tw`px-3 pt-3`}>
							<Text style={tw`uppercase text-gray-600 font-medium`}>Thông tin sản phẩm</Text>
						</View>
						{result.product.content ? (
							<InfoBox
								slug={result.product.slug}
								shopId={shopId}
								content={result.product.content}
								title="Thông tin sản phẩm"
								navigation={props.navigation}
								backScreen={'ProductDetail'}
							/>
						) : (
							<View style={tw`mt-5 mb-5`}>
								<Text style={tw`text-center`}>Đang cập nhật nội dung...</Text>
							</View>
						)}
					</View>

					{result.relatedProducts && result.relatedProducts.length > 0 && (
						<View style={tw`bg-white mb-3`}>
							<View style={tw`px-3 pt-3`}>
								<Text style={tw`uppercase text-gray-600 font-medium`}>Sản phẩm liên quan</Text>
							</View>

							<FlatGrid
								itemDimension={150}
								data={result.relatedProducts}
								additionalRowStyle={tw`flex items-start`}
								spacing={10}
								renderItem={({item}) => (
									<ProductItem item={item} navigation={props.navigation}/>
								)}
							/>
						</View>
					)}
				</View>
			</ScrollView>

			{currentUser ? (
				<>
					{instock > 0 && (
						<View style={tw`absolute bottom-22 android:bottom-14 bg-white w-full pb-4 pt-2 shadow-lg px-3`}>
							<View style={tw`flex flex-row items-center justify-between`}>
								<TouchableOpacity
									style={tw`bg-red-500 px-5 py-3 rounded flex flex-row items-center`}
									onPress={() => handleAddToCart({
										productPrice: priceId,
										quantity,
										inStock: Number(instock),
										productId: result.product.id,
										shopId: result.shop && result.shop.id
									})}
									disabled={instock <= 0}
								>
									<Icon name={"cart-plus"} style={tw`text-white mr-1`} size={18} />
									<Text style={tw`text-white font-bold uppercase`}>Thêm vào giỏ</Text>
								</TouchableOpacity>

								<TouchableOpacity
									style={tw`bg-yellow-500 px-5 py-3 rounded flex items-center flex-row`}
									onPress={() => handleBuyNow({
										productPrice: priceId,
										quantity,
										productId: result.product.id,
										inStock: Number(instock),
										shopId: result.shop && result.shop.id
									})}
									disabled={instock <= 0}
								>
									<Text style={tw`text-white font-bold uppercase`}>Mua ngay</Text>
									<Icon name={"arrow-right"} style={tw`text-white ml-1`} size={18} />
								</TouchableOpacity>
							</View>
						</View>
					)}
				</>
			) : (
				<View style={tw`absolute bottom-20 android:bottom-14 bg-white w-full py-3 shadow-lg px-3`}>
					<TouchableOpacity
						onPress={() => props.navigation.navigate('Login', {
							return: `/product/${shopId}/${result.product.slug}`
						})}
						style={tw`bg-orange-500 px-5 py-3 rounded flex items-center`}
					>
						<Text style={tw`text-white uppercase font-medium`}>Đăng nhập để mua hàng</Text>
					</TouchableOpacity>
				</View>
			)}
		</View>
	);
}

export default ProductDetail;
