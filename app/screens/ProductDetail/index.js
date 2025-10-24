import React, {useEffect, useRef, useState} from "react";
import {
	Image,
	Platform,
	RefreshControl,
	ScrollView,
	Share,
	StatusBar,
	Text,
	TextInput,
	TouchableOpacity,
	useWindowDimensions,
	View,
	Linking,
	Modal,
	Animated,
	ActivityIndicator
} from "react-native";
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import {displayNumber, formatVND} from "app/utils/helper";
import ProductItem from "app/components/ProductItem";
import {FlatGrid} from "react-native-super-grid";
import InputSpinner from "react-native-input-spinner";
import {addToCart} from "app/screens/Cart/action";
import {showMessage} from "react-native-flash-message";
import CartIcon from "app/screens/Cart/components/cartIcon";
import ProductDetailLoading from "app/screens/ProductDetail/components/ProductDetailLoading";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProductGallery from "app/screens/ProductDetail/components/ProductGallery";
import RenderHtml from "react-native-render-html";
import apiConfig from "app/config/api-config";
import ClaimPointScreen from "app/screens/PointWallet/ClaimPointScreen";
import BuyNowScreen from "app/screens/CheckOut/BuyNowScreen";

function ProductDetail(props) {
	const { width } = useWindowDimensions();
	const dispatch = useDispatch();
	const { slug } = props.route.params;
	const [result, setResult] = useState();
	const [priceId, setPriceId] = useState(null);
	const [error, setError] = useState(false);
	const [quantity, setQuantity] = useState(1);
	const [refresh, setRefresh] = useState(false);
	const [productName, setProductName] = useState('');
	const [tab, setTab] = useState(1);
	const [expandedTab, setExpandedTab] = useState({1:false,2:false,3:false,4:false});
	const [reviewContent, setReviewContent] = useState('');
const [reviewRating, setReviewRating] = useState(5);
const [reviewName, setReviewName] = useState('');
const [reviewPhone, setReviewPhone] = useState('');
	const [reviewEmail, setReviewEmail] = useState('');
	const [showReviewForm, setShowReviewForm] = useState(false);
	const [showQuantityModal, setShowQuantityModal] = useState(false);
	const [modalQuantity, setModalQuantity] = useState(1);
	const [modalAction, setModalAction] = useState(''); // 'addToCart' or 'buyNow'
	const slideAnim = useRef(new Animated.Value(300)).current;

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

			try {
				const response = await axios({
					method: 'get',
					url: `${apiConfig.BASE_URL}/product/${slug}`,
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
	}, [slug, refresh]);

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
let nutritionSource = {};
let targetUsersSource = {};
let usageSource = {};
let contentSource = {};

	if (result && result.product) {
		gallery = JSON.parse(result.product.gallery);
		discountPercent = result.product.discountPercent;
		normalPrice = result.product.price;
		salePrice = Number(result.product.price) * (100 - Number(result.product.discountPercent)) / 100;
		instock = result.product.availableStock;

		source = result.product.description ? {
			html: `<head>
        <link rel="preconnect" href="https://fonts.gstatic.com">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body {
                color: #b1b1b1;
                font-size: 12px;
            }
            p, h1, h2, h3, h4, h5, h6, ul, li, a, strong, italic {
                color: #b1b1b1;
                font-size: 12px;
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
	contentSource = result.product.content ? { html: result.product.content } : {};
	nutritionSource = result.product.nutritionInfo ? { html: result.product.nutritionInfo } : {};
	targetUsersSource = result.product.targetUsers ? { html: result.product.targetUsers } : {};
	usageSource = result.product.usageInstructions ? { html: result.product.usageInstructions } : {};

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

	// Show quantity modal
	const showQuantitySelector = (action) => {
		setModalAction(action);
		setModalQuantity(quantity);
		setShowQuantityModal(true);

		// Animate modal slide up
		Animated.timing(slideAnim, {
			toValue: 0,
			duration: 300,
			useNativeDriver: true,
		}).start();
	};

	// Hide quantity modal
	const hideQuantityModal = () => {
		Animated.timing(slideAnim, {
			toValue: 300,
			duration: 300,
			useNativeDriver: true,
		}).start(() => {
			setShowQuantityModal(false);
		});
	};

	// Handle modal actions
	const handleModalAction = () => {
		const Item = {
			quantity: modalQuantity,
			productId: result.product.id,
		};

		if (modalAction === 'addToCart') {
			handleAddToCart(Item);
		} else if (modalAction === 'buyNow') {
			handleBuyNow(Item);
		}

		hideQuantityModal();
	};

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
						message: `Sản phẩm đã được thêm vào giỏ hàng`,
						type: 'success',
						icon: 'success',
						duration: 3000,
					});
				}
			} else {
				dispatch(addToCart(Item));
				showMessage({
					message: `Sản phẩm đã được thêm vào giỏ hàng`,
					type: 'success',
					icon: 'success',
					duration: 3000,
				});
			}
		} else {
			dispatch(addToCart(Item));
			showMessage({
				message: `Sản phẩm đã được thêm vào giỏ hàng`,
				type: 'success',
				icon: 'success',
				duration: 3000,
			});
		}
	}

	async function handleBuyNow(Item) {
		props.navigation.navigate('Modal', {
			content: <BuyNowScreen
				navigation={props.navigation}
				backScreen={'ProductDetail'}
				item={Item}
				slug={result?.product?.slug}
			/>
		})
	}

	function handleShare() {
		let text = productName ? productName + '\n' : '';
		text = text.concat(`${settings && settings.website_url}/product/${slug}${currentUser ? '?ref=' + currentUser.refId : ''}`);

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
		return <ActivityIndicator animating={refresh} />;
	}

	return (
		<View style={tw`flex bg-gray-100 min-h-full content-between`}>
			<StatusBar barStyle={"light-content"} backgroundColor={'#008A97'} />
			<View style={[tw`${Platform.OS === 'android' ? 'pt-14' : 'pt-14'} pb-3`, {backgroundColor: '#008A97'}]}>
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
									<View style={tw`flex flex-row items-center`}>
										<Text style={tw`text-red-600 font-bold text-lg mr-2`}>{formatVND(salePrice)}</Text>
										<View style={tw`bg-red-500 px-2 py-1 rounded`}>
											<Text style={tw`text-white text-xs`}>-{discountPercent}%</Text>
										</View>
									</View>
									</View>
								) : (
									<Text style={tw`text-red-600 font-bold text-lg`}>{formatVND(salePrice)}</Text>
								)}
							</View>
							<View style={tw`flex flex-col items-end`}>
								<Text>
									{result && result.product && result.product.stockStatus === 'OUT_OF_STOCK' ? '⚠️ Hết hàng' :
									 result && result.product && result.product.stockStatus === 'LOW_STOCK' ? '⚠️ Sắp hết hàng' : 'Còn hàng'}
								</Text>
								{instock > 0 && (
									<Text style={tw`text-gray-500 text-xs`}>Còn {displayNumber(instock)} {result && result.product && result.product.unitName}</Text>
								)}
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

				{/* Categories & SKU (similar to web) */}
				<View style={tw`bg-white mb-3 p-3`}>
					{result && result.product && result.product.categories && result.product.categories.length > 0 && (
						<View style={tw`mb-2 flex items-center flex-row`}>
							<Text style={tw`text-gray-500 mr-1`}>Danh mục:</Text>
							<View style={tw`flex flex-row flex-wrap`}>
								{result.product.categories.map((item) => (
									<Text key={item.id} style={tw`mr-2 text-blue-700`}>{item.name}</Text>
								))}
							</View>
						</View>
					)}
					<View>
						<Text style={tw`text-gray-500`}>Mã Sản phẩm: <Text style={tw`text-gray-800`}>{result && result.product && result.product.sku}</Text></Text>
					</View>
				</View>

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

				                    {/* Tabs similar to web */}
					<View style={tw`bg-white mb-3`}>
						<View style={tw`px-3 pt-3`}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={tw`flex flex-row`}>
                                    {[{id:1,title:'Mô tả sản phẩm'},{id:2,title:'Thông tin dinh dưỡng'},{id:3,title:'Đối tượng sử dụng'},{id:4,title:'Hướng dẫn sử dụng'}].map(el => (
                                        <TouchableOpacity onPress={() => setTab(el.id)} activeOpacity={0.7} style={tw`px-4 py-2 mr-2 rounded-full ${tab===el.id? 'bg-cyan-600' : 'bg-gray-100'}`} key={el.id}>
                                            <Text style={tw`${tab===el.id? 'text-white font-medium' : 'text-gray-700'}`}>{el.title}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
					<View style={tw`p-3`}>
						                            {tab === 1 && (
                                result.product.content ? (
                                    <View>
                                        <View style={[!expandedTab[1] && {height: 200, overflow: 'hidden'}]}>
                                            <RenderHtml source={contentSource} width={width} tagsStyles={tagsStyles} />
                                        </View>
                                        {!expandedTab[1] && (
                                            <TouchableOpacity onPress={() => setExpandedTab(s=>({...s,1:!s[1]}))} style={tw`mt-3 items-center`}>
                                                <View style={tw`px-4 py-2 bg-cyan-50 rounded-md`}>
                                                    <Text style={tw`text-cyan-600`}>Xem thêm</Text>
                                                </View>
                                            </TouchableOpacity>
                                        )}
                                        {expandedTab[1] && (
                                            <TouchableOpacity onPress={() => setExpandedTab(s=>({...s,1:!s[1]}))} style={tw`mt-3 items-center`}>
                                                <View style={tw`px-4 py-2 bg-cyan-50 rounded-md`}>
                                                    <Text style={tw`text-cyan-600`}>Thu gọn</Text>
                                                </View>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ) : (
                                    <Text style={tw`text-center text-gray-500`}>Chưa có nội dung</Text>
                                )
                            )}
						                            {tab === 2 && (
                                result.product.nutritionInfo ? (
                                    <View>
                                        <View style={[!expandedTab[2] && {height: 200, overflow: 'hidden'}]}>
                                            <RenderHtml source={nutritionSource} width={width} />
                                        </View>
                                        {!expandedTab[2] && (
                                            <TouchableOpacity onPress={() => setExpandedTab(s=>({...s,2:!s[2]}))} style={tw`mt-3 items-center`}>
                                                <View style={tw`px-4 py-2 bg-cyan-50 rounded-md`}>
                                                    <Text style={tw`text-cyan-600`}>Xem thêm</Text>
                                                </View>
                                            </TouchableOpacity>
                                        )}
                                        {expandedTab[2] && (
                                            <TouchableOpacity onPress={() => setExpandedTab(s=>({...s,2:!s[2]}))} style={tw`mt-3 items-center`}>
                                                <View style={tw`px-4 py-2 bg-cyan-50 rounded-md`}>
                                                    <Text style={tw`text-cyan-600`}>Thu gọn</Text>
                                                </View>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ) : (
                                    <Text style={tw`text-center text-gray-500`}>Thông tin dinh dưỡng chưa được cập nhật</Text>
                                )
                            )}
						                            {tab === 3 && (
                                result.product.targetUsers ? (
                                    <View>
                                        <View style={[!expandedTab[3] && {height: 200, overflow: 'hidden'}]}>
                                            <RenderHtml source={targetUsersSource} width={width} />
                                        </View>
                                        {!expandedTab[3] && (
                                            <TouchableOpacity onPress={() => setExpandedTab(s=>({...s,3:!s[3]}))} style={tw`mt-3 items-center`}>
                                                <View style={tw`px-4 py-2 bg-cyan-50 rounded-md`}>
                                                    <Text style={tw`text-cyan-600`}>Xem thêm</Text>
                                                </View>
                                            </TouchableOpacity>
                                        )}
                                        {expandedTab[3] && (
                                            <TouchableOpacity onPress={() => setExpandedTab(s=>({...s,3:!s[3]}))} style={tw`mt-3 items-center`}>
                                                <View style={tw`px-4 py-2 bg-cyan-50 rounded-md`}>
                                                    <Text style={tw`text-cyan-600`}>Thu gọn</Text>
                                                </View>
                                            </TouchableOpacity>
                                        )}
						</View>
                                ) : (
                                    <Text style={tw`text-center text-gray-500`}>Thông tin đối tượng sử dụng chưa được cập nhật</Text>
                                )
                            )}
						                            {tab === 4 && (
                                result.product.usageInstructions ? (
                                    <View>
                                        <View style={[!expandedTab[4] && {height: 200, overflow: 'hidden'}]}>
                                            <RenderHtml source={usageSource} width={width} />
                                        </View>
                                        {!expandedTab[4] && (
                                            <TouchableOpacity onPress={() => setExpandedTab(s=>({...s,4:!s[4]}))} style={tw`mt-3 items-center`}>
                                                <View style={tw`px-4 py-2 bg-cyan-50 rounded-md`}>
                                                    <Text style={tw`text-cyan-600`}>Xem thêm</Text>
                                                </View>
                                            </TouchableOpacity>
                                        )}
                                        {expandedTab[4] && (
                                            <TouchableOpacity onPress={() => setExpandedTab(s=>({...s,4:!s[4]}))} style={tw`mt-3 items-center`}>
                                                <View style={tw`px-4 py-2 bg-cyan-50 rounded-md`}>
                                                    <Text style={tw`text-cyan-600`}>Thu gọn</Text>
                                                </View>
                                            </TouchableOpacity>
                                        )}
							</View>
                                ) : (
                                    <Text style={tw`text-center text-gray-500`}>Hướng dẫn sử dụng chưa được cập nhật</Text>
                                )
                            )}
					</View>
				</View>

				                    {/* Reviews section + form */}
                    <View style={tw`bg-white mb-3 p-3`}>
                        <View style={tw`flex flex-row justify-between items-center mb-3`}>
                            <Text style={tw`uppercase text-gray-600 font-medium`}>Đánh giá sản phẩm</Text>
							{currentUser &&
								<TouchableOpacity
									onPress={() => setShowReviewForm(!showReviewForm)}
									style={tw`px-3 py-1 bg-blue-600 rounded`}
								>
									<Text style={tw`text-white text-sm`}>Đánh giá</Text>
								</TouchableOpacity>
							}
                        </View>

                        {showReviewForm && (
                            <View style={tw`border-t border-gray-200 pt-3`}>
                                <View style={tw`mb-3`}>
                                    <Text style={tw`mb-1 text-gray-700`}>Họ tên *</Text>
                                    <TextInput
                                        value={reviewName}
                                        onChangeText={setReviewName}
                                        placeholder="Nhập họ tên"
                                        style={tw`border border-gray-300 rounded px-3 py-2`}
                                    />
                                </View>
                                <View style={tw`mb-3`}>
                                    <Text style={tw`mb-1 text-gray-700`}>Số điện thoại *</Text>
                                    <TextInput
                                        value={reviewPhone}
                                        onChangeText={setReviewPhone}
                                        placeholder="Nhập số điện thoại"
                                        keyboardType="phone-pad"
                                        style={tw`border border-gray-300 rounded px-3 py-2`}
                                    />
                                </View>
                                <View style={tw`mb-3`}>
                                    <Text style={tw`mb-1 text-gray-700`}>Email</Text>
                                    <TextInput
                                        value={reviewEmail}
                                        onChangeText={setReviewEmail}
                                        placeholder="Nhập email"
                                        keyboardType="email-address"
                                        style={tw`border border-gray-300 rounded px-3 py-2`}
                                    />
                                </View>
                                <View style={tw`mb-3`}>
                                    <Text style={tw`mb-1 text-gray-700`}>Đánh giá *</Text>
                                    <View style={tw`flex flex-row`}>
                                        {[1,2,3,4,5].map(star => (
                                            <TouchableOpacity
                                                key={star}
                                                onPress={() => setReviewRating(star)}
                                                style={tw`mr-1`}
                                            >
                                                <Text style={tw`text-2xl ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}`}>★</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                                <View style={tw`mb-3`}>
                                    <Text style={tw`mb-1 text-gray-700`}>Nội dung đánh giá *</Text>
                                    <TextInput
                                        value={reviewContent}
                                        onChangeText={setReviewContent}
                                        placeholder="Nhập nội dung đánh giá"
                                        multiline
                                        numberOfLines={4}
                                        style={tw`border border-gray-300 rounded px-3 py-2`}
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={async () => {
                                        if (!reviewName.trim() || !reviewPhone.trim() || !reviewContent.trim()) {
                                            showMessage({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc', type: 'danger', icon: 'danger'});
                                            return;
                                        }
                                        const token = await AsyncStorage.getItem('sme_user_token');
                                        try {
                                            await axios.post(`${apiConfig.BASE_URL}/product/review`, {
                                                productId: result.product.id,
                                                name: reviewName,
                                                phone: reviewPhone,
                                                email: reviewEmail,
                                                content: reviewContent,
                                                rating: reviewRating,
                                            }, {
                                                headers: { Authorization: `Bearer ${token}` }
                                            });
                                            showMessage({ message: 'Đã gửi đánh giá sản phẩm!', type: 'success', icon: 'success'});
                                            setReviewContent('');
                                            setReviewName('');
                                            setReviewPhone('');
                                            setReviewEmail('');
                                            setReviewRating(5);
                                            setShowReviewForm(false);
                                            setRefresh(true);
                                        } catch (e) {
                                            showMessage({ message: 'Gửi đánh giá thất bại', type: 'danger', icon: 'danger'});
                                        }
                                    }}
                                    style={tw`self-start px-4 py-2 bg-cyan-600 rounded`}
                                >
                                    <Text style={tw`text-white`}>Gửi đánh giá</Text>
                                </TouchableOpacity>
                            </View>
                        )}

					                        {result && result.reviews && result.reviews.length > 0 ? (
                            <View style={tw`mt-4`}>
                                {result.reviews.slice(0,3).map((rv) => {
                                    const userName = rv.name || 'Người dùng';
                                    const maskedName = userName.length > 2
                                        ? `${userName.charAt(0)}${'*'.repeat(Math.max(3, userName.length - 2))}${userName.charAt(userName.length - 1)}`
                                        : userName.length === 2
                                            ? `${userName.charAt(0)}*`
                                            : userName;

                                    return (
                                        <View key={rv.id} style={tw`mb-3 border-b border-gray-100 pb-2`}>
                                            <View style={tw`flex flex-row justify-between items-center mb-1`}>
                                                <Text style={tw`font-medium`}>{maskedName}</Text>
                                                <View style={tw`flex flex-row`}>
                                                    {[1,2,3,4,5].map(star => (
                                                        <Text key={star} style={tw`text-sm ${star <= (rv.rating || 5) ? 'text-yellow-400' : 'text-gray-300'}`}>★</Text>
                                                    ))}
                                                </View>
                                            </View>
                                            <Text style={tw`text-gray-600`}>{rv.content}</Text>
                                        </View>
                                    );
                                })}
                                {result.reviews.length > 3 && (
                                    <TouchableOpacity onPress={() => Linking.openURL(`${settings && settings.website_url}/product/${result.product.slug}#reviews`)} style={tw`items-center mt-2`}>
                                        <Text style={tw`text-cyan-600`}>Xem tất cả đánh giá trên web</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ) : (
                            <Text style={tw`text-gray-500 mt-3`}>Chưa có đánh giá</Text>
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
						<View style={tw`absolute bottom-22 android:bottom-22 bg-white w-full pb-4 pt-2 shadow-lg px-3`}>
							<View style={tw`flex flex-row items-center`}>
								<TouchableOpacity
									style={tw`flex flex-col items-center justify-center flex-1 mr-2`}
									onPress={() => showQuantitySelector('addToCart')}
									disabled={instock <= 0}
									activeOpacity={1}
								>
									<Icon name={"cart-plus"} style={tw`text-red-600 mr-1`} size={18} />
									<Text style={tw`text-gray-600 text-xs`}>Thêm vào giỏ</Text>
								</TouchableOpacity>

								<TouchableOpacity
									style={tw`bg-orange-500 px-3 py-1 rounded flex items-center flex-row justify-center flex-2`}
									onPress={() => showQuantitySelector('buyNow')}
									disabled={instock <= 0}
									activeOpacity={1}
								>
									<Icon name={"lightning-bolt-outline"} size={20} style={tw`text-white mr-2`}/>
									<View style={tw`flex flex-col items-center`}>
										<Text style={tw`text-white font-medium`}>Mua ngay với ưu đãi</Text>
										<Text style={tw`text-white text-xs font-medium`}>{formatVND(salePrice)}</Text>
									</View>

								</TouchableOpacity>
							</View>
						</View>
					)}
				</>
			) : (
				<View style={tw`absolute bottom-22 android:bottom-22 bg-white w-full pb-4 pt-2 shadow-lg px-3`}>
					<TouchableOpacity
						onPress={() => props.navigation.navigate('Login', {
							return: `/product/${result.product.slug}`
						})}
						style={tw`bg-orange-500 px-5 py-3 rounded flex items-center`}
					>
						<Text style={tw`text-white uppercase font-medium`}>Đăng nhập để mua hàng</Text>
					</TouchableOpacity>
				</View>
			)}

			{/* Quantity Selection Modal */}
			<Modal
				visible={showQuantityModal}
				animationType="fade"
				transparent={true}
				onRequestClose={hideQuantityModal}
			>
				<View style={tw`flex-1 bg-black bg-opacity-50 justify-end`}>
					<Animated.View
						style={[
							tw`bg-white rounded-t-xl max-h-4/5`,
							{
								transform: [{ translateY: slideAnim }]
							}
						]}
					>
						{/* Header */}
						<View style={tw`px-4 py-3 border-b border-gray-200 flex flex-row items-center justify-between`}>
							<Text style={tw`font-bold text-lg text-gray-800`}>Chọn số lượng</Text>
							<TouchableOpacity onPress={hideQuantityModal}>
								<Icon name="close" size={24} style={tw`text-gray-600`} />
							</TouchableOpacity>
						</View>

						{/* Product Info */}
						<View style={tw`px-4 py-3 border-b border-gray-100`}>
							<View style={tw`flex-row items-center`}>
								<Image
									source={{ uri: result?.product?.featureImage }}
									style={tw`w-16 h-16 rounded-lg mr-3`}
									resizeMode="cover"
								/>
								<View style={tw`flex-1`}>
									<Text style={tw`font-medium text-gray-800 text-base`} numberOfLines={2}>
										{result?.product?.name}
									</Text>
									<Text style={tw`text-red-500 font-medium`}>
										{formatVND(result?.product?.price)}
									</Text>
									<Text style={tw`text-gray-500 text-xs`}>
										Còn lại: {instock} sản phẩm
									</Text>
								</View>
							</View>
						</View>

						{/* Quantity Selector */}
						<View style={tw`px-4 py-2`}>
							<View style={tw`bg-white p-3 flex flex-row items-center justify-between`}>
								<View>
									<Text style={tw`font-medium`}>
										Chọn số lượng
									</Text>
									<Text style={tw`italic text-xs`}>Kho: {displayNumber(instock)} {result && result.product && result.product.unitName}</Text>
								</View>

								<InputSpinner
									max={instock}
									min={1}
									step={1}
									height={40}
									width={140}
									style={tw`shadow-none border border-gray-100`}
									skin={"circle"}
									colorMax={"#f04048"}
									colorMin={"#cbcbcb"}
									value={Number(quantity)}
									onChange={(num) => {
										setQuantity(num);
										if (num >= 1 && num <= instock) {
											setModalQuantity(num);
										}
									}}
								/>
							</View>

							{/* Total Price */}
							<View style={tw`mt-4 p-3 bg-gray-50 rounded-lg`}>
								<View style={tw`flex-row justify-between items-center`}>
									<Text style={tw`text-gray-700 font-medium`}>Tổng tiền:</Text>
									<Text style={tw`text-red-500 font-bold text-lg`}>
										{formatVND(result?.product?.price * modalQuantity)}
									</Text>
								</View>
							</View>
						</View>

						{/* Action Buttons - Sticky Bottom */}
						<View style={tw`px-4 py-4 mb-3 bg-white border-t border-gray-200`}>
							<TouchableOpacity
								onPress={handleModalAction}
								style={tw`bg-red-600 py-3 rounded-lg flex-row items-center justify-center`}
							>
								<Text style={tw`text-white text-base`}>
									{modalAction === 'addToCart' ? 'Thêm vào giỏ hàng' : 'Mua ngay'}
								</Text>
							</TouchableOpacity>
						</View>
					</Animated.View>
				</View>
			</Modal>
		</View>
	);
}

export default ProductDetail;
