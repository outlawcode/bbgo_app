import React, {useEffect, useState} from "react";
import {FlatList, RefreshControl, ScrollView, Text, TouchableOpacity, View} from "react-native";
import {useDispatch, useSelector} from "react-redux";
import tw from "twrnc";
import {formatBalance, formatVND} from "app/utils/helper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import moment from "moment";
import axios from "axios";
import apiConfig from "app/config/api-config";
import AsyncStorage from "@react-native-community/async-storage";
import TransactionItem from "app/components/TransactionItem";
import {useIsFocused} from "@react-navigation/native";
import DatePicker from 'react-native-neat-date-picker'
import {LoadDataAction} from "app/screens/Auth/action";
import WithdrawBankScreen from "app/screens/RewardWallet/WithdrawBankScreen";
import DepositPointScreen from "app/screens/PointWallet/DepositPointScreen";
import ClaimPointScreen from "app/screens/PointWallet/ClaimPointScreen";

function PointWalletScreen(props) {
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
						wallet: 'Ví điểm'
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
			async function getMe() {
				const token = await AsyncStorage.getItem('sme_user_token');
				axios({
					method: 'get',
					url: `${apiConfig.BASE_URL}/auth/customer/me`,
					headers: {Authorization: `Bearer ${token}`}
				}).then(function (response) {
					if (response.status === 200) {
						dispatch(LoadDataAction(response.data))
						setRefresh(false)
					}
				}).catch(function(error){
					console.log(error);
				})
			}
			getMe();
		}
	}, [dispatch, limit, page, dateRange, flag, refresh, isFocused])

	return (
		<View style={tw`flex bg-white min-h-full content-between`}>
			<View style={tw`bg-blue-500 px-3 pt-12 pb-3`}>
				<View style={tw`flex flex-row items-center justify-between`}>
					<TouchableOpacity
						onPress={() => props.navigation.goBack()}
					>
						<Icon name={"chevron-left"} size={30} style={tw`text-white`} />
					</TouchableOpacity>
				</View>

				<View style={tw`bg-blue-500 pb-2`}>
					<View style={tw`flex items-center`}>
						<Text style={tw`text-white mb-3 font-medium text-lg`}>Ví điểm {settings && settings.point_code}</Text>
						<Text style={tw`text-white text-xs mb-1`}>Số dư ví</Text>
						<Text style={tw`text-white font-bold text-4xl`}>{currentUser && formatBalance(currentUser.pointWallet)} <Text style={tw`text-xs font-medium`}>{settings && settings.point_code}</Text></Text>
					</View>
				</View>

				<View style={tw`flex flex-row items-center justify-between mt-5`}>
					<TouchableOpacity
						style={tw`flex flex-row items-center`}
						onPress={() => props.navigation.navigate('Modal', {
							content: <DepositPointScreen
								navigation={props.navigation}
								backScreen={'PointWallet'}
							/>
						})}
					>
						<Icon name={"tray-arrow-down"} size={24} style={tw`text-white mr-1`} />
						<Text style={tw`text-white`}>Nạp điểm</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={tw`flex flex-row items-center`}
						onPress={() => props.navigation.navigate('Modal', {
							content: <ClaimPointScreen
								navigation={props.navigation}
								backScreen={'PointWallet'}
								balance={currentUser && currentUser.pointWallet}
							/>
						})}
					>
						<Icon name={"tray-arrow-up"} size={24} style={tw`text-white mr-1`} />
						<Text style={tw`text-white`}>Rút điểm</Text>
					</TouchableOpacity>
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
						titleColor="red"
						tintColor="red"
					/>
				}
			>
				<View style={tw`pb-64`}>

					<View style={tw`px-3`}>
						<View style={tw`flex flex-row items-center justify-between mb-3 pt-5`}>
							<View style={tw`flex flex-row items-center`}>
								{/*<Icon name={"history"} size={18} style={tw`mr-1 text-green-600`} />*/}
								<Text style={tw`font-medium text-gray-500`}>Lịch sử giao dịch ví</Text>
							</View>

							{/*<DateRangeSelect />*/}
							{/*<TouchableOpacity
								style={tw`border border-gray-200 rounded px-3 py-2 flex items-center flex-row`}
								onPress={() => setShowDatePicker(true)}
							>
								<Icon name={"calendar-range-outline"} size={18} style={tw`mr-1`}/>
								<Text  >{formatDate(dateRange[0])} - {formatDate(dateRange[1])}</Text>
							</TouchableOpacity>*/}
						</View>
						{transactions && transactions.list && transactions.list.length > 0 ?
							/*<FlatList
								data={transactions.list}
								renderItem={({item}) => <TransactionItem item={item} navigation={props.navigation}/>}
							/>*/
							<FlatList
								data={transactions && transactions.list}
								renderItem={({item}) => <TransactionItem item={item} navigation={props.navigation} settings={settings}/>}
								/*refreshControl={
									<RefreshControl
										refreshing={refresh}
										onRefresh={() => setRefresh(true)}
										title="đang tải"
										titleColor="#a7a7a7"
									/>
								}*/
								keyExtractor={(item) => item.id}
								//ListEmptyComponent={() => (<NotFoundOrder />)}
								removeClippedSubviews={true} // Unmount components when outside of window
								initialNumToRender={4} // Reduce initial render amount
								maxToRenderPerBatch={1} // Reduce number in each render batch
								updateCellsBatchingPeriod={100} // Increase time between renders
								windowSize={7} // Reduce the window size
							/>
							:
							<View style={tw`flex items-center my-5`}>
								<Icon name={"reload-alert"} size={50} style={tw`mb-3 text-gray-300`} />
								<Text style={tw`text-gray-600`}>Không có giao dịch</Text>
							</View>
						}
						{/*{transactions && transactions.list && transactions.list.length > 0 ?
							transactions.list.map((item, index) => (
								<TransactionItem key={index} item={item} navigation={props.navigation}/>
							))
							:
							<View style={tw`flex items-center my-5`}>
								<Icon name={"reload-alert"} size={50} style={tw`mb-3 text-gray-300`} />
								<Text style={tw`text-gray-600`}>Không có giao dịch</Text>
							</View>
						}*/}
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

export default PointWalletScreen;
