import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import { formatVND } from "app/utils/helper";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import { useIsFocused } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import TransactionItem from "app/components/TransactionItem";
import RewardItem from "app/screens/Rewards/components/RewardItem";
import CreateInvestmentScreen from "app/screens/StockWallet/CreateInvestmentScreen";

function YearlyRewardScreen(props) {
	const isFocused = useIsFocused();
	const dispatch = useDispatch()
	const [refresh, setRefresh] = useState(false);
	const [rewards, setRewards] = useState();
	const [stats, setStats] = useState();
	const settings = useSelector(state => state.SettingsReducer.options);
	
	useEffect(() => {
		if (isFocused) {
			async function getPackageInfo() {
				const Token = await AsyncStorage.getItem('sme_user_token');
				axios({
					method: 'get',
					url: `${apiConfig.BASE_URL}/customer/rewards`,
					params: {
						type: 'YEAR'
					},
					headers: { Authorization: `Bearer ${Token}` }
				}).then(function(response) {
					if (response.status === 200) {
						setRewards(response.data)
						setRefresh(false)
					}
				}).catch(function(error) {
					//history.push('/404')
					console.log(error);
					setRefresh(false)
				})
			}
			
			getPackageInfo();
			
			async function getStats() {
				const token = await AsyncStorage.getItem('sme_user_token');
				axios({
					method: 'get',
					url: `${apiConfig.BASE_URL}/customer/order/revenuestats`,
					headers: {Authorization: `Bearer ${token}`}
				}).then(function (response) {
					if (response.status === 200) {
						setStats(response.data)
					}
				}).catch(function(error){
					console.log(error);
				})
			}
			getStats();
		}
	}, [dispatch, refresh, isFocused])
	
	const rewardInfo = () => {
		return (
			<View style={tw`p-3`}>
				<View style={tw`flex-row items-center justify-between mb-3 border-b border-gray-200 pb-3`}>
					<Text style={tw`uppercase font-medium`}>Chính sách thưởng hàng năm</Text>
					<TouchableOpacity
						onPress={() => props.navigation.navigate('YearlyReward')}
					>
						<Icon name="close" size={26}/>
					</TouchableOpacity>
				</View>
				<View style={tw`flex flex-row items-center justify-between pb-3 mb-3 border-b border-gray-200`}>
					<Text  >Doanh số &ge; {formatVND(settings && settings.reward_yearly_level1)}</Text>
					<Text  >Thưởng {settings && settings.reward_yearly_level1_percent}%</Text>
				</View>
				<View style={tw`flex flex-row items-center justify-between pb-3 mb-3 border-b border-gray-200`}>
					<Text  >Doanh số &ge; {formatVND(settings && settings.reward_yearly_level2)}</Text>
					<Text  >Thưởng {settings && settings.reward_yearly_level2_percent}%</Text>
				</View>
				<View style={tw`flex flex-row items-center justify-between pb-3 mb-3 border-b border-gray-200`}>
					<Text  >Doanh số &ge; {formatVND(settings && settings.reward_yearly_level3)}</Text>
					<Text  >Thưởng {settings && settings.reward_yearly_level3_percent}%</Text>
				</View>
				<View style={tw`flex flex-row items-center justify-between pb-3 mb-3 border-b border-gray-200`}>
					<Text  >Doanh số &ge; {formatVND(settings && settings.reward_yearly_level4)}</Text>
					<Text  >Thưởng {settings && settings.reward_yearlyly_level4_percent}%</Text>
				</View>
			</View>
		)
	}
	
	return (
		<View style={tw`flex bg-white min-h-full content-between`}>
			<View style={tw`bg-purple-500 px-3 pt-12 pb-3`}>
				<View style={tw`flex flex-row items-center justify-between`}>
					<TouchableOpacity
						onPress={() => props.navigation.goBack()}
					>
						<Icon name={"chevron-left"} size={30} style={tw`text-white`} />
					</TouchableOpacity>
					<TouchableOpacity
						style={tw`flex flex-row items-center`}
						onPress={() => props.navigation.navigate('Modal', {
							content: rewardInfo()
						})}
					>
						<Icon name={"information"} size={24} style={tw`text-white mr-1`} />
					</TouchableOpacity>
				</View>
				<View style={tw`bg-purple-500 pb-2`}>
					<View style={tw`flex items-center`}>
						<Text style={tw`text-white mb-3 font-medium text-lg`}>Doanh số năm nay</Text>
						<Text style={tw`text-white font-bold text-4xl`}>{!stats ? <ActivityIndicator /> : formatVND(stats.currentYearRevenue)}</Text>
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
						titleColor="gray"
						tintColor="gray"
					/>
				}
			>
				<View style={tw`pb-64`}>
					
					<View style={tw`px-3`}>
						<View style={tw`flex flex-row items-center mb-3 pt-5`}>
							<Text style={tw`font-medium text-gray-500`}>Lịch sử thưởng năm</Text>
						</View>
						{rewards && rewards.length > 0 ?
							<FlatList
								data={rewards && rewards}
								renderItem={({item}) => <RewardItem item={item} navigation={props.navigation}/>}
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
								<Text style={tw`text-gray-600`}>Chưa có dữ liệu</Text>
							</View>
						}
					</View>
				
				</View>
			</ScrollView>
		</View>
	);
}

export default YearlyRewardScreen;
