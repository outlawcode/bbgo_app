import React, {useEffect, useState} from 'react';
import {
    ActivityIndicator,
    Animated,
    Image,
    Platform,
    RefreshControl,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import ApiConfig from "app/config/api-config";
import tw from "twrnc";
import themeUtils from "app/utils/themeUtils";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {formatVND} from "app/utils/helper";
import FoodMenuItem from "app/screens/Food/components/FoodMenuItem";

const HEADER_IMAGE_HEIGHT = themeUtils.relativeHeight(25);

function RestaurantDetails(props) {
    const state = props.route && props.route.params;
    const dispatch = useDispatch()
    const [query, setQuery] = useState()
    const [notFound, setNotFound] = useState(false)
    const [refresh, setRefresh] = useState(false)
    const [result, setResult] = useState()
    const [cart, setCart] = useState(state && state.cart ? state.cart : [])
    const [totalAmount, setTotalAmount] = useState(0)
    const [discount, setDiscount] = useState(0)
    const [vatAmount, setVatAmount] = useState(0)
    const currentUser = useSelector(state => state.memberAuth.user);
    const settings = useSelector(state => state.SettingsReducer.options)


    async function getData() {
        axios({
            method: 'get',
            url: `${ApiConfig.BASE_URL}/service-address/${state && state.id}`,
            params: {
                query,
            },
        }).then(function (response) {
            if (response.status === 200) {
                setResult(response.data);
                setRefresh(false)
            }
        }).catch(function(error){
            console.log(error);
            setNotFound(true)
        })
    }

    useEffect(() => {
        getData();
    }, [dispatch, query, refresh])



    const scrollY = new Animated.Value(0);

    let headerBackgroundColor = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: ['rgba(255, 255, 255, 0)', 'white'],
        extrapolate: 'clamp',
        useNativeDriver: true,
    })

    let headerImageOpacity = scrollY.interpolate({
        inputRange: [0, 140],
        outputRange: [1, 0],
        extrapolate: 'clamp',
        useNativeDriver: true,
    })

    let headerTitleOpacity = scrollY.interpolate({
        inputRange: [0, 160, 190, 200],
        outputRange: [0, 0, 0, 1],
        extrapolate: 'clamp',
        useNativeDriver: true,
    });

    let translateYCardTop = scrollY.interpolate({
        inputRange: [0, 1000],
        outputRange: [0, -1000],
        extrapolate: 'clamp',
        useNativeDriver: true,
    });
    let scaleYCardTop = scrollY.interpolate({
        inputRange: [-(200 || 0) / 2, 0],
        outputRange: [2, 1],
        extrapolateRight: 'clamp',
        useNativeDriver: true,
    });

    const _scrollView = React.useRef(null);

    function handleChangeQuantity(data) {
        const index = cart.findIndex((item => Number(item.serviceId) === Number(data.serviceId)))
        if (index !== -1) {
            if (data.quantity === 0) {
                let deletedList = cart.filter((item) => item.serviceId !== data.serviceId)
                console.log(deletedList);
                setCart(deletedList)
            } else {
                let newList = [
                    ...cart.slice(0, index),
                    data,
                    ...cart.slice(index + 1)
                ]
                setCart(newList)
            }

        } else {
            setCart([...cart, data])
        }
    }

    useEffect(() => {
        let discountX = 0;
        let discountS = 0;
        let discountActive = 0;
        let amount = 0;

        // Tính tổng tiền ban đầu
        if (cart.length > 0) {
            cart.map((el) => {
                amount += (Number(el.price) * Number(el.quantity))
            })
        }

        // Tính VAT
        const vatPercent = Number(settings && settings.vat_percent)
        const vatAmount = Number(amount) * vatPercent/100;
        const originalAmount = Number(amount) + Number(vatAmount);

        // Tính discount cho dịch vụ (áp dụng cho user Kim Cương - userKind.id = 3)
        if (settings && settings.service_discount_percent && Number(currentUser && currentUser.userKind && currentUser.userKind.id) === 3) {
            discountS = (Number(originalAmount) - Number(vatAmount)) * Number(settings.service_discount_percent) / 100;
        }

        // Tính discount cho user active (có refId và không có userKind)
        if (currentUser && currentUser.refId && !currentUser.userKind) {
            discountActive = (Number(originalAmount) - Number(vatAmount)) * Number(settings?.active_user_discount_service) / 100;
        }

        // Tính tổng discount
        const totalDiscount = Number(discountS) + Number(discountX) + Number(discountActive)
        const finalAmount = Number(originalAmount) - Number(totalDiscount);

        // Cập nhật state
        setDiscount(totalDiscount)
        setTotalAmount(amount)
        setVatAmount(vatAmount)
    }, [cart, currentUser, settings])

    function handleCheckOut() {
        const checkoutParams = {
            totalAmount,
            cart,
            discount,
            vatAmount,
            restaurantId: result && result.address && result.address.id
        }
        props.navigation.navigate('CustomerInformationFood', checkoutParams)
    }

    return (
        !result ? <ActivityIndicator /> :
            <View style={{flex: 1, justifyContent: 'space-between'}}>
            <View>
                <Animated.Image
                    style={[tw`w-full top-0 absolute`, {
                        height: HEADER_IMAGE_HEIGHT,
                        opacity: headerImageOpacity,
                        transform: [{ scale: scaleYCardTop }, { translateY: translateYCardTop }]
                    }]}
                    source={
                        result.address && result.address.image ? {uri: result.address.image} :
                            require('../../assets/images/default-food.png')}
                />
                <Animated.View
                    style={[tw`flex flex-row h-20 ios:pt-6 android:pt-2 w-full justify-between items-center`, {
                        backgroundColor: headerBackgroundColor,
                    }]}
                >
                    <View style={tw`flex flex-row items-center`}>
                        <View style={tw`bg-white ml-3 rounded-full w-8 h-8 items-center justify-center bg-opacity-80 mr-3`}>
                            <Icon name={'chevron-left'} size={20} onPress={() => props.navigation.goBack()}/>
                        </View>
                        <Animated.Text
                            style={[tw`text-gray-800 font-medium text-lg`, {opacity: headerTitleOpacity}]}
                            numberOfLines={1}
                        >
                            {result && result.address && result.address.name}
                        </Animated.Text>
                    </View>
                </Animated.View>
                <Animated.ScrollView
                    ref={_scrollView}
                    showsVerticalScrollIndicator={false}
                    overScrollMode={'never'}
                    scrollEventThrottle={16}
                    onScroll={Animated.event([{
                        nativeEvent: {contentOffset: {y: scrollY}},
                    }], {
                        listener: (event) => {
                        },
                        useNativeDriver: false,
                    })}
                    refreshControl={
                        <RefreshControl
                            refreshing={refresh}
                            onRefresh={() => setRefresh(true)}
                            title="đang tải"
                            tintColor="#fff"
                            titleColor="#fff"
                        />
                    }
                    stickyHeaderIndices={[Platform.OS === 'ios' && 1]}
                >
                    <View  style={tw`mt-20`}>
                        <View style={tw`bg-white p-3 mb-2 rounded-tl-xl rounded-tr-xl`}>
                            <Text style={[tw`font-medium text-lg text-gray-700`]}
                                  numberOfLines={2} ellipsizeMode='tail'
                            >
                                {result && result.address && result.address.name}
                            </Text>
                            <View style={tw`flex flex-row items-start mt-2`}>
                                <Icon name="map-marker" size={14} style={tw`text-gray-400 mt-1`}/>
                                <Text style={[tw`text-gray-500`]}>
                                    {result && result.address && result.address.address}
                                </Text>
                            </View>
                            <View style={tw`flex flex-row items-start mt-2`}>
                                <Icon name="clock" size={12} style={tw`text-gray-400 mt-1 mr-1`}/>
                                <Text style={[tw`text-gray-500`]}>
                                    {result && result.address && result.address.start_time} - {result && result.address && result.address.end_time}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={tw`flex items-center mb-2 bg-white py-2`}>
                        <View style={tw`flex-row items-center bg-gray-200 rounded h-10`}>
                            <Icon name="magnify" size={18} style={tw`text-gray-500 ml-2`} />
                            <TextInput
                                style={tw`ml-2 w-4/5 android:h-20`}
                                value={query}
                                onChangeText={event => setQuery(event)}
                                placeholder="Nhập tên món..."
                                returnKeyType={"done"}
                            />
                            <TouchableOpacity onPress={() => setQuery()}>
                                <Icon name="close-circle" size={18} style={tw`mr-2 text-gray-500`}/>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={tw`pb-40`}>
                        {result && result.service && result.service.length > 0 ?
                            <View style={tw`bg-white p-3`}>
                                {result.service.map((el) => (
                                    <FoodMenuItem
                                        key={el.id}
                                        service={el}
                                        onChange={handleChangeQuantity}
                                        quantity={cart && cart.find(item => Number(item.serviceId) === Number(el.id))}
                                    />
                                ))}
                            </View>
                            :
                            <View style={tw`flex items-center p-5`}>
                                <Icon name={"food-off-outline"} size={40} style={tw`mb-3 text-gray-400`}/>
                                <Text>Không tìm thấy món!</Text>
                            </View>
                        }
                    </View>
                </Animated.ScrollView>
            </View>

                {currentUser ?
                    cart.length > 0 &&
                    <View style={tw`absolute bottom-0 bg-white w-full py-3 shadow-lg px-3`}>
                        <View style={tw`flex items-center justify-between flex-row`}>
                            <View style={tw`relative`}>
                                <Icon name={"shopping"} size={32} style={tw`text-red-500`}/>
                                {cart.length > 0 &&
                                    <View
                                        style={tw`absolute -top-1 -right-2 bg-red-500 w-5 h-5 rounded-full flex items-center border-2 border-white`}>
                                        <Text style={tw`text-white text-xs`}>
                                            {cart.length}
                                        </Text>
                                    </View>
                                }
                            </View>
                            <View style={tw`flex items-center flex-row`}>
                                <View style={tw`mr-2`}>
                                    {discount > 0 &&
                                        <Text style={tw`text-gray-500 text-xs`}>{formatVND(totalAmount)}</Text>
                                    }
                                    <Text
                                        style={tw`text-lg font-medium text-orange-600`}>{formatVND(Number(totalAmount) - Number(discount))}</Text>
                                </View>
                                <TouchableOpacity
                                    disabled={totalAmount <= 0}
                                    onPress={() => handleCheckOut()}
                                    style={tw`px-5 py-3 rounded flex items-center ${totalAmount <= 0 ? 'bg-gray-300' : 'bg-red-500'}`}
                                >
                                    <Text style={tw`text-white uppercase font-medium`}>Thanh toán</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </View>
                    :
                    <View style={tw`absolute bottom-0 bg-white w-full py-3 shadow-lg px-3`}>
                        <TouchableOpacity
                            onPress={() => props.navigation.navigate('Login', {
                                backScreen: 'Foods'
                            })}
                            style={tw`bg-orange-500 px-5 py-3 rounded flex items-center`}
                        >
                            <Text  style={tw`text-white uppercase font-medium`}>Đăng nhập đặt món</Text>
                        </TouchableOpacity>
                    </View>

                }
        </View>
    );
}

export default RestaurantDetails;
