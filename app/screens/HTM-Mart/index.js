import React, { useEffect, useState } from "react";
import {
	Animated,
	Dimensions,
	Image,
	Linking,
	Platform,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import axios from "axios";
import apiConfig from "app/config/api-config";
import { useIsFocused } from "@react-navigation/native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import defaultImage from "../../assets/images/logo.png";
import CartIcon from "app/screens/Cart/components/cartIcon.js";

const { width, height } = Dimensions.get("window");
const CARD_HEIGHT = 55;
const CARD_WIDTH = width * 0.4;
const SPACING_FOR_CARD_INSET = width * 0.1 - 10;

function HTMMartScreen(props) {
	const isFocused = useIsFocused();
	const dispatch = useDispatch()
	const currentUser = useSelector(state => state.memberAuth.user);
	const settings = useSelector(state => state.SettingsReducer.options);
	const [refresh, setRefresh] = useState(false);
	const [flag, setFlag] = useState(false);
	const [result, setResult] = useState();
	const [type, setType] = useState("ALL");
	const [current, setCurrent] = useState(null)
	const [position, setPosition] = useState(null)
	const [query, setQuery] = useState(null)

	useEffect(() => {
		if (isFocused) {
			async function getPackageInfo() {
				axios({
					method: 'get',
					url: `${apiConfig.BASE_URL}/htm-mart`,
					params: {
						type,
						query
					}
				}).then(function(response) {
					if (response.status === 200) {
						setResult(response.data)
						setRefresh(false)
						setPosition({
							map_lat: response.data[0].map_lat,
							map_lng: response.data[0].map_lng,
							name: response.data[0].name,
							shop: response.data[0].shop,
						})
					}
				}).catch(function(error) {
					//history.push('/404')
					console.log(error);
					setRefresh(false)
				})
			}

			getPackageInfo();
		}
	}, [dispatch, flag, refresh, isFocused, type, query])

	const types = [
		{title: 'Siêu thị', code: 'Siêu thị'},
		{title: 'Nhà máy', code: 'Nhà máy'},
		{title: 'Nhà máy cổ phần', code: 'Nhà máy cổ phần'},
	]

	let mapIndex = 0;
	let mapAnimation = new Animated.Value(0);

	useEffect(() => {
		mapAnimation.addListener(({value}) => {
			let index = Math.floor(value / CARD_WIDTH + 0.3);
			if (index >= result.length) {
				index = result.length - 1;
			}
			if (index <= 0) {
				index = 0;
			}

			clearTimeout(regionTimeOut)

			const regionTimeOut = setTimeout(() => {
				if (mapIndex !== index) {
					mapIndex = index;
					const coordinate = {
						latitude: parseFloat(position.map_lat),
						longitude: parseFloat(position.map_lng),
					};
					_map.current.animateToRegion(
						{
							...coordinate,
							latitudeDelta: 0.04864195044303443,
							longitudeDelta: 0.040142817690068
						},
						350
					);
				}
			}, 10)
		})
	}, [position])

	const bgInterpolations = result && result.map((marker, index) => {
		const inputRange = [
			(index - 1) * CARD_HEIGHT,
			index * CARD_HEIGHT,
			((index + 1) * CARD_HEIGHT),
		];

		const bgColor = mapAnimation.interpolate({
			inputRange,
			outputRange: [0.6, 1, 0.6],
			extrapolate: "clamp"
		});

		return {bgColor};
	})

	const onMarkerPress = (mapEventData) => {
		console.log(mapEventData.coordinate);
		/*const markerID = mapEventData._targetInst.return.index;
		let x = (markerID * CARD_HEIGHT) + (markerID * 20);
		if (Platform.OS === 'ios') {
			x = x - SPACING_FOR_CARD_INSET;
		}

		_scrollView.current.scrollTo({x: x, y: 0, animated: true})*/
	}

	const _map = React.useRef(null);
	const _scrollView = React.useRef(null);
	const _marker = React.useRef(null);

	return (
		<View style={tw`flex h-full w-full`}>

				{result && result.length > 0 &&
					<MapView
						style={{ left: 0, right: 0, top: 0, bottom: 0, position: 'absolute' }}
						provider={PROVIDER_GOOGLE}
						region={{
							latitude: position && position.map_lat ? parseFloat(position.map_lat) : 0.04864195044303443,
							longitude: position && position.map_lng ? parseFloat(position.map_lng) : 0.040142817690068,
							latitudeDelta: 0.015,
							longitudeDelta: 0.0121
						}}
						zoomTapEnabled={true}
						//minZoomLevel={14}
						ref={_map}
						zoomControlEnabled={true}
						zoomEnabled={true}
					>
						{result && result.map((marker, index) => {
							const bgStyle = {
								opacity: bgInterpolations[index].bgColor
							}
							return (
								<Marker
									ref={_marker}
									coordinate={{
										latitude: position && position.map_lat ? parseFloat(position.map_lat) : 0.04864195044303443,
										longitude: position && position.map_lng ? parseFloat(position.map_lng) : 0.040142817690068,
									}}
									//onPress={(e) => onMarkerPress(e)}
									onPress={() => {
										console.log(position);
										position.shop ? props.navigation.navigate('StoreDetail', {name: position.shop.niceName}) :
										Linking.openURL(`https://maps.google.com/maps?daddr=${position && position.map_lat ? parseFloat(position.map_lat) : 0.04864195044303443},${position && position.map_lng ? parseFloat(position.map_lng) : 0.040142817690068}`);
									}}
								>
									<Animated.View style={tw`items-center justify-center`}>
										<Animated.View style={[tw`rounded-full bg-blue-400`]}>
											<View style={tw`py-1 px-2`}>
												<Text style={[tw`font-bold text-xs text-white`]} numberOfLines={1}>{position && position.name}</Text>
											</View>
										</Animated.View>

										<Animated.View>
											<Icon name={"map-marker"} style={[tw`text-red-400 mt-1`]} size={32} />
										</Animated.View>
									</Animated.View>
								</Marker>
							)
						})}
					</MapView>
				}

				<View
					style={tw`absolute top-0 right-0 left-0`}
				>
					<View style={[tw`${Platform.OS === 'android' ? 'pt-4' : 'pt-12'} pb-2 px-3 bg-white shadow-lg`]}>
						<View style={tw`flex items-center`}>
							<View style={tw`flex-row justify-between items-center bg-gray-100 rounded h-8 w-4/5`}>
								<View style={tw`flex-row items-center`}>
									<Icon name="magnify" size={18} style={tw`text-gray-500 ml-1`} />
									<TextInput
										style={tw`ml-2 w-4/5 android:h-20`}
										value={query}
										onChangeText={event => setQuery(event)}
										placeholder="Tìm kiếm địa điểm..."
										returnKeyType={"done"}
									/>
								</View>
									<TouchableOpacity onPress={() => setQuery()}>
										<Icon name="close-circle" size={18} style={tw`text-gray-500`} />
									</TouchableOpacity>
							</View>
						</View>

					</View>

					<View style={tw`bg-white py-3`}>
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
							>
								<TouchableOpacity
									activeOpacity={1}
									onPress={() => setType('ALL')}
									style={tw`ml-2 rounded-full border border-gray-200 px-3 py-2 ${type === 'ALL' && 'bg-green-600'}`}
								>
									<Text style={tw`font-medium text-green-600 ${type === 'ALL' && 'text-white'}`}>Tất cả</Text>
								</TouchableOpacity>
								{types && types.length > 0 && types.map((item, index) => (
									<TouchableOpacity
										activeOpacity={1}
										style={tw`ml-2 rounded-full border border-gray-200 px-3 py-2 ${type === item.code && 'bg-green-600'}`}
										onPress={() => setType(item.code)}
									>
										<View>
											<Text  style={tw`font-medium text-gray-700 ${type === item.code && 'text-white'}`}>{item.title}</Text>
										</View>
									</TouchableOpacity>
								))}
							</ScrollView>
					</View>

				</View>


			{result && result.length === 0 &&
				<View style={tw`absolute bottom-20 right-0 left-0 py-5`}>
					<View style={tw`flex items-center`}>
						<Icon name={"map-marker-off"} size={50} style={tw`text-gray-400 mb-2`} />
						<Text style={tw`text-gray-600`}>Không tìm thấy nội dung.</Text>
					</View>

				</View>
			}

			{result && result.length > 0 &&
					<View
						style={[tw`absolute pt-2 top-36 right-0 pb-32`, {height: height - 100}]}
					>
						<Animated.ScrollView
							ref={_scrollView}
							vertical
							showsVerticalScrollIndicator={false}
							snapToInterval={CARD_HEIGHT + 20}
							onScroll={Animated.event(
								[
									{
										nativeEvent: {
											contentOffset: {
												x: mapAnimation,
											}
										},
									},
								],
								{useNativeDriver: false}
							)}
						>
							{result.map((item, index) => (
								<TouchableOpacity
									onPress={() => setPosition({
										map_lat: item.map_lat,
										map_lng: item.map_lng,
										name: item.name
									})}
									activeOpacity={1}
								>
									<View style={[tw`${position && Number(position.map_lat) === Number(item.map_lat) ? 'bg-blue-400 border-t-2 border-b-2 border-l-2 border-white' : 'bg-white'} mb-2 rounded-tl-md rounded-bl-md py-1 shadow-md relative`, {width: CARD_WIDTH, height: CARD_HEIGHT}]}>
										<View style={tw`flex flex-row`}>
											<View style={tw`ml-1 mr-2 mt-1`}>
												{item.image ?
													<Image source={{uri: item.image}} style={tw`h-8 w-8 rounded-full border-2 border-white`} />
													:
													<Image source={defaultImage} style={tw`h-8 w-8 rounded-full border-2 border-white`} />
												}

											</View>
											<View style={[tw`mr-1 relative` ,{flexShrink: 1}]}>
												<Text numberOfLines={2} style={tw`font-medium text-xs ${position && Number(position.map_lat) === Number(item.map_lat) ? 'text-white' : 'text-blue-500'}`}>
													{item.name}
												</Text>
												<View>
													<Text numberOfLines={1} style={tw`text-xs mb-2 ${position && Number(position.map_lat) === Number(item.map_lat) ? 'text-white' : 'text-gray-400'}`}>
														{item.type}
													</Text>
													{/*<Text numberOfLines={2} style={tw`text-gray-600 text-xs`}>
													{item.address}
												</Text>*/}
												</View>
											</View>
										</View>
										{/*<View style={tw`absolute right-2 top-2`}>
										<TouchableOpacity
											style={tw`bg-green-600 bg-opacity-90 px-2 py-1 rounded-full flex flex-row items-center`}
											onPress={() => Linking.openURL(`https://maps.google.com/maps?daddr=${item.map_lat},${item.map_lng}`)}
										>
											<Icon name="navigation-variant" style={tw`text-white mr-1`}/>
											<Text style={tw`text-white text-xs font-medium`}>Chỉ đường</Text>
										</TouchableOpacity>
									</View>*/}
									</View>
								</TouchableOpacity>


							))}
						</Animated.ScrollView>
					</View>
				}
		</View>
	);
}

export default HTMMartScreen;
