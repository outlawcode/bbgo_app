import React, { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import { GetMe, LoadDataAction } from "app/screens/Auth/action.js";
import { useIsFocused } from "@react-navigation/native";
import moment from "moment/moment.js";
import { formatDate, formatDateUS, formatNumber, formatVND } from "app/utils/helper.js";
import DatePicker from 'react-native-neat-date-picker'
import MartRegisterForm from "app/screens/MyMart/MartRegisterForm.js";
import { emptyCart } from "app/screens/Cart/action.js";
import CheckoutCompleted from "app/screens/CheckOut/CheckoutCompleted.js";
import { showMessage } from "react-native-flash-message";

function MyMart(props) {
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.memberAuth.user);
  const settings = useSelector(state => state.SettingsReducer.options)
  const [result, setResult] = useState()
  const [flag, setFlag] = useState(false)
  const [error, setError] = useState()
  const [orderStats, setOrderStats] = useState()
  const [lastOrders, setLastOrders] = useState()
  const [refresh, setRefresh] = useState(true)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state for form submission

  const [dateRange, setDateRange] = useState(
      [
        moment.utc(moment().clone().startOf('month').format('YYYY-MM-DD')),
        moment.utc(moment().clone().endOf('month').format("YYYY-MM-DD"))
      ]
  )

  // Check if user is eligible to see the warehouse section
  // Shop type should be product AND isMart should be 0
  const canShowWarehouse = currentUser &&
      currentUser.shopType === 'product' &&
      (currentUser.isMart === 0 ||
          (result && result.martInfo && result.martInfo.isPersonal === true));

  // Determine which POS screen to navigate to
  const getPosScreenName = () => {
    if (currentUser && currentUser.shopType === 'Service') {
      return "POSService";
    }
    return "POS";
  };

  useEffect(() => {
    props.navigation.setOptions({
      title: 'Điểm bán hàng',
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
      getMartInfo(); // Move to separate function for easy re-calling
      getOrderStats();
      getLastOrders();
    }
  }, [dispatch, refresh, isFocused, dateRange, flag])

  async function getOrderStats() {
    try {
      const token = await AsyncStorage.getItem('sme_user_token');
      const response = await axios({
        method: 'get',
        url: `${apiConfig.BASE_URL}/member/order/shop/quickStats`,
        params: {
          rangeStart: formatDateUS(dateRange[0]),
          rangeEnd: formatDateUS(dateRange[1]),
          orderSource: 'Offline'
        },
        headers: {Authorization: `Bearer ${token}`}
      });

      if (response.status === 200) {
        setOrderStats(response.data);
        setRefresh(false);
      }
    } catch (error) {
      console.log(error);
      setRefresh(false);
    }
  }

  async function getLastOrders() {
    try {
      const token = await AsyncStorage.getItem('sme_user_token');
      const response = await axios({
        method: 'get',
        url: `${apiConfig.BASE_URL}/member/order/shop`,
        params: {
          limit: 5,
          page: 1,
          orderSource: 'Offline'
        },
        headers: {Authorization: `Bearer ${token}`}
      });

      if (response.status === 200) {
        setLastOrders(response.data);
        setRefresh(false);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function getMartInfo() {
    try {
      const token = await AsyncStorage.getItem('sme_user_token');
      const response = await axios({
        method: 'get',
        url: `${apiConfig.BASE_URL}/member/htm-mart/info`,
        headers: {Authorization: `Bearer ${token}`}
      });

      if (response.status === 200) {
        setResult(response.data);
        setError(null); // Clear any previous errors
        setRefresh(false);
      }
    } catch (error) {
      console.log(error);
      if (error.response) {
        setError(error.response.data);
      }
      setRefresh(false);
    }
  }

  async function handleRequestOpen(data) {
    if (loading) return; // Prevent multiple submissions

    setLoading(true);
    try {
      // Set isPersonal based on shop type
      const isPersonal = currentUser.shopType !== 'product';
      const submitData = {
        ...data,
        isPersonal
      };

      const token = await AsyncStorage.getItem('sme_user_token');
      const response = await axios({
        method: 'post',
        url: `${apiConfig.BASE_URL}/member/htm-mart/register`,
        data: submitData,
        headers: {Authorization: `Bearer ${token}`}
      });

      if (response.status === 201) {
        // Immediately get updated mart info - the backend now returns the mart info
        if (response.data && response.data.martInfo) {
          // Update result directly with the returned mart info
          setResult({
            martInfo: response.data.martInfo
          });
          setError(null); // Clear error state to show mart info

          // Update currentUser in redux (optional, if needed)
          dispatch(GetMe());
        } else {
          // If mart info not returned, refresh to get it
          getMartInfo();
        }

        showMessage({
          message: 'Đăng ký điểm mua sắm thành công!',
          type: 'success',
          icon: 'success',
          duration: 3000,
        });
      }
    } catch (error) {
      showMessage({
        message: error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau',
        type: 'danger',
        icon: 'danger',
        duration: 3000,
      });
      console.log(error);
    } finally {
      setLoading(false);
      setFlag(!flag); // Toggle flag to trigger useEffect
    }
  }

  return (
      !currentUser ? <Text>Đang tải...</Text> :
          <View style={tw`flex h-full`}>
            <StatusBar barStyle={"light-content"} backgroundColor={'#2ea65d'} />
            {
              !error ?
                  !result ? <ActivityIndicator /> :
                      <View>
                        <View style={tw`bg-white p-3 flex items-center flex-row justify-between`}>
                          <TouchableOpacity
                              style={tw`bg-green-600 py-2 px-3 rounded flex flex-row items-center`}
                              onPress={() => props.navigation.navigate(getPosScreenName())}
                          >
                            <Icon name={"cart"} style={tw`text-white mr-1`} size={16} />
                            <Text style={tw`text-white font-medium`}>POS</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                              style={tw`border border-gray-200 rounded px-3 py-2 flex items-center flex-row`}
                              onPress={() => setShowDatePicker(true)}
                          >
                            <Icon name={"calendar-range-outline"} size={18} style={tw`mr-1`}/>
                            <Text>{formatDate(dateRange[0])} - {formatDate(dateRange[1])}</Text>
                          </TouchableOpacity>
                        </View>
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
                          <View style={tw`flex pb-20 mt-3`}>

                            <View style={tw`mb-3 flex items-center justify-between flex-row`}>
                              <View
                                  style={tw`p-1 w-1/2`}
                              >
                                <View style={tw`bg-white p-3 flex items-center`}>
                                  <Text style={tw`font-bold text-lg text-gray-700`}>{orderStats && orderStats.revenue && formatVND(orderStats.revenue.amount)}</Text>
                                  <Text style={tw`text-xs text-gray-500`}>Doanh thu</Text>
                                </View>
                              </View>
                              <View
                                  style={tw`p-1 w-1/2`}
                              >
                                <View style={tw`bg-white p-3 flex items-center`}>
                                  <Text style={tw`font-bold text-lg text-gray-700`}>{orderStats && orderStats.revenue && formatVND(orderStats.revenue.earned)}</Text>
                                  <Text style={tw`text-xs text-gray-500`}>Lợi nhuận</Text>
                                </View>
                              </View>
                            </View>

                            <View style={tw`mb-3 bg-white`}>
                              <View style={tw`border-b border-gray-100 px-3 py-3 flex flex-row items-center justify-between`}>
                                <View style={tw`flex flex-row items-center`}>
                                  <Text style={tw`font-medium text-gray-800`}>Đơn hàng</Text>
                                </View>
                                <TouchableOpacity style={tw`flex flex-row items-center`} onPress={() => props.navigation.navigate('MartOrders')}>
                                  <Text style={tw`text-gray-500`}>Danh sách đơn hàng</Text>
                                  <Icon name={"chevron-right"} size={18} style={tw`text-gray-500`} />
                                </TouchableOpacity>
                              </View>

                              <View style={tw`flex flex-row justify-between p-3`}>
                                <TouchableOpacity
                                    onPress={() => props.navigation.navigate('MartOrders', {position: 1})}
                                    style={tw`p-1 w-1/3`}
                                >
                                  <View style={tw`flex items-center bg-gray-100 rounded p-2`}>
                                    <Text style={tw`font-bold text-lg text-gray-700`}>{orderStats && formatNumber(orderStats.chothanhtoan)}</Text>
                                    <Text style={tw`text-xs`}>Chờ thanh toán</Text>
                                  </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => props.navigation.navigate('MartOrders', {position: 2})}
                                    style={tw`p-1 w-1/3`}
                                >
                                  <View style={tw`flex items-center bg-gray-100 rounded p-2`}>
                                    <Text style={tw`font-bold text-lg text-gray-700`}>{orderStats && formatNumber(orderStats.danhanhang)}</Text>
                                    <Text style={tw`text-xs`}>Đã nhận hàng</Text>
                                  </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => props.navigation.navigate('MartOrders', {position: 3})}
                                    style={tw`p-1 w-1/3`}
                                >
                                  <View style={tw`flex items-center bg-gray-100 rounded p-2`}>
                                    <Text style={tw`font-bold text-lg text-gray-700`}>{orderStats && formatNumber(orderStats.dahuy)}</Text>
                                    <Text style={tw`text-xs`}>Đã huỷ</Text>
                                  </View>
                                </TouchableOpacity>
                              </View>
                            </View>

                            <View style={tw`mb-3 bg-white`}>
                              <View style={tw`px-3 py-3 flex flex-row items-center justify-between`}>
                                <View style={tw`flex flex-row items-center`}>
                                  <Text style={tw`font-medium text-gray-800`}>Đơn hàng mới nhất</Text>
                                </View>
                              </View>
                              {lastOrders && lastOrders.list.length === 0 ?
                                  <View style={tw`p-3`}>
                                    <Text>Chưa có đơn hàng</Text>
                                  </View>
                                  :
                                  <View>
                                    {lastOrders && lastOrders.list.map((el) => (
                                        <TouchableOpacity
                                            key={el.id}
                                            style={tw`border-t border-gray-100 flex items-center flex-row justify-between p-3`}
                                            onPress={() => props.navigation.navigate("MartOrderDetail", {
                                              id: el.id
                                            })}
                                        >
                                          <View>
                                            <Text style={tw`font-medium text-green-600`}>#{el.id}</Text>
                                            <Text style={tw`text-xs`}>Trạng thái: {el.status}</Text>
                                          </View>
                                          <View>
                                            <Text style={tw`font-medium`}>{formatVND(el.amount)}</Text>
                                          </View>
                                        </TouchableOpacity>
                                    ))}
                                  </View>
                              }
                            </View>

                            {/* Conditionally render the warehouse section */}
                            {canShowWarehouse && (
                                <View style={tw`mb-3 bg-white`}>
                                  <View style={tw`px-3 py-3 flex flex-row items-center justify-between`}>
                                    <View style={tw`flex flex-row items-center`}>
                                      <Text style={tw`font-medium text-gray-800`}>Kho hàng</Text>
                                    </View>
                                  </View>

                                  <View>
                                    <TouchableOpacity
                                        onPress={() => props.navigation.navigate("MartWarehouse")}
                                        style={tw`flex items-center justify-between flex-row p-3 border-t border-gray-100`}
                                    >
                                      <View style={tw`flex flex-row items-center`}>
                                        <Icon name={"cube-outline"} style={tw`mr-2`} size={18} />
                                        <Text>
                                          Sản phẩm trong kho
                                        </Text>
                                      </View>
                                      <Icon name={"chevron-right"} size={16} />
                                    </TouchableOpacity>
                                  </View>
                                </View>
                            )}

                            <View style={tw`mb-3 bg-white`}>
                              <View style={tw`px-3 py-3 flex flex-row items-center justify-between`}>
                                <View style={tw`flex flex-row items-center`}>
                                  <Text style={tw`font-medium text-gray-800`}>Thông tin siêu thị</Text>
                                </View>
                                <TouchableOpacity style={tw`flex flex-row items-center`} onPress={() => props.navigation.navigate('MartInfoSettings')}>
                                  <Text style={tw`text-gray-500`}>Cập nhật</Text>
                                  <Icon name={"chevron-right"} size={18} style={tw`text-gray-500`} />
                                </TouchableOpacity>
                              </View>

                              <View>
                                <View style={tw`border-t border-gray-100 p-3`}>
                                  <Text>Tên: <Text>{result && result.martInfo && result.martInfo.name}</Text></Text>
                                </View>
                                <View style={tw`border-t border-gray-100 p-3`}>
                                  <Text>Địa chỉ: <Text>{result && result.martInfo && result.martInfo.address}</Text></Text>
                                </View>
                                <View style={tw`border-t border-gray-100 p-3`}>
                                  <Text>Điện thoại: <Text>{result && result.martInfo && result.martInfo.phone}</Text></Text>
                                </View>
                              </View>
                            </View>
                          </View>
                        </ScrollView>
                        <DatePicker
                            isVisible={showDatePicker}
                            mode={'range'}
                            onCancel={() => setShowDatePicker(false)}
                            onConfirm={(output) => {
                              setShowDatePicker(false)
                              setDateRange([output.startDateString, output.endDateString])
                            }}
                        />
                      </View>
                  :
                  <View style={tw`p-3 rounded bg-gray-50 border border-gray-200 m-3`}>
                    <View style={tw`flex items-center flex-row mb-2`}>
                      <Icon name={"information-outline"} style={tw`mr-2`} size={16} />
                      <Text style={tw`font-medium`}>Thông báo</Text>
                    </View>
                    <Text>{error.message}</Text>
                  </View>
            }
            {error && error.statusCode === 404 &&
                <MartRegisterForm
                    onSubmit={handleRequestOpen}
                    settings={settings && settings}
                    currentUser={currentUser && currentUser}
                    loading={loading} // Pass loading state to form to disable submit button
                />
            }
          </View>
  );
}

export default MyMart;
