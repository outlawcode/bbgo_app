import React, { useEffect, useState } from "react";
import { FlatList, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import tw from "twrnc";
import { formatDate, formatDateTime, formatDateUS, formatVND } from "app/utils/helper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import moment from "moment";
import axios from "axios";
import { apiClient } from "app/services/client";
import apiConfig from "app/config/api-config";
import AsyncStorage from "@react-native-community/async-storage";
import { TransactionType } from "app/models/commons/transaction.model";
import TransactionItem from "app/components/TransactionItem";
import { useIsFocused } from "@react-navigation/native";
import DatePicker from 'react-native-neat-date-picker'

function ProductWalletScreen(props) {
	const isFocused = useIsFocused();
	const dispatch = useDispatch()
	const currentUser = useSelector(state => state.memberAuth.user);
	const settings = useSelector(state => state.SettingsReducer.options);
	const [refresh, setRefresh] = useState(false);
	const [flag, setFlag] = useState(false);
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [transactions, setTransactions] = useState();
	const [limit, setLimit] = useState(10);
	const [page, setPage] = useState(1);
	const [dateRange, setDateRange] = useState(
		[
			moment.utc(moment().clone().startOf('month').format('YYYY-MM-DD')),
			moment.utc(moment().clone().endOf('month').format("YYYY-MM-DD"))
		]
	)

	useEffect(() => {
		if (isFocused) {
			async function getPackageInfo() {
				const Token = await AsyncStorage.getItem('sme_user_token');
				axios({
					method: 'get',
					url: `${apiConfig.BASE_URL}/member/transactions`,
					params: {
						limit: 0,
						page,
						rangeStart: '2022-01-01',
						rangeEnd: '2050-01-01',
						wallet: 'Ví đầu tư'
					},
					headers: { Authorization: `Bearer ${Token}` }
				}).then(function(response) {
					if (response.status === 200) {
						setTransactions(response.data)
						setRefresh(false)
					}
				}).catch(function(error) {
					//history.push('/404')
					console.log(error);
					setRefresh(false)
				})
			}

			getPackageInfo();
		}
	}, [dispatch, limit, page, dateRange, flag, refresh, isFocused])

	return (
		<View style={tw`flex bg-white min-h-full content-between`}>
			<View style={tw`bg-green-600 px-3 pt-12 pb-3`}>
				<View style={tw`flex flex-row items-center justify-between`}>
					<TouchableOpacity
						onPress={() => props.navigation.goBack()}
					>
						<Icon name={"chevron-left"} size={30} style={tw`text-white`} />
					</TouchableOpacity>
				</View>
				<View style={tw`bg-green-600 pb-2`}>
					<View style={tw`flex items-center`}>
						<Text  style={tw`text-white mb-3 font-medium text-lg`}>Ví đầu tư</Text>
						<Text  style={tw`text-white text-xs mb-1`}>Số dư ví</Text>
						<Text  style={tw`text-white font-bold text-4xl`}>{currentUser && formatVND(currentUser.investmentWallet)}</Text>
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
						titleColor="blue"
						tintColor="blue"
					/>
				}
			>
				<View style={tw`pb-64`}>

					<View style={tw`px-3`}>
						<View style={tw`flex flex-row items-center mb-3 pt-5`}>
							<Text  style={tw`font-medium text-gray-500`}>Lịch sử ví</Text>
						</View>
						{transactions && transactions.list && transactions.list.length > 0 ?
							<FlatList
								data={transactions && transactions.list}
								renderItem={({item}) => <TransactionItem item={item} navigation={props.navigation}/>}
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
								<Text  style={tw`text-gray-600`}>Chưa có dữ liệu</Text>
							</View>
						}
					</View>

				</View>
			</ScrollView>
			<DatePicker
				isVisible={showDatePicker}
				mode={'range'}
				onCancel={() => setShowDatePicker(false)}
				onConfirm={(start, end) => console.log(start, end)}
			/>
		</View>
	);
}

export default ProductWalletScreen;
