import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Image, Linking, Platform,
	RefreshControl,
	ScrollView,
	StatusBar,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from "twrnc";
import { useDispatch, useSelector } from "react-redux";
import apiConfig, {AppConfig} from "app/config/api-config";
import { GetMe, LoadDataAction, memberLogout, updateAccount } from "app/screens/Auth/action";
import { emptyCart } from "app/screens/Cart/action";
import CartIcon from "app/screens/Cart/components/cartIcon";
import { UserAffRoles, UserLevel } from "app/models/commons/member.model";
import { formatAddress, formatNumber, formatVND } from "app/utils/helper";
import axios from "axios";
import AsyncStorage from "@react-native-community/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { GetSettings } from "app/store/actions/settingActions";
import SearchProductScreen from "app/screens/Search/SearchProductScreen";
import ActiveCard from "app/screens/ActiveCard";
import UpgradeAccount from "app/screens/UpgradeAccount";
import QRCode from "react-native-qrcode-svg";

function AccountScreen(props) {
	const isFocused = useIsFocused();
	const dispatch = useDispatch()
	const currentUser = useSelector(state => state.memberAuth.user);
	const settings = useSelector(state => state.SettingsReducer.options);
	const [refresh, setRefresh] = useState(false)
	const [quickStats, setQuickStats] = useState({})
	const [showQR, setShowQR] = useState(false)
	const [account, setAccount] = useState(currentUser && currentUser.cryptoWallet)
	const [chain, setChain] = useState(null)

	useEffect(() => {
		props.navigation.setOptions({
			title: 'Tài khoản',
			headerStyle: {
				backgroundColor: '#2ea65d',
			},
			headerTintColor: '#fff',
			/*headerLeft: () => (
				<View style={tw`flex flex-row items-center`}>
					<TouchableOpacity
						activeOpacity={1}
						//onPress={() => dispatch(memberLogout(props.navigation))}
					>
						<Icon name="cog"
						      size={23}
						      style={tw`text-white ml-3`}
						/>
					</TouchableOpacity>
				</View>
			),*/
			headerRight: () => (
				<View style={tw`mr-3 flex flex-row items-center`}>
					<CartIcon
						navigation={props.navigation}
					/>

					<TouchableOpacity
						activeOpacity={1}
						onPress={() => props.navigation.openDrawer()}
					>
						<Icon name={"menu"} size={30} style={tw`text-white ml-5`} />
					</TouchableOpacity>
				</View>
			)
		})
	}, [])

	useEffect(() => {
		if (isFocused) {
			//dispatch(GetSettings());
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
					setRefresh(false)
				})
			}
			getMe();

			async function getData() {
				const token = await AsyncStorage.getItem('sme_user_token');
				axios({
					method: 'get',
					url: `${apiConfig.BASE_URL}/member/order/quickstats`,
					params: {
						rangeStart: "2022-01-01",
						rangeEnd: "2050-01-01",
					},
					headers: {Authorization: `Bearer ${token}`}
				}).then(function (response) {
					if (response.status === 200) {
						setQuickStats(response.data)
						setRefresh(false)
					}
				}).catch(function(error){
					console.log(error);
					setRefresh(false)
				})
			}
			getData();
		}
	}, [dispatch, refresh, isFocused])

	const menu = [
		{
			id: 1,
			title: 'Tài khoản',
			child: [
				{
					id: 11,
					title: 'Cập nhật thông tin tài khoản',
					icon: 'account',
					link: 'AccountSetting',
					show: [1, 0],
				},
				{
					id: 12,
					title: 'E-voucher giảm giá',
					icon: 'crown',
					link: 'UserKind',
					show: [0],
				},
				{
					id: 14,
					title: 'Thông tin nhận Thanh toán',
					icon: 'bank',
					link: 'ChangePaymentInfo',
					show: [1, 0],
				},
				{
					id: 13,
					title: 'Thay đổi Mật khẩu',
					icon: 'key',
					link: 'ChangePassword',
					show: [1, 0],
				},
				{
					id: 13,
					title: 'Quản lý phương tiện',
					icon: 'car',
					link: 'VehicleSetting',
					show: [1, 0],
				},
				{
					id: 15,
					title: 'Đóng tài khoản',
					icon: 'account-remove',
					link: 'DeleteMe',
					params: 'deleteRequest',
					iconColor: 'text-red-500',
					show: [1, 0],
				},
			]
		},
		{
			id: 2,
			title: 'Affiliate',
			child: [
				{
					id: 20,
					title: 'Chương trình giới thiệu',
					icon: 'sitemap',
					link: 'AffiliateProgram',
					show: [1, 0],
				},
			]
		},
	]

	return (
		!currentUser ? <Text>Đang tải...</Text> :
			<View style={tw`flex h-full`}>
				<StatusBar barStyle={"light-content"} backgroundColor={'#2ea65d'} />
				<View style={tw`bg-white shadow-lg p-3 border-b border-gray-200 flex items-center justify-between flex-row`}>

						<View>
							<Text  style={tw`font-bold text-gray-700`}>{currentUser && currentUser.name}</Text>
							<Text  style={tw`text-xs text-gray-500`}>ID: <Text style={tw`font-medium text-gray-600`}>{currentUser && currentUser.refId ? currentUser.refId : 'Chưa có'}</Text></Text>
							<Text  style={tw`text-xs text-gray-500`}><Text style={tw`font-medium text-gray-600`}>{currentUser && currentUser.phone}</Text></Text>
							{currentUser && currentUser.userKind &&
								<View style={tw`flex flex-row items-center mt-2`}>
									<View style={tw`bg-orange-400 rounded-full px-1 flex flex-row items-center mr-2`}>
										<Icon name={"check-circle"} style={tw`text-white mr-1`} />
										<Text style={tw`text-white text-xs`}>
											{currentUser.userKind.name}
										</Text>
									</View>
								</View>
							}
						</View>

						<View>
							{currentUser && currentUser.avatar ?
								<Image
									source={{uri: currentUser.avatar}}
									resizeMode='stretch'
									style={[tw`w-16 h-16 rounded-full`, { resizeMode: 'cover' }]}
								/>
								:
								<Image
									source={require('../../assets/images/logo.png')}
									resizeMode='stretch'
									style={[tw`w-16 h-16 rounded-full`, { resizeMode: 'cover' }]}
								/>
							}
						</View>
					{/*{currentUser && currentUser.refId &&
						<TouchableOpacity
							onPress={() => setShowQR(!showQR)}
						>
							<QRCode
								size={50}
								value={settings && settings.pc_website_url+'/'+currentUser.refId}
							/>
						</TouchableOpacity>
					}*/}
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
					<View style={tw`flex pb-10 mt-3`}>
						<View>
							{showQR &&
								<View style={tw`m-3 bg-white py-3 flex items-center rounded relative`}>
									<QRCode
										size={150}
										value={settings && settings.pc_website_url+'/'+currentUser.refId}
									/>
									<TouchableOpacity
										style={tw`absolute top-1 right-1`}
										onPress={() => setShowQR(!showQR)}
									>
										<Icon name={"close-circle"} size={30} style={tw`text-red-500 opacity-80`} />
									</TouchableOpacity>
								</View>
							}
							{currentUser && !currentUser.refId &&
								<View style={tw`mb-3 mx-3 bg-blue-50 border border-blue-200 flex items-center p-5 rounded`}>
									<Text style={tw`mb-3 text-center`}>
										Kích hoạt thẻ để tham gia chương trình Affiliate và hưởng nhiều ưu đãi của thành viên VIP.
									</Text>
									<TouchableOpacity
										style={tw`bg-green-600 px-3 py-2 rounded`}
										onPress={() => props.navigation.navigate('Modal', {content: <ActiveCard navigation={props.navigation} backScreen={'Account'} />})}
									>
										<Text style={tw`text-white font-bold`}>Kích hoạt ngay</Text>
									</TouchableOpacity>
								</View>
							}

							<View style={tw`mb-2 mx-3 bg-white shadow p-3 rounded-md`}>
								<TouchableOpacity
									style={tw`flex items-center justify-between flex-row`}
									activeOpacity={1}
									onPress={() => props.navigation.navigate('RewardWallet')}
								>
									<View style={tw`flex items-center flex-row`}>
										<Icon name={"wallet"} size={32} style={tw`mr-2 text-green-500`} />
										<View>
											<Text  style={tw`font-medium text-base text-gray-700`}>Ví Tiền</Text>
										</View>

									</View>
									<View style={tw`flex items-center flex-row`}>
										<Text
											style={tw`font-bold text-lg mr-2`}>{currentUser && formatVND(currentUser.rewardWallet)}</Text>
										<Icon name={"chevron-right"} size={18} style={tw`text-gray-500`} />
									</View>
								</TouchableOpacity>
							</View>
							<View style={tw`mb-2 mx-3 bg-white shadow p-3 rounded-md`}>
								<TouchableOpacity
									style={tw`flex items-center justify-between flex-row`}
									activeOpacity={1}
									onPress={() => props.navigation.navigate('AffWallet')}
								>
									<View style={tw`flex items-center flex-row`}>
										<Icon name={"wallet"} size={32} style={tw`mr-2 text-red-400`} />
										<View>
											<Text  style={tw`font-medium text-base text-gray-700`}>Ví Hoa hồng</Text>
										</View>

									</View>
									<View style={tw`flex items-center flex-row`}>
										<Text
											style={tw`font-bold text-lg mr-2`}>{currentUser && formatVND(currentUser.affWallet)}</Text>
										<Icon name={"chevron-right"} size={18} style={tw`text-gray-500`} />
									</View>
								</TouchableOpacity>
							</View>

							<View style={tw`mb-3 mx-3 bg-white shadow p-3 rounded-md`}>
								<TouchableOpacity
									style={tw`flex items-center justify-between flex-row`}
									activeOpacity={1}
									onPress={() => props.navigation.navigate('PointWallet')}
								>
									<View style={tw`flex items-center flex-row`}>
										<Icon name={"wallet"} size={32} style={tw`mr-2 text-blue-500`} />
										<View>
											<Text  style={tw`font-medium text-base text-gray-700`}>Ví Điểm</Text>
										</View>

									</View>
									<View style={tw`flex items-center flex-row`}>
										<Text
											style={tw`font-bold text-lg mr-2`}>{currentUser && formatNumber(currentUser.pointWallet)}</Text>
										<Icon name={"chevron-right"} size={18} style={tw`text-gray-500`} />
									</View>
								</TouchableOpacity>
							</View>
						</View>

						{currentUser && !currentUser.userKind && (settings && Number(settings.hide_upgrade_notice) === 0) &&
							<View style={tw`mb-3 mx-3 bg-orange-50 border border-orange-200 flex items-center p-5 rounded`}>
								<Text style={tw`mb-3 text-center`}>
									Nâng cấp tài khoản để hưởng nhiều ưu đãi và chiết khấu khi mua hàng.
								</Text>
								<TouchableOpacity
									style={tw`bg-green-500 px-3 py-2 rounded flex items-center flex-row`}
									onPress={async () => {
										props.navigation.navigate("Modal", {
											content: <UpgradeAccount navigation={props.navigation} backScreen={"Account"} />,
										});
									}}
								>
									<Icon name={"star"} style={tw`text-white mr-2`} size={20} />
									<Text style={tw`text-white font-bold`}>Nâng cấp</Text>
								</TouchableOpacity>
							</View>
						}

						<View style={tw`mb-3 bg-white`}>
							<View style={tw`border-b border-gray-200 px-3 py-3 flex flex-row items-center justify-between`}>
								<View style={tw`flex flex-row items-center`}>
									<Text  style={tw`font-medium text-gray-800`}>Đơn hàng</Text>
								</View>
								<TouchableOpacity style={tw`flex flex-row items-center`} onPress={() => props.navigation.navigate('Orders')}>
									<Text  style={tw`text-gray-500`}>Xem lịch sử mua hàng</Text>
									<Icon name={"chevron-right"} size={18} style={tw`text-gray-500`} />
								</TouchableOpacity>
							</View>

							<ScrollView
								style={tw`py-3`}
								horizontal
								showsHorizontalScrollIndicator={false}
							>
								<TouchableOpacity
									style={tw`mr-2 px-3 py-2 flex items-center`}
									onPress={() => props.navigation.navigate('Orders', {position: 1})}
								>
									<View style={tw`relative`}>
										{quickStats && quickStats.chothanhtoan > 0 &&
											<View
												style={tw`absolute top-0 right-0 z-50`}
											>
												<View
													style={tw`bg-red-500 rounded-full px-1 ${quickStats && quickStats.chothanhtoan > 10 && 'py-1'}`}>
													<Text style={tw`text-white text-xs`}>
														{quickStats && quickStats.chothanhtoan}
													</Text>
												</View>
											</View>
										}
										<Icon name={"clock"} size={32} style={tw`text-yellow-300 mb-2`}/>
									</View>
									<Text  style={tw`text-gray-800`}>Chờ thanh toán</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() => props.navigation.navigate('Orders', {position: 2})}
									style={tw`mr-2 px-3 py-2 flex items-center`}
								>
									<View style={tw`relative`}>
										{quickStats && quickStats.cholayhang > 0 &&
											<View
												style={tw`absolute top-0 right-0 z-50`}
											>
												<View
													style={tw`bg-red-500 rounded-full px-1 ${quickStats && quickStats.cholayhang > 10 && 'py-1'}`}>
													<Text style={tw`text-white text-xs`}>
														{quickStats && quickStats.cholayhang}
													</Text>
												</View>
											</View>
										}
										<Icon name={"package"} size={32} style={tw`text-blue-500 mb-2`} />
									</View>
									<Text  style={tw`text-gray-800`}>Chờ lấy hàng</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() => props.navigation.navigate('Orders', {position: 3})}
									style={tw`mr-2 px-3 py-2 flex items-center`}
								>
									<View style={tw`relative`}>
										{quickStats && quickStats.danggiao > 0 &&
											<View
												style={tw`absolute top-0 right-0 z-50`}
											>
												<View
													style={tw`bg-red-500 rounded-full px-1 ${quickStats && quickStats.danggiao > 10 && 'py-1'}`}>
													<Text style={tw`text-white text-xs`}>
														{quickStats && quickStats.danggiao}
													</Text>
												</View>
											</View>
										}
										<Icon name={"truck-check"} size={32} style={tw`text-orange-500 mb-2`} />
									</View>
									<Text  style={tw`text-gray-800`}>Đang giao</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() => props.navigation.navigate('Orders', {position: 4})}
									style={tw`mr-2 px-3 py-2 flex items-center`}
								>
									<View style={tw`relative`}>
										{quickStats && quickStats.danhanhang > 0 &&
											<View
												style={tw`absolute top-0 right-0 z-50`}
											>
												<View
													style={tw`bg-red-500 rounded-full px-1 ${quickStats && quickStats.danhanhang > 10 && 'py-1'}`}>
													<Text style={tw`text-white text-xs`}>
														{quickStats && quickStats.danhanhang}
													</Text>
												</View>
											</View>
										}
										<Icon name={"clipboard-check"} size={32} style={tw`text-green-600 mb-2`} />
									</View>
									<Text  style={tw`text-gray-800`}>Đã nhận hàng</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() => props.navigation.navigate('Orders', {position: 5})}
									style={tw`mr-2 px-3 py-2 flex items-center`}
								>
									<View style={tw`relative`}>
										{quickStats && quickStats.dahuy > 0 &&
											<View
												style={tw`absolute top-0 right-0 z-50`}
											>
												<View
													style={tw`bg-red-500 rounded-full px-1 ${quickStats && quickStats.dahuy > 10 && 'py-1'}`}>
													<Text style={tw`text-white text-xs`}>
														{quickStats && quickStats.dahuy}
													</Text>
												</View>
											</View>
										}
										<Icon name={"archive-remove"} size={32} style={tw`text-red-500 mb-2`} />
									</View>
									<Text  style={tw`text-gray-800`}>Đã huỷ</Text>
								</TouchableOpacity>
							</ScrollView>
							{currentUser && currentUser.refId &&
								<View>
									<View style={tw`border-t border-gray-100`}>
										<TouchableOpacity
											onPress={() => props.navigation.navigate('OnlineShop')}
											style={tw`flex flex-row items-center justify-between px-3 py-4`}
										>
											<View style={tw`flex flex-row items-center`}>
												<Icon name={"shopping"} size={32} style={tw`text-blue-500 mr-2`}/>
												<Text style={tw`font-medium`}>Gian hàng trực tuyến</Text>
											</View>
											<View>
												<Icon name={"chevron-right"} size={16} />
											</View>
										</TouchableOpacity>
									</View>
									<View style={tw`border-t border-gray-100`}>
										<TouchableOpacity
											onPress={() => props.navigation.navigate('MyMart')}
											style={tw`flex flex-row items-center justify-between px-3 py-4`}
										>
											<View style={tw`flex flex-row items-center`}>
												<Icon name={"store"} size={32} style={tw`text-green-600 mr-2`}/>
												<Text style={tw`font-medium`}>Điểm bán hàng offline</Text>
											</View>
											<View>
												<Icon name={"chevron-right"} size={16} />
											</View>
										</TouchableOpacity>
									</View>
								</View>
							}

						</View>

						{menu && menu.map((item, index) => (
							<View style={tw`bg-white mb-3 rounded-md pt-3 px-3 pb-2`}>
								<Text  style={tw`font-medium text-gray-800 mb-2`}>{item.title}</Text>
								<View>
									{item.child && item.child.map((child, index) => (
										child.show.includes(settings && Number(settings.hide_upgrade_notice)) &&
										<TouchableOpacity
											onPress={() => props.navigation.navigate(child.link, child.params)}
										>
											<View style={tw`flex flex-row items-center`}>
												<View style={tw`flex items-center bg-gray-100 w-10 h-10 rounded-xl mr-3`}>
													<Icon name={child.icon} size={20} style={tw`${child.iconColor ? child.iconColor : 'text-gray-500'} mt-2`} />
												</View>
												<View style={tw` px-3 pt-5 w-4/5 pb-5 ${index !== item.child.length - 1 && 'border-b border-gray-100' }`}>
													<Text  style={tw`text-base ${child.iconColor ? child.iconColor : 'text-gray-700'}`}>{child.title}</Text>
												</View>
											</View>
										</TouchableOpacity>
									))}
								</View>
							</View>
						))}
						{settings && (settings.monthly_reward_status === 'TRUE' || settings.yearly_reward_status === 'TRUE') &&
							<View style={tw`bg-white mb-3 rounded-md pt-3 px-3 pb-2`}>
								<Text  style={tw`font-medium text-gray-800 mb-2`}>Thưởng</Text>
								<View>
									{settings.monthly_reward_status === 'TRUE' &&
										<TouchableOpacity
											onPress={() => props.navigation.navigate('MonthlyReward')}
										>
											<View style={tw`flex flex-row items-center`}>
												<View style={tw`flex items-center bg-gray-100 w-10 h-10 rounded-xl mr-3`}>
													<Icon name={'calendar-text'} size={20} style={tw`text-gray-500 mt-2`} />
												</View>
												<View style={tw` px-3 pt-5 w-4/5 pb-5 ${settings && settings.yearly_reward_status === 'TRUE' && 'border-b border-gray-100' }`}>
													<Text  style={tw`text-base`}>Thưởng doanh số tháng</Text>
												</View>
											</View>
										</TouchableOpacity>
									}
									{settings.yearly_reward_status === 'TRUE' &&
										<TouchableOpacity
											onPress={() => props.navigation.navigate('YearlyReward')}
										>
											<View style={tw`flex flex-row items-center`}>
												<View style={tw`flex items-center bg-gray-100 w-10 h-10 rounded-xl mr-3`}>
													<Icon name={'calendar-star'} size={20} style={tw`text-gray-500 mt-2`} />
												</View>
												<View style={tw` px-3 pt-5 w-4/5 pb-5`}>
													<Text  style={tw`text-base`}>Thưởng doanh số năm</Text>
												</View>
											</View>
										</TouchableOpacity>
									}
								</View>
							</View>
						}
						<View style={tw`my-3 flex items-center`}>
							<TouchableOpacity
								onPress={() =>
									Alert.alert(
										'Bạn chắc chắn muốn thoát tài khoản?',
										'',
										[
											{
												text: 'Không',
												onPress: () => console.log('No, continue buying'),
											},
											{
												text: 'Đúng vậy',
												onPress: () => {
													dispatch(memberLogout(props.navigation));
													dispatch(emptyCart())
												},
												style: 'cancel',
											},
										],
										{ cancelable: false },
									)
								}
								style={tw`bg-red-500 px-10 py-2`}
							>
								<Text  style={tw`text-white`}>Đăng xuất</Text>
							</TouchableOpacity>
						</View>
					</View>

					<View style={tw`flex items-center pb-2`}>
						<Text style={tw`text-xs`}>Version: {Platform.OS === 'android' ? AppConfig.androidVersion : AppConfig.iosVersion}</Text>
					</View>
				</ScrollView>
			</View>
	);
}

export default AccountScreen;
