import React, {useEffect, useState} from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text, TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import { formatDateUS } from "app/utils/helper.js";
import { useIsFocused } from "@react-navigation/native";
import TransactionItem from "app/components/TransactionItem.js";
import ProductStockItem from "app/screens/MyMart/components/ProductStockItem.js";

function MartWarehouse(props) {
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const [result, setResult] = useState();
  const [refresh, setRefresh] = useState(false)
  const [query, setQuery] = useState(null)
  const currentUser = useSelector(state => state.memberAuth.user);
  const settings = useSelector(state => state.SettingsReducer.options)

  useEffect(() => {
    props.navigation.setOptions({
      title: 'Kho hàng',
      headerStyle: {
        backgroundColor: '#2ea65d',
      },
      headerTintColor: '#fff',
      headerLeft: () => (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => props.navigation.goBack()}>
          <Icon name="chevron-left"
                size={26}
                style={tw`text-white ml-3`}
          />
        </TouchableOpacity>
      ),
    })
  }, [])

  useEffect(() => {
    if (isFocused) {
      async function getMartInfo() {
        const token = await AsyncStorage.getItem('sme_user_token');
        axios({
          method: 'get',
          url: `${apiConfig.BASE_URL}/member/shop-product-stock`,
          params: {
            page: 1,
            limit: 100000000,
            query
          },
          headers: {Authorization: `Bearer ${token}`}
        }).then(function(response) {
          if(response.status === 200) {
            setResult(response.data)
            setRefresh(false);
          }
        }).catch((function(error) {
          console.log(error);
        }))
      }
      getMartInfo()
    }
  }, [dispatch, refresh, isFocused, query])

  return (
    !currentUser ? <Text>Đang tải...</Text> :
      <View style={tw`flex bg-white h-full`}>
        <StatusBar barStyle={"light-content"} backgroundColor={'#2ea65d'} />
        <View style={tw`bg-white p-3 border-b border-gray-200`}>
          <View style={tw`flex-row items-center`}>
            <Icon name="magnify" size={18} style={tw`text-gray-500 mr-2`} />
            <TextInput
              autoFocus
              style={tw`android:h-20`}
              value={query}
              onChangeText={event => setQuery(event)}
              placeholder="Tìm kiếm mã sản phẩm, tên sản phẩm..."
              returnKeyType={"done"}
            />
          </View>
        </View>
        {!result ? <ActivityIndicator /> :
          <View>
            <ScrollView
              style={tw`pb-20`}
              scrollEnabled={true}
              showsVerticalScrollIndicator={false}
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
              <View style={tw`flex pb-20`}>
                {result && result.list && result.list.length > 0 ?
                  <FlatList
                    data={result && result.list}
                    renderItem={({item}) => <ProductStockItem item={item}/>}
                    keyExtractor={(item) => item.id}
                    removeClippedSubviews={true} // Unmount components when outside of window
                    initialNumToRender={4} // Reduce initial render amount
                    maxToRenderPerBatch={1} // Reduce number in each render batch
                    updateCellsBatchingPeriod={100} // Increase time between renders
                    windowSize={7} // Reduce the window size
                  />
                  :
                  <View style={tw`flex items-center my-5`}>
                    <Icon name={"reload-alert"} size={50} style={tw`mb-3 text-gray-300`} />
                    <Text  style={tw`text-gray-600`}>Không tìm thấy sản phẩm</Text>
                  </View>
                }
              </View>
            </ScrollView>
          </View>
        }
      </View>

  );
}

export default MartWarehouse;
