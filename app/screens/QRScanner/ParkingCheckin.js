import React, {useEffect, useState} from 'react';
import {ActivityIndicator, RefreshControl, ScrollView, StatusBar, Text, TouchableOpacity, View} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import {useIsFocused} from "@react-navigation/native";
import { formatDateTime, formatVND } from "app/utils/helper.js";
import moment from "moment";
import {showMessage} from "react-native-flash-message";
import { useSelector } from "react-redux";

function ParkingCheckin(props) {
    const isFocused = useIsFocused();
    const id = props.route.params.id;
    const [error, setError] = useState(false);
    const [result, setResult] = useState();
    const [loading, setLoading] = useState(true);
    const [disabled, setDisabled] = useState(false);
    const currentUser = useSelector(state => state.memberAuth.user);
    const settings = useSelector(state => state.SettingsReducer.options)
    const [vehicleType, setVehicleType] = useState(null)
    const [licensePlate, setLicensePlate] = useState(null)

    useEffect(() => {
        props.navigation.setOptions({
            title: 'Gửi Xe',
            headerStyle: {
                backgroundColor: '#fff',
            },
            headerTintColor: '#000',
            headerLeft: () => (
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => props.navigation.goBack()}>
                    <Icon name="chevron-left"
                          size={32}
                          style={tw`ml-3`}
                    />
                </TouchableOpacity>
            ),
        })
    }, [])

    useEffect(() => {
        if (isFocused) {
            async function getData() {
                try {
                    setLoading(true);
                    setError(false);
                    
                    console.log('🚗 ParkingCheckin - ID:', id);
                    console.log('🚗 ParkingCheckin - URL:', `${apiConfig.BASE_URL}/parking/${id}`);
                    
                    // Use the public endpoint designed for QR scanning
                    const response = await axios({
                        method: 'get',
                        url: `${apiConfig.BASE_URL}/parking/${id}`,
                        // No authorization needed for public endpoint
                    });
                    
                    if (response.status === 200 && response.data) {
                        console.log('Parking info response:', response.data);
                        // The public endpoint returns parking object directly
                        setResult({
                            parking: response.data,
                            status: 'IN', // Default status
                            amount: 0,
                            paymentType: 'Theo giờ',
                            hours: 0,
                            days: 0
                        });
                    } else {
                        console.log('Unexpected response:', response);
                        setError(true);
                    }
                } catch (error) {
                    console.log('🚗 ParkingCheckin - Error details:', error.response || error);
                    setError(true);
                    if (error.response?.data?.message) {
                        showMessage({
                            message: error.response.data.message,
                            type: 'danger',
                            icon: 'danger',
                            duration: 3000,
                        });
                    }
                } finally {
                    setLoading(false);
                }
            }

            getData();
        }
    }, [isFocused, id])

    // Separate effect to get detailed parking check when vehicle is selected
    useEffect(() => {
        if (result && vehicleType && licensePlate) {
            async function updateParkingInfo() {
                try {
                    const Token = await AsyncStorage.getItem('sme_user_token');
                    const response = await axios({
                        method: 'get',
                        url: `${apiConfig.BASE_URL}/member/parking/check/${id}`,
                        params: {
                            vehicleType,
                            licensePlate,
                        },
                        headers: {Authorization: `Bearer ${Token}`},
                    });
                    
                    if (response.status === 200 && response.data) {
                        console.log('Updated parking info with vehicle:', response.data);
                        setResult(response.data);
                    }
                } catch (error) {
                    console.log('Error updating parking info:', error);
                    // Don't set error here, just log it
                }
            }

            updateParkingInfo();
        }
    }, [vehicleType, licensePlate, id])

    async function handleRollup() {
        if (!vehicleType || !licensePlate) {
            showMessage({
                message: `Vui lòng chọn phương tiện`,
                type: 'danger',
                icon: 'danger',
                duration: 3000,
            });
            setDisabled(false)
        } else {
            setDisabled(true)
            const Token = await AsyncStorage.getItem('sme_user_token');
            axios({
                method: 'post',
                url: `${apiConfig.BASE_URL}/member/parking/checkin/${id}`,
                data: {
                    vehicleType,
                    licensePlate
                },
                headers: { Authorization: `Bearer ${Token}` },
            }).then(function(response) {
                showMessage({
                    message: `Đã xác nhận xe ${result && result.status} ${result && result.parking.name}`,
                    type: 'success',
                    icon: 'success',
                    duration: 3000,
                });
                props.navigation.navigate('Home')
            }).catch(function(error) {
                console.log(error);
                setDisabled(false)
                showMessage({
                    message: error.response.data.message,
                    type: 'danger',
                    icon: 'danger',
                    duration: 3000,
                });
            })
        }
    }

    let vehicles = []
    if (currentUser && currentUser.vehicles) {
        vehicles = JSON.parse(currentUser.vehicles)
    }

    if (loading) {
        return (
            <View style={tw`flex-1 justify-center items-center`}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={tw`mt-2 text-gray-600`}>Đang tải thông tin...</Text>
            </View>
        );
    }

    return (
        <View>
            <StatusBar barStyle={"dark-content"}/>
            <View style={tw`flex bg-white min-h-full content-between`}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    overScrollMode={'never'}
                    scrollEventThrottle={16}
                >
                    <View style={tw`pb-32`}>
                        <View style={tw`mb-3 bg-white p-3`}>
                            {error ?
                                <View style={tw`flex items-center my-5`}>
                                    <Icon name={"home-search"} size={50} style={tw`mb-3 text-gray-300`} />
                                    <Text  style={tw`text-gray-600`}>Không tìm thấy thông tin khu gửi xe</Text>
                                </View>
                                :
                                <View style={tw`py-10`}>
                                    <View style={tw`flex items-center mb-5`}>
                                        <Text style={tw`text-lg font-bold text-gray-700`}>{result && result.parking && result.parking.name}</Text>
                                    </View>
                                    <View style={tw`flex items-center mb-2`}>
                                        <Text>{result && result.parking && result.parking.address}</Text>
                                    </View>
                                    <View style={tw`flex items-center mb-10`}>
                                        <Text>{formatDateTime(moment())}</Text>
                                    </View>
                                    {currentUser && (vehicles.length <= 0) ?
                                      <View style={tw`bg-red-50 p-3 rounded border border-red-200`}>
                                          <Text>
                                              Vui lòng cài đặt thông tin phương tiện của bạn trong mục Cài đặt tài khoản!
                                          </Text>
                                      </View>
                                      :
                                      <View style={tw`mb-5`}>
                                          <Text style={tw`mb-2`}>Chọn phương tiện</Text>
                                          {vehicles.map((el, index) => (
                                            <View key={index} style={tw`mb-3`}>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setVehicleType(el.vehicleType)
                                                        setLicensePlate(el.licensePlate)
                                                    }}
                                                    style={tw`${el.vehicleType === vehicleType && el.licensePlate === licensePlate ? 'bg-red-500' : 'bg-gray-100'} w-full block p-2 rounded flex items-center flex-row justify-between`}
                                                >
                                                    <View style={tw`flex items-center flex-row`}>
                                                        <Icon name={el.vehicleType === 'Ô tô' ? 'car' : 'motorbike'} size={32} style={tw`mr-3 ${el.vehicleType === vehicleType && el.licensePlate === licensePlate ? 'text-white' : 'text-gray-400'}`} />
                                                        <View>
                                                            <Text style={tw`${el.vehicleType === vehicleType && el.licensePlate === licensePlate ? 'text-white' : 'text-gray-500'} text-xs`}>{el.vehicleType}</Text>
                                                            <Text style={tw`${el.vehicleType === vehicleType && el.licensePlate === licensePlate ? 'text-white' : 'text-red-500'} font-medium text-base`}>{el.licensePlate}</Text>
                                                        </View>
                                                    </View>
                                                    {el.vehicleType === vehicleType && el.licensePlate === licensePlate &&
                                                        <View>
                                                            <Icon name={"check-circle"} size={20} style={tw`text-white`} />
                                                        </View>
                                                    }
                                                </TouchableOpacity>
                                            </View>
                                          ))}
                                      </View>
                                    }

                                    {result && result.amount > 0 &&
                                        <View style={tw`mb-5`}>
                                            <Text>Phí gửi xe: <Text style={tw`font-medium text-red-500`}>{formatVND(result && result.amount)}/{result && result.days} ngày</Text></Text>
                                        </View>
                                    }

                                    {licensePlate && vehicleType &&
                                      <View>
                                          <TouchableOpacity
                                            disabled={disabled}
                                            onPress={() => handleRollup()}
                                            style={tw`w-full block bg-green-600 py-3 rounded flex items-center`}
                                          >
                                              <Text style={tw`text-white uppercase font-medium text-lg`}>Xác nhận
                                                  xe {result && result.status}</Text>
                                          </TouchableOpacity>
                                      </View>
                                    }
                                </View>
                            }
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

