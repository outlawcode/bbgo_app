import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import { useIsFocused } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { showMessage } from "react-native-flash-message";
import { GetMe, memberLogout } from "app/screens/Auth/action.js";
import { emptyCart } from "app/screens/Cart/action.js";
import { formatDateUS, formatNumber, formatVND } from "app/utils/helper.js";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import InputSpinner from "react-native-input-spinner";
import Modal from "react-native-modal";
import PaymentOrder from "app/screens/MyMart/POS/PaymentOrder.js";
import CheckoutCompleted from "app/screens/CheckOut/CheckoutCompleted.js";
import BarCodeScanner from "app/screens/MyMart/POS/BarcodeScanner.js";

const SCREEN_HEIGHT = Dimensions.get("window").height;

function POSScreen(props) {
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.memberAuth.user);
  const settings = useSelector(state => state.SettingsReducer.options)

  useEffect(() => {
    props.navigation.setOptions({
      title: 'SME POS',
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

  const [note, setNote] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [newOrderId, setNewOrderId] = useState(null)
  const [showDetail, setShowDetail] = useState(true)
  const [tabs, setTabs] = useState([1, 2, 3]);
  const [activeTab, setActiveTab] = useState(1);

  const [lastItem, setLastItem] = useState(3)

  const [tabItems, setTabItems] = useState([
    {
      tab: 1,
      items: [],
      totalAmount: 0
    },
    {
      tab: 2,
      items: [],
      totalAmount: 0
    },
    {
      tab: 3,
      items: [],
      totalAmount: 0
    },
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [searchResult, setSearchResult] = useState({
    list: [],
    count: 0
  })

  useEffect(() => {
    if (Number(searchQuery.length) > 2) {
      setLoading(true)
      setShowResult(true)
      async function getData() {
        const token = await AsyncStorage.getItem('sme_user_token');
        axios({
          method: 'get',
          url: `${apiConfig.BASE_URL}/member/shop-product-stock/search`,
          params: {
            query: searchQuery
          },
          headers: { Authorization: `Bearer ${token}` }
        }).then(function(response) {
          if (response.status === 200) {
            setSearchResult(response.data)
            setLoading(false)
            if (response.data.list.length === 0) {
              setNotFound(true)
            } else {
              setNotFound(false)
            }
          }
        }).catch(function(error) {
          setLoading(false)
          setNotFound(true)
        })
      }

      getData();
    } else {
      setSearchResult({
        list: [],
        count: 0
      })
      setShowResult(false)
    }
  }, [searchQuery])

  function handleChoose(item) {
    console.log(item);
    if (Number(item.inStock === 0)) {
      ErrorMessage({message: 'Đã hết hàng trong kho, vui lòng chọn sản phẩm khác!'})
    } else {
      setShowResult(false)
      setSearchQuery('')
      // check xem dang su dung tab nao
      const tabIndex = tabItems.findIndex(i => i.tab === activeTab);
      if (tabIndex !== -1) {
        const currentTab = tabItems[tabIndex]
        const itemIndex = currentTab.items.findIndex(x => x.id === Number(item.id))
        let newArr = currentTab.items;
        if (itemIndex !== -1) {
          let currentItem = currentTab.items[itemIndex];
          let quantity = Number(currentItem.quantity) + Number(1)
          if ((Number(currentItem.quantity) + Number(1)) < Number(item.inStock)) {
            quantity = Number(currentItem.quantity) + Number(1)
          } else {
            quantity = currentItem.quantity
          }
          let newItem = {
            ...item,
            quantity
          }
          newArr = [
            ...currentTab.items.slice(0, itemIndex),
            newItem,
            ...currentTab.items.slice(itemIndex + 1)
          ]
        } else {
          newArr = [{
            ...item,
            quantity: 1
          }, ...currentTab.items]
        }
        let newTabItem = {
          ...currentTab,
          items: newArr
        }
        const newArrTabs = [
          ...tabItems.slice(0, tabIndex),
          newTabItem,
          ...tabItems.slice(tabIndex + 1)
        ]
        setTabItems(newArrTabs)
      }
    }
  }

  function updateQuantity(data) {
    /*if (data.quantity === 0) {
      handleDeleteProduct(data.id)
    } else {*/
      const tabIndex = tabItems.findIndex(i => i.tab === activeTab);
      if (tabIndex !== -1) {
        const currentTab = tabItems[tabIndex]
        const currentTabItems = tabItems[tabIndex].items;
        const index = currentTabItems.findIndex(item => Number(item.id) === Number(data.id))
        if (index !== -1) {
          let currentItem = currentTabItems[index];
          let newItem = {
            ...currentItem,
            quantity: data.quantity
          }
          const newArrItems = [
            ...currentTabItems.slice(0, index),
            newItem,
            ...currentTabItems.slice(index + 1)
          ]
          let newTabItem = {
            ...currentTab,
            items: newArrItems
          }
          const newArrTabs = [
            ...tabItems.slice(0, tabIndex),
            newTabItem,
            ...tabItems.slice(tabIndex + 1)
          ]
          setTabItems(newArrTabs)
        }

      }
    /*}*/

  }

  function handleDeleteProduct(id) {
    Alert.alert(
      'Bạn chắc chắn muốn xoá sản phẩm này?',
      '',
      [
        {
          text: 'Không',
          onPress: () => console.log('No, continue buying'),
        },
        {
          text: 'Đúng vậy',
          onPress: () => {
            const tabIndex = tabItems.findIndex(i => i.tab === activeTab);
            if (tabIndex !== -1) {
              const currentTab = tabItems[tabIndex]
              const currentTabItems = tabItems[tabIndex].items;
              const newItemList = currentTabItems.filter(item => Number(item.id) !== Number(id))

              let newTabItem = {
                ...currentTab,
                items: newItemList
              }
              const newArrTabs = [
                ...tabItems.slice(0, tabIndex),
                newTabItem,
                ...tabItems.slice(tabIndex + 1)
              ]

              setTabItems(newArrTabs)
            }
          },
          style: 'cancel',
        },
      ],
      { cancelable: false },
    )
  }

  function handleCloseTab(tabId) {
    if (tabs.length === 1) {
      setTabs([1])
      setTabItems([
        {
          tab: 1,
          items: [],
          totalAmount: 0
        },
      ])
    } else {
      Alert.alert(
        'Bạn chắc chắn muốn đóng hoá đơn này?',
        '',
        [
          {
            text: 'Không',
            onPress: () => console.log('No, continue buying'),
          },
          {
            text: 'Đúng vậy',
            onPress: () => {
              const newArr = tabs.filter(tab => tab !== tabId)
              const newTabItems = tabItems.filter(item => item.tab !== tabId)
              setTabs(newArr)
              setTabItems(newTabItems)
            },
            style: 'cancel',
          },
        ],
        { cancelable: false },
      )
    }
  }

  function handleAddTab() {
    if (tabs.length === 6) {
      showMessage({
        message: 'Mở tối đa 6 hoá đơn cùng lúc để làm việc hiệu quả nhất!',
        type: 'danger',
        icon: 'danger',
        duration: 3000,
      });
    } else {
      const lastItemCheck = tabs.slice(-1)[0]
      if (lastItemCheck >= 0) {
        setLastItem(lastItemCheck + 1)
        setTabItems([...tabItems, {
          tab: lastItemCheck + 1,
          items: [],
          totalAmount: 0
        }])
      }
    }
  }

  useEffect(() => {
    if (lastItem > tabs.length) {
      setTabs([...tabs, lastItem])
    }
  }, [lastItem])

  useEffect(() => {
    setActiveTab(tabs[0])
  }, [tabs])

  function calculator(dataItems) {
    let subTotal = 0;
    let totalDiscount = 0;

    dataItems.map((el) => {
      subTotal += Number(el.price) * Number(el.quantity);
      totalDiscount += Number(el.price)*Number(el.quantity)*Number(el.giamgiaPercent)/100
    })

    const vatPercent = Number(settings && settings.vat_percent)
    const totalAmount = Number(subTotal) - Number(totalDiscount)
    const totalAmountVAT = Number(totalAmount) * Number(vatPercent)/100;
    const lastTotalAmount = Number(totalAmount) + Number(totalAmountVAT)

    return {
      subTotal,
      totalDiscount,
      totalAmount,
      totalAmountVAT,
      lastTotalAmount,
    }
  }

  async function handleCreateOrder() {
    const tabIndex = tabItems.findIndex(i => i.tab === activeTab);
    if (tabIndex !== -1) {
      const currentTab = tabItems[tabIndex]
      const itemsOrder = currentTab.items;
      if (itemsOrder.length > 0) {
        const token = await AsyncStorage.getItem('sme_user_token');
        return axios({
          method: 'post',
          url: `${apiConfig.BASE_URL}/member/order/create-offline`,
          data: {
            items: JSON.stringify(itemsOrder),
            note
          },
          headers: {Authorization: `Bearer ${token}`}
        }).then(function (response) {
          if (response.status === 201) {
            setShowModal(true);
            setNewOrderId(response.data.id)
            showMessage({
              message: 'Đã tạo đơn hàng, vui lòng thanh toán!',
              type: 'success',
              icon: 'success',
              duration: 3000,
            });
          }
        }).catch(function(error){
          showMessage({
            message: error.response.data.message,
            type: 'danger',
            icon: 'danger',
            duration: 3000,
          });
          console.log(error);
        })
      } else {
        showMessage({
          message: 'Có lỗi xảy ra, vui lòng thử lại hoặc liên hệ hỗ trợ!',
          type: 'danger',
          icon: 'danger',
          duration: 3000,
        });
      }
    } else {
      showMessage({
        message: 'Có lỗi xảy ra, vui lòng thử lại hoặc liên hệ hỗ trợ!',
        type: 'danger',
        icon: 'danger',
        duration: 3000,
      });
    }
  }

  return (
    <View style={tw`flex bg-white h-full`}>
      <View>
        <Modal
          isVisible={showModal}
          //onBackdropPress={() => setShowModal(false)}
        >
          <View style={{backgroundColor: '#ffffff' }}>
            <PaymentOrder
              settings={settings && settings}
              orderId={newOrderId}
              onClose={() => {
                handleCloseTab(activeTab)
                setNewOrderId(null)
                setShowModal(false)
              }}
            />
          </View>
        </Modal>
      </View>

      <View>
        <Modal
          isVisible={showScanner}
          onBackdropPress={() => setShowScanner(false)}
        >
          <View>
            <BarCodeScanner
              navigation={props.navigation}
              onClose={() => setShowScanner(false)}
              onChoose={(value) => {
                setShowScanner(false)
                handleChoose(value)
              }}
            />
          </View>
        </Modal>
      </View>

      <View style={tw`bg-white mt-2`}>
        <View style={tw`flex flex-row items-center border-b border-gray-200`}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {tabs && tabs.map((el) => (
              <TouchableOpacity
                onPress={() => {
                  setActiveTab(el);
                  setShowResult(false);
                  setSearchQuery('')
                  setSearchResult({
                    list: [],
                    count: 0
                  })
                }}
                style={tw`${activeTab === el ? 'bg-green-600' : 'bg-white'} rounded-tl-md rounded-tr-md py-3 px-4`}
              >
                <Text style={tw`${activeTab === el ? 'text-white font-bold' : 'text-gray-700 font-medium'}`}>Hoá đơn {el}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={tw`flex flex-row items-center mr-2 bg-gray-500 p-2 rounded-md`}
            onPress={() => handleAddTab()}
          >
            <Icon name={"plus"} size={16} style={tw`text-white`}/>
            <Text style={tw`text-white`}>Thêm</Text>
          </TouchableOpacity>
        </View>
        <View style={tw`flex items-center justify-between flex-row p-3 border-b border-gray-100`}>
          <View style={tw`flex-row items-center`}>
            <Icon name="magnify" size={18} style={tw`text-gray-500 mr-2`} />
            <TextInput
              autoFocus
              style={tw`android:h-20`}
              value={searchQuery}
              onChangeText={event => setSearchQuery(event)}
              placeholder="Tìm kiếm mã sản phẩm, tên sản phẩm..."
              returnKeyType={"done"}
            />
          </View>
          <TouchableOpacity
            onPress={() => setShowScanner(true)}
          >
            <Icon name={"barcode-scan"} size={28} />
          </TouchableOpacity>
        </View>
      </View>

      {showResult ?
        <View style={tw`bg-white h-full p-3`}>
          <View style={tw`flex items-center justify-between flex-row mb-3`}>
            <Text style={tw`text-gray-500`}>Kết quả tìm kiếm</Text>
            <TouchableOpacity
              onPress={() => {
                setShowResult(!showResult);
                setSearchQuery('')
              }}
            >
              <Icon name={"close-circle"} size={18} style={tw`text-red-500`} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            <View style={tw`pb-32`}>
              {loading ? <ActivityIndicator /> :
                notFound ? <View style={tw`flex items-center`}>
                    <Icon name={"magnify-expand"} size={28} style={tw`text-gray-300 mb-2`} />
                    <Text style={tw`text-gray-500`}>Không tìm thấy sản phẩm / hàng hoá</Text>
                  </View>
                  :
                  searchResult.list.length > 0 &&
                  searchResult.list.map((el) => (
                    <View style={tw`py-3 border-b border-gray-100`}>
                      <TouchableOpacity
                        onPress={() => handleChoose(el)}
                      >
                        <Text style={tw`font-medium mb-2`}>{el.name}</Text>
                        <View style={tw`flex items-center justify-between flex-row`}>
                          <Text>Mã: {el.SKU} - Kho: {formatNumber(el.inStock)}</Text>
                          <Text style={tw`font-medium text-green-600`}>{formatVND(el.price)}</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  ))
              }
            </View>
          </ScrollView>
        </View>
        :
        tabItems.map((item) => (
          item.tab === activeTab &&
          <View style={tw`flex bg-white h-full`}>
            <ScrollView>
              <View style={tw`pb-52`}>
                {item.items.length > 0 ?
                  item.items.map((el, index) => (
                    <View style={tw`p-3 border-b border-gray-200 flex flex-row items-center justify-between`}>
                      <View style={tw`w-1/2 flex items-center flex-row`}>
                        <TouchableOpacity
                          onPress={() => handleDeleteProduct(el.id)}
                        >
                          <Icon name={"delete"} size={24} style={tw`mr-3 text-gray-500`} />
                        </TouchableOpacity>

                        <Text numberOfLines={2} ellipsizeMode={"head"}>{el.name}</Text>
                      </View>
                      <InputSpinner
                        max={el.inStock}
                        min={1}
                        step={1}
                        height={36}
                        width={130}
                        style={tw`shadow-none border border-gray-200`}
                        colorMax={"#f04048"}
                        colorMin={"#cbcbcb"}
                        colorPress={"#949494"}
                        value={Number(el.quantity)}
                        onChange={(num) => {
                          //handleChangeQuantity(item.id, num)
                          updateQuantity({id: el.id, quantity: num})
                        }}
                      />
                    </View>
                  ))
                  :
                  <View style={tw`flex items-center m-5`}>
                    <Text>Vui lòng chọn sản phẩm cho vào đơn hàng</Text>
                  </View>
                }
              </View>
            </ScrollView>
            <View
              style={tw`absolute bottom-24 android:bottom-38 bg-white w-full pt-3 pb-5 shadow-lg px-3`}
            >
              {showDetail &&
                <View>
                  <View style={tw`flex flex-row items-center justify-between py-2 border-b border-gray-100 mb-2`}>
                    <Text>Khuyến mại từ Nhà cung cấp</Text>
                    <Text style={tw`text-red-500`}>-{formatVND(calculator(item.items).totalDiscount)}</Text>
                  </View>
                  <View style={tw`flex flex-row items-center justify-between py-2 border-b border-gray-100 mb-2`}>
                    <Text>Tạm tính (Đã bao gồm VAT)</Text>
                    <Text>{formatVND(Number(calculator(item.items).totalAmount) + Number(calculator(item.items).totalAmountVAT))}</Text>
                  </View>
                </View>
              }

              <View style={tw`flex items-center flex-row justify-between`}>
                <TouchableOpacity
                  onPress={() => setShowDetail(!showDetail)}
                >
                  <Text style={tw`text-xs font-medium`}>Tổng</Text>
                  <Text style={tw`text-base font-bold text-green-600`}>{formatVND(calculator(item.items).lastTotalAmount)}</Text>
                </TouchableOpacity>
                <View style={tw`flex items-center flex-row`}>
                  <TouchableOpacity
                    style={tw`bg-red-50 mr-3 p-2 rounded border border-red-100 flex items-center flex-row`}
                    onPress={() => handleCloseTab(item.tab)}
                  >
                    <Icon name={"close"} style={tw`text-red-500`} size={16}/>
                    <Text style={tw`text-red-500`}>Đóng</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={tw`bg-green-600 p-2 rounded border border-blue-600 flex items-center flex-row`}
                    onPress={() => handleCreateOrder()}
                  >
                    <Text style={tw`text-white font-medium`}>Thanh toán</Text>
                    <Icon name={"chevron-right"} style={tw`text-white`} size={16} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))
      }
    </View>
  );
}

export default POSScreen;
