import React, {useEffect, useState} from 'react';
import {ActivityIndicator, RefreshControl, ScrollView, StatusBar, Text, TouchableOpacity, View} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import {useIsFocused} from "@react-navigation/native";
import {formatDateTime} from "app/utils/helper.js";
import moment from "moment";
import {showMessage} from "react-native-flash-message";

function CompanyCheckin(props) {
    const isFocused = useIsFocused();
    const id = props.route.params.id;
    const [error, setError] = useState(false);
    const [result, setResult] = useState(true);
    const [disabled, setDisabled] = useState(false);

    useEffect(() => {
        props.navigation.setOptions({
            title: 'Chấm công',
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
                const Token = await AsyncStorage.getItem('sme_user_token');
                axios({
                    method: 'get',
                    url: `${apiConfig.BASE_URL}/member/company/check/${id}`,
                    headers: {Authorization: `Bearer ${Token}`},
                }).then(function(response) {
                    if (response.status === 200) {
                        console.log(response.data);
                        setResult(response.data)
                    }
                }).catch(function(error) {
                    //history.push('/404')
                    setError(true)
                })
            }

            getData();
        }
    }, [isFocused, id])

    async function handleRollup() {
        setDisabled(true)
        const Token = await AsyncStorage.getItem('sme_user_token');
        axios({
            method: 'post',
            url: `${apiConfig.BASE_URL}/member/company/checkin/${id}`,
            data: {},
            headers: {Authorization: `Bearer ${Token}`},
        }).then(function (response) {
            showMessage({
                message: `Đã xác nhận ${result && result.status} ${result && result.company.name}`,
                type: 'success',
                icon: 'success',
                duration: 3000,
            });
            props.navigation.navigate('Home')
        }).catch(function(error){
            console.log(error);
            setDisabled(false)
            showMessage({
                message: error.response.data.message,
                type: 'success',
                icon: 'success',
                duration: 3000,
            });
        })
    }

    return (
        !result ? <ActivityIndicator /> :
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
                                        <Text  style={tw`text-gray-600`}>Không tìm thấy thông tin doanh nghiệp</Text>
                                    </View>
                                    :
                                    <View style={tw`py-10`}>
                                        <View style={tw`flex items-center mb-5`}>
                                            <Text style={tw`text-lg font-bold text-gray-700`}>{result && result.company && result.company.name}</Text>
                                        </View>
                                        <View style={tw`flex items-center mb-2`}>
                                            <Text>{result && result.company && result.company.address}</Text>
                                        </View>
                                        <View style={tw`flex items-center mb-10`}>
                                            <Text>{formatDateTime(moment())}</Text>
                                        </View>
                                        <View>
                                            <TouchableOpacity
                                                disabled={disabled}
                                                onPress={() => handleRollup()}
                                                style={tw`w-full block bg-green-600 py-3 rounded flex items-center`}
                                            >
                                                <Text style={tw`text-white uppercase font-medium text-lg`}>Xác nhận {result && result.status}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                }
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
    );
}

export default CompanyCheckin;