export default ParkingCheckin;
                                          <Text>
                                              Vui lòng cài đặt thông tin phương tiện của bạn trong mục Cài đặt tài khoản!
                                          </Text>
                                      </View>
                                      :
                                      <View style={tw`mb-5`}>
                                          <Text style={tw`mb-2`}>Chọn phương tiện</Text>
                                          {vehicles.map((el, index) => (
                                            <View key={index} style={tw`mb-3`}>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setVehicleType(el.vehicleType)
                                                        setLicensePlate(el.licensePlate)
                                                    }}
                                                    style={tw`${el.vehicleType === vehicleType && el.licensePlate === licensePlate ? 'bg-red-500' : 'bg-gray-100'} w-full block p-2 rounded flex items-center flex-row justify-between`}
                                                >
                                                    <View style={tw`flex items-center flex-row`}>
                                                        <Icon name={el.vehicleType === 'Ô tô' ? 'car' : 'motorbike'} size={32} style={tw`mr-3 ${el.vehicleType === vehicleType && el.licensePlate === licensePlate ? 'text-white' : 'text-gray-400'}`} />
                                                        <View>
                                                            <Text style={tw`${el.vehicleType === vehicleType && el.licensePlate === licensePlate ? 'text-white' : 'text-gray-500'} text-xs`}>{el.vehicleType}</Text>
                                                            <Text style={tw`${el.vehicleType === vehicleType && el.licensePlate === licensePlate ? 'text-white' : 'text-red-500'} font-medium text-base`}>{el.licensePlate}</Text>
                                                        </View>
                                                    </View>
                                                    {el.vehicleType === vehicleType && el.licensePlate === licensePlate &&
                                                        <View>
                                                            <Icon name={"check-circle"} size={20} style={tw`text-white`} />
                                                        </View>
                                                    }
                                                </TouchableOpacity>
                                            </View>
                                          ))}
                                      </View>
                                    }

                                    {result && result.amount > 0 &&
                                        <View style={tw`mb-5`}>
                                            <Text>Phí gửi xe: <Text style={tw`font-medium text-red-500`}>{formatVND(result && result.amount)}/{result && result.days} ngày</Text></Text>
                                        </View>
                                    }

                                    {licensePlate && vehicleType &&
                                      <View>
                                          <TouchableOpacity
                                            disabled={disabled}
                                            onPress={() => handleRollup()}
                                            style={tw`w-full block bg-green-600 py-3 rounded flex items-center`}
                                          >
                                              <Text style={tw`text-white uppercase font-medium text-lg`}>Xác nhận
                                                  xe {result && result.status}</Text>
                                          </TouchableOpacity>
                                      </View>
                                    }
                                </View>
                            }
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

export default ParkingCheckin;