import React, {useEffect, useState} from "react";
import {
    ActivityIndicator, Dimensions,
    FlatList,
    Platform,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import ApiConfig, {AppConfig} from "app/config/api-config";
import RestaurantItem from "app/screens/Food/components/RestaurantItem";
import ProjectItem from "app/components/ProjectItem";
import ProductItem from "app/components/ProductItem";
import {FlatGrid} from "react-native-super-grid";
import FoodItem from "app/components/FoodItem";
import Carousel from "react-native-snap-carousel";

function FoodScreen(props) {
    const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');
    const SLIDE_WIDTH = Math.round(viewportWidth / (2.6));
    const ITEM_HORIZONTAL_MARGIN = 15;
    const ITEM_WIDTH = SLIDE_WIDTH + ITEM_HORIZONTAL_MARGIN * 0.5;
    const SLIDER_WIDTH = viewportWidth;
    // tìm kiếm
    // danh sách món ăn theo danh mục, dạng trượt
    // danh sách cửa hàng, dạng danh sách
    const dispatch = useDispatch()
    const [query, setQuery] = useState()
    const [result, setResult] = useState()
    const [notFound, setNotFound] = useState()
    const [refresh, setRefresh] = useState(false)

    let slug = null;

    if (props.route.params && props.route.params.slug) {
        slug = props.route.params.slug
    } else if (props.route.params.route.params && props.route.params.route.params.slug) {
        slug = props.route.params.route.params.slug
    }

    console.log(slug);

    //const slug = props.route.params.route.params ? props.route.params.route.params.slug : props.route.params.slug ;

    let type;
    let title;

    switch (slug) {
        case 'food':
            type = 'Đồ ăn';
            title = 'Dịch vụ ăn uống';
            break;
        case 'service':
            type = 'Dịch vụ';
            title = 'Dịch vụ';
            break;
        default: return ;
    }

    const map = useSelector(state => state.SettingsReducer.map)

    console.log('map day', map);

    async function getData() {
        axios({
            method: 'get',
            url: `${ApiConfig.BASE_URL}/services`,
            params: {
                query,
                map_lat: map ? map.lat : null,
                map_lng: map ? map.lng : null,
                type,
                featured: query ? 'Không' : 'Có'
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
    }, [dispatch, query, refresh, map])

    return (
        !result ? <ActivityIndicator /> :
        <View>
            <View style={tw`flex bg-gray-100 min-h-full`}>
                <View style={[tw`${Platform.OS === 'android' ? 'pt-4' : 'pt-14'} pb-2 px-3 bg-white shadow-lg`]}>
                    <View style={tw`flex flex-row items-center justify-between`}>
                        <View>
                            <Icon name={slug === 'food' ? 'food' : 'spa'} size={28} style={tw`${slug === 'food' ? 'text-red-500' : 'text-green-600'}`} />
                        </View>
                        <View style={tw`flex-row items-center bg-gray-200 rounded w-4/5 h-8`}>
                            <Icon name="magnify" size={18} style={tw`text-gray-500 ml-2`} />
                            <TextInput
                                style={tw`ml-2 w-4/5 android:h-20`}
                                value={query}
                                onChangeText={event => setQuery(event)}
                                placeholder="Tên nhà hàng, dịch vụ, món ăn..."
                                returnKeyType={"done"}
                            />
                            <TouchableOpacity onPress={() => setQuery()}>
                                <Icon name="close-circle" size={18} style={tw`text-gray-500`}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <ScrollView
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
                    <View style={tw`pb-52`}>
                        {/* {result && result.services && result.services.length > 0 &&
                            <View style={tw`my-2`}>
                                {result.services.map((el, index) => {
                                    // Kiểm tra console.log để debug
                                    console.log('Category:', el.categoryDetail, 'Services:', el.services);

                                    // Kiểm tra đầy đủ trước khi hiển thị
                                    return (el.services && Array.isArray(el.services) && el.services.length > 0 && el.categoryDetail) ? (
                                        <View key={index} style={tw`mb-3 bg-white p-3`}>
                                            <View style={tw`mb-3`}>
                                                <Text style={tw`font-medium text-base text-red-500`}>
                                                    {el.categoryDetail && el.categoryDetail.name ? el.categoryDetail.name : "Danh mục"}
                                                </Text>
                                            </View>
                                            <View>
                                                <Carousel
                                                    sliderWidth={SLIDER_WIDTH}
                                                    itemWidth={ITEM_WIDTH}
                                                    activeSlideAlignment={'start'}
                                                    inactiveSlideScale={1}
                                                    inactiveSlideOpacity={1}
                                                    data={el.services}
                                                    renderItem={({item}) => (
                                                        <View style={tw`mr-2`}>
                                                            <FoodItem
                                                                item={item}
                                                                navigation={props.navigation}
                                                            />
                                                        </View>
                                                    )}
                                                    keyExtractor={(item, idx) => `service-${index}-${idx}`}
                                                    hasParallaxImages={false}
                                                    autoplay={false}
                                                    autoplayInterval={4000}
                                                    loop
                                                />
                                            </View>
                                        </View>
                                    ) : null;
                                })}
                            </View>
                        } */}
                        {result && result.restaurants && result.restaurants.length > 0 &&
                            <FlatList
                                data={result && result.restaurants}
                                renderItem={({item}) => <RestaurantItem map={map && map} item={item} navigation={props.navigation}/>}
                                keyExtractor={(item) => item.id}
                                removeClippedSubviews={true} // Unmount components when outside of window
                                initialNumToRender={4} // Reduce initial render amount
                                maxToRenderPerBatch={1} // Reduce number in each render batch
                                updateCellsBatchingPeriod={100} // Increase time between renders
                                windowSize={7} // Reduce the window size
                            />
                        }
                    </View>

                </ScrollView>
            </View>
        </View>
    );
}
export default FoodScreen;
