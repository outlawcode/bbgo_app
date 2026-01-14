import React, {useEffect, useState} from "react";
import { Alert,
	Image,
	Platform,
	RefreshControl,
	ScrollView,
	StatusBar,
	TouchableOpacity,
	View,
	Modal, ActivityIndicator } from 'react-native';
import { Text } from 'app/components';
;
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from "twrnc";
import {useDispatch, useSelector} from "react-redux";
import apiConfig, {AppConfig} from "app/config/api-config";
import {LoadDataAction, memberLogout} from "app/screens/Auth/action";
import {emptyCart} from "app/screens/Cart/action";
import CartIcon from "app/screens/Cart/components/cartIcon";
import {formatBalance, formatNumber, formatVND, formatDateTime} from "app/utils/helper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useIsFocused} from "@react-navigation/native";
import QRCode from "react-native-qrcode-svg";
import KPIInfo from "./components/KPIInfo";
import CTVRegistrationBanner from "./components/CTVRegistrationBanner";

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
	const [showLevelModal, setShowLevelModal] = useState(false)
	const [showHistoryModal, setShowHistoryModal] = useState(false)
	const [userProgress, setUserProgress] = useState(null)
	const [kpiData, setKpiData] = useState(null)
	const [levelsInfo, setLevelsInfo] = useState(null)
	const [loadingLevelData, setLoadingLevelData] = useState(false)
	const [positionHistory, setPositionHistory] = useState([])
	const [loadingHistory, setLoadingHistory] = useState(false)

	// Define colors for each level
	const levelColors = [
		'#6b7280', // Khách hàng - gray
		'#52c41a', // Khách hàng thân thiết - green
		'#1890ff', // Cộng tác viên - blue
		'#722ed1', // Tư vấn viên - purple
		'#fa8c16', // Đại lý - orange
		'#fa541c', // Đại lý cấp 1 - red-orange
		'#eb2f96', // Đại lý cấp 2 - pink
		'#f759ab', // Tổng Đại lý - light pink
		'#13c2c2', // Giám đốc kinh doanh - cyan
		'#52c41a', // Giám đốc Cấp cao - green
		'#faad14', // Giám đốc Chiến lược - gold
	]

	// Process userProgress data similar to web version
	const processUserProgress = (userProgress) => {
		if (!userProgress || !userProgress.levelSettings) {
			return null
		}

		// Build level hierarchy from settings
		const levelHierarchy = Object.keys(userProgress.levelSettings).map((levelName, index) => {
			const setting = userProgress.levelSettings[levelName]

			// Build benefits array
			const benefits = []
			if (setting.discountPercent > 0) {
				benefits.push(`Chiết khấu ${setting.discountPercent}%`)
			}
			if (setting.directPercent > 0) {
				benefits.push(`Hoa hồng trực tiếp ${setting.directPercent}%`)
			}
			if (setting.f1SystemPercent > 0) {
				benefits.push(`Hoa hồng F1 ${setting.f1SystemPercent}%`)
			}
			if (setting.systemCommissionPercent > 0) {
				benefits.push(`Hoa hồng hệ thống ${setting.systemCommissionPercent}%`)
			}
			if (setting.dongchiaPercent > 0) {
				benefits.push(`Hoa hồng đồng chia ${setting.dongchiaPercent}%`)
			}
			if (setting.tokenReward > 0) {
				benefits.push(`Thưởng token: ${setting.tokenReward}`)
			}

			// Default benefits for base level
			if (index === 0) {
				benefits.push(
					'Mua hàng với giá niêm yết',
					'Tham gia hệ thống giới thiệu',
				)
			}

			return {
				id: index,
				name: levelName,
				discountPercent: setting.discountPercent,
				personalSalesRequired: setting.personalSalesRequired,
				minSingleOrderRequired: setting.minSingleOrderRequired,
				systemSalesRequired: setting.systemSalesRequired,
				f1TdlRequired: setting.f1TdlRequired,
				tokenReward: setting.tokenReward,
				benefits,
				color: levelColors[index] || '#6b7280',
				hasMinOrderRequirement: setting.hasMinOrderRequirement,
				minOrderValue: setting.minOrderValue,
			}
		})

		const currentLevel = levelHierarchy.find(level => level.name === currentUser?.position) || levelHierarchy[0]
		const nextLevel = levelHierarchy[currentLevel?.id + 1]

		const calculateProgress = () => {
			if (!nextLevel || !userProgress) return 100

			let progress = 0
			let totalRequirements = 0
			let metRequirements = 0

			// Check minimum single order requirement for KHTT and CTV
			if (nextLevel.minSingleOrderRequired > 0) {
				totalRequirements++
				let hasMinOrder = false
				if (nextLevel.name === 'Khách hàng thân thiết') {
					hasMinOrder = userProgress.hasKhttMinOrder
				} else if (nextLevel.name === 'Cộng tác viên') {
					hasMinOrder = userProgress.hasCtvMinOrder
				}
				if (hasMinOrder) {
					progress += 1
					metRequirements++
				}
			}

			// Check cumulative sales requirement (personal + system)
			if (nextLevel.systemSalesRequired > 0) {
				totalRequirements++
				const cumulativeProgress = Math.min(
					userProgress.totalSales / nextLevel.systemSalesRequired,
					1,
				)
				progress += cumulativeProgress
				if (cumulativeProgress >= 1) metRequirements++
			}

			// Check F1 TDL requirement
			if (nextLevel.f1TdlRequired > 0) {
				totalRequirements++
				const f1Progress = Math.min(
					userProgress.f1TdlCount / nextLevel.f1TdlRequired,
					1,
				)
				progress += f1Progress
				if (f1Progress >= 1) metRequirements++
			}

			return totalRequirements > 0
				? parseFloat(((progress / totalRequirements) * 100).toFixed(2))
				: 100
		}

		const progressPercent = calculateProgress()

		return {
			...userProgress,
			levelHierarchy,
			currentLevel,
			nextLevel,
			progressPercent,
		}
	}

	useEffect(() => {
		props.navigation.setOptions({
			title: 'Tài khoản',
			headerStyle: {
				backgroundColor: '#008A97',
			},
			headerTintColor: '#fff',
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
						rangeStart: "2025-01-01",
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

			async function getUserProgress() {
				const token = await AsyncStorage.getItem('sme_user_token');
				axios({
					method: 'get',
					url: `${apiConfig.BASE_URL}/user/progress`,
					headers: {Authorization: `Bearer ${token}`}
				}).then(function (response) {
					if (response.status === 200) {
						const processedData = processUserProgress(response.data)
						setUserProgress(processedData)
					}
				}).catch(function(error){
					console.log('Level progress error:', error);
				})
			}
			getUserProgress();
		}
	}, [dispatch, refresh, isFocused])

	useEffect(() => {
		if (showLevelModal) {
			fetchLevelModalData();
		}
	}, [showLevelModal])

	useEffect(() => {
		if (showHistoryModal) {
			fetchPositionHistory();
		}
	}, [showHistoryModal])

	const fetchPositionHistory = async () => {
		setLoadingHistory(true);
		try {
			const token = await AsyncStorage.getItem('sme_user_token');
			const response = await axios.get(
				`${apiConfig.BASE_URL}/user/position-history`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setPositionHistory(response.data || []);
		} catch (error) {
			console.log('Error fetching position history:', error);
			setPositionHistory([]);
		} finally {
			setLoadingHistory(false);
		}
	}

	const getHistoryIcon = (item) => {
		if (item.type === 'upgrade' || item.type === 'manual_upgrade') {
			return <Icon name="arrow-up-bold" size={20} style={tw`text-green-500`} />;
		}
		if (item.type === 'downgrade') {
			return <Icon name="arrow-down-bold" size={20} style={tw`text-red-500`} />;
		}
		if (item.source === 'ctv_registration') {
			return <Icon name="crown" size={20} style={tw`text-blue-500`} />;
		}
		return <Icon name="account-circle" size={20} style={tw`text-gray-500`} />;
	}

	const fetchLevelModalData = async () => {
		setLoadingLevelData(true);
		try {
			const token = await AsyncStorage.getItem('sme_user_token');
			const [kpiRes, levelRes] = await Promise.all([
				axios.get(`${apiConfig.BASE_URL}/member/kpi/realtime`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: null })),
				axios.get(`${apiConfig.BASE_URL}/member/kpi/levels-info`, { headers: { Authorization: `Bearer ${token}` } })
			]);
			setKpiData(kpiRes.data);
			setLevelsInfo(levelRes.data);
		} catch (error) {
			console.log('Level modal data error:', error);
		} finally {
			setLoadingLevelData(false);
		}
	}

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
					id: 16,
					title: 'Địa chỉ nhận hàng',
					icon: 'map-marker',
					link: 'Address',
					show: [1, 0],
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
				{
					id: 21,
					title: 'Đào tạo',
					icon: 'school-outline',
					link: 'Training',
					show: [1, 0],
				},
					{
						id: 22,
						title: 'Nhóm của tôi',
						icon: 'account-group',
						link: 'MemberGroups',
						show: [1, 0],
					},
			]
		},
	]

	return (
		!currentUser ? (
			<View style={tw`flex-1 justify-center items-center bg-gray-50`}>
				<View style={tw`bg-white p-6 rounded-xl shadow-lg`}>
					<View style={tw`animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4`} />
					<Text style={tw`text-gray-600 text-center`}>Đang tải thông tin tài khoản...</Text>
				</View>
			</View>
		) : (
			<View style={tw`flex h-full bg-gray-50`}>
				<StatusBar barStyle={"light-content"} backgroundColor={'#008A97'} />

				{/* Header - Compact White Background */}
				<View style={tw`bg-white px-4 py-1 border-b border-gray-100`}>
					<View style={tw`flex flex-row items-center justify-between`}>
						{/* Left: Avatar + Name + ID */}
						<View style={tw`flex flex-row items-center flex-1`}>
							{/* Avatar */}
							<View style={tw`mr-3`}>
								{currentUser && currentUser.avatar ? (
									<Image
										source={{uri: currentUser.avatar}}
										style={[tw`w-12 h-12 rounded-full border-2 border-gray-200`, { resizeMode: 'cover' }]}
									/>
								) : (
									<View style={tw`w-12 h-12 rounded-full border-2 border-gray-200 bg-gray-100 items-center justify-center`}>
										<Image
											source={require('../../assets/images/logo.png')}
											style={[tw`w-8 h-8 rounded-full`, { resizeMode: 'cover' }]}
										/>
									</View>
								)}
							</View>

							{/* Name + ID */}
							<View style={tw`flex-1`}>
								<Text style={tw`font-bold text-gray-800 text-base`} numberOfLines={1}>
									{currentUser && currentUser.name}
								</Text>
								<Text style={tw`text-cyan-600 text-sm`}>
									ID: {currentUser && currentUser.refId ? currentUser.refId : 'Chưa có'}
								</Text>
								<View style={tw`flex items-center flex-row`}>
									{Number(currentUser.status2FA) === 1 ?
										<View style={tw`bg-green-500 flex flex-row items-center rounded-full px-1 mr-1`}>
											<Icon name={"shield-check"} style={tw`text-white mr-1`}/>
											<Text style={tw`text-white text-xs`} numberOfLines={1}>Đã cài 2FA</Text>
										</View>
										:
										<View style={tw`bg-gray-300 flex flex-row items-center rounded-full px-1 mr-1`}>
											<Icon name={"shield-check"} style={tw`text-gray-500 mr-1`}/>
											<Text style={tw`text-gray-500 text-xs`} numberOfLines={1}>Chưa cài 2FA</Text>
										</View>
									}
									{Number(currentUser.kycStatus) === 1 ?
										<View style={tw`bg-blue-500 flex flex-row items-center rounded-full px-1`}>
											<Icon name={"account-check"} style={tw`text-white mr-1`}/>
											<Text style={tw`text-white text-xs`} numberOfLines={1}>Đã KYC</Text>
										</View>
										:
										<View style={tw`bg-gray-200 flex flex-row items-center rounded-full px-1`}>
											<Icon name={"account-check"} style={tw`text-gray-400 mr-1`}/>
											<Text style={tw`text-gray-400 text-xs`} numberOfLines={1}>Chưa KYC</Text>
										</View>
									}
								</View>
							</View>

						</View>

						{/* Right: Position + Detail Button */}
						<View style={tw`items-end`}>
							{currentUser && currentUser.position && (
								<View style={tw`flex flex-row items-center mb-1`}>
									<View style={tw`bg-orange-400 rounded-md px-2 py-1 flex flex-row items-center`}>
										<Icon name={"check-circle"} style={tw`text-white mr-1`} size={12} />
										<Text style={tw`text-white text-xs font-medium`}>
											{currentUser.position}
										</Text>
									</View>
								</View>
							)}
							<View style={tw`flex flex-row gap-2`}>
								<TouchableOpacity
									onPress={() => setShowLevelModal(true)}
									style={tw`bg-gray-100 px-3 py-1 rounded-lg`}
									activeOpacity={0.7}
								>
									<Text style={tw`text-gray-600 text-xs font-medium`}>Chi tiết</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() => setShowHistoryModal(true)}
									style={tw`bg-gray-100 px-3 py-1 rounded-lg`}
									activeOpacity={0.7}
								>
									<Text style={tw`text-gray-600 text-xs font-medium`}>Lịch sử</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</View>
				<ScrollView
					style={tw`flex-1`}
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
					<View style={tw`px-4 py-4`}>
						{/* Main Wallet - Compact Cyan Gradient Design */}
						<View style={tw`mb-3`}>
							<TouchableOpacity
								style={[tw`shadow-lg p-4 rounded-xl relative overflow-hidden`, {
									backgroundColor: '#008A97',
									background: 'linear-gradient(135deg, #008A97 0%, #006B73 100%)'
								}]}
								activeOpacity={0.8}
								onPress={() => props.navigation.navigate('RewardWallet')}
							>
								{/* Background Icon - More Attractive */}
								<View style={tw`absolute -top-2 -right-2 opacity-15`}>
									<Icon name={"wallet"} size={100} style={tw`text-white`} />
								</View>

								{/* Content */}
								<View style={tw`relative z-10`}>
									{/* Main Content - Compact */}
									<View style={tw`items-center`}>
										{/* Balance - Most Prominent */}
										<Text style={tw`font-bold text-3xl text-white mb-1`}>
											{currentUser && formatVND(currentUser.rewardWallet)}
										</Text>

										{/* Wallet Name */}
										<Text style={tw`font-semibold text-base text-white opacity-95`}>Ví Tiền</Text>

										{/* Subtitle */}
										<Text style={tw`text-white opacity-75 text-xs mt-0.5`}>Số dư khả dụng</Text>
									</View>
								</View>
							</TouchableOpacity>
						</View>

						{/* Secondary Wallets - Compact Two Column Layout */}
						<View style={tw`mb-4`}>
							<View style={tw`flex flex-row`}>
								{/* Savings Wallet */}
								<TouchableOpacity
									style={tw`flex-1 bg-white shadow-lg p-3 rounded-xl border border-gray-100 mr-2`}
									activeOpacity={0.7}
									onPress={() => props.navigation.navigate('SavingWallet')}
								>
									<View style={tw`flex items-center justify-between flex-row mb-2`}>
										<View style={tw`flex items-center flex-row`}>
											<View style={tw`w-8 h-8 bg-red-100 rounded-lg items-center justify-center mr-2`}>
												<Icon name={"piggy-bank"} size={16} style={tw`text-red-500`} />
											</View>
											<View>
												<Text style={tw`font-semibold text-sm text-gray-800`}>Ví Tiết kiệm</Text>
												<Text style={tw`text-gray-500 text-xs`}>Tích lũy dài hạn</Text>
											</View>
										</View>
										<Icon name={"chevron-right"} size={14} style={tw`text-gray-400`} />
									</View>
									<View>
										<Text style={tw`font-bold text-base text-gray-800`}>
											{currentUser && formatVND(currentUser.savingWallet)}
										</Text>
									</View>
								</TouchableOpacity>

								{/* Points Wallet */}
								<TouchableOpacity
									style={tw`flex-1 bg-white shadow-lg p-3 rounded-xl border border-gray-100 ml-2`}
									activeOpacity={0.7}
									onPress={() => props.navigation.navigate('PointWallet')}
								>
									<View style={tw`flex items-center justify-between flex-row mb-2`}>
										<View style={tw`flex items-center flex-row`}>
											<View style={tw`w-8 h-8 bg-blue-100 rounded-lg items-center justify-center mr-2`}>
												<Icon name={"star"} size={16} style={tw`text-blue-600`} />
											</View>
											<View>
												<Text style={tw`font-semibold text-sm text-gray-800`}>Ví Điểm</Text>
												<Text style={tw`text-gray-500 text-xs`}>BBX</Text>
											</View>
										</View>
										<Icon name={"chevron-right"} size={14} style={tw`text-gray-400`} />
									</View>
									<View>
										<Text style={tw`font-bold text-base text-gray-800`}>
											{currentUser && formatBalance(currentUser.pointWallet)}
										</Text>
									</View>
								</TouchableOpacity>
							</View>
						</View>

						{/* KYC and 2FA Status Notifications */}
						{currentUser && (Number(currentUser.kycStatus) !== 1 || Number(currentUser.status2FA) !== 1) && (
							<View style={tw`mb-2`}>
								{/* KYC Status */}
								{Number(currentUser.kycStatus) !== 1 && (
									<View style={tw`mb-3 bg-yellow-50 border border-yellow-300 rounded-lg p-4`}>
										<View style={tw`flex flex-row items-center justify-between`}>
											<View style={tw`flex flex-row items-center flex-1`}>
												<Icon name="shield-alert" size={20} style={tw`text-yellow-600 mr-2`} />
												<View style={tw`flex-1`}>
													<Text style={tw`font-bold text-yellow-800 text-sm`}>
														{Number(currentUser.kycStatus) === 2 ? 'KYC đang chờ duyệt' : 'Chưa xác thực KYC'}
													</Text>
													<Text style={tw`text-yellow-700 text-xs mt-1`}>
														{Number(currentUser.kycStatus) === 2
															? 'KYC của bạn đang được xem xét, vui lòng chờ'
															: 'Cần xác thực KYC để rút tiền và sử dụng đầy đủ tính năng'
														}
													</Text>
												</View>
											</View>
											{Number(currentUser.kycStatus) === 0 && (
												<TouchableOpacity
													onPress={() => props.navigation.navigate('KYC')}
													style={tw`bg-yellow-500 px-3 py-1 rounded-lg`}
												>
													<Text style={tw`text-white text-xs font-medium`}>Bắt đầu KYC</Text>
												</TouchableOpacity>
											)}
										</View>
									</View>
								)}

								{/* 2FA Status */}
								{Number(currentUser.status2FA) !== 1 && (
									<View style={tw`mb-3 bg-blue-50 border border-blue-300 rounded-lg p-4`}>
										<View style={tw`flex flex-row items-center justify-between`}>
											<View style={tw`flex flex-row items-center flex-1`}>
												<Icon name="shield-key" size={20} style={tw`text-blue-600 mr-2`} />
												<View style={tw`flex-1`}>
													<Text style={tw`font-bold text-blue-800 text-sm`}>Chưa cài đặt 2FA</Text>
													<Text style={tw`text-blue-700 text-xs mt-1`}>
														Cần cài đặt xác thực 2 bước để bảo mật tài khoản
													</Text>
												</View>
											</View>
											<TouchableOpacity
												onPress={() => props.navigation.navigate('TwoFA')}
												style={tw`bg-blue-500 px-3 py-1 rounded-lg`}
											>
												<Text style={tw`text-white text-xs font-medium`}>Cài đặt 2FA</Text>
											</TouchableOpacity>
										</View>
									</View>
								)}
							</View>
						)}

						{/* CTV Registration Banner */}
						<CTVRegistrationBanner />

						{/* KPI Info */}
						<KPIInfo />

						{/* Orders Section - Compact & Clean */}
						<View style={tw`mb-4 bg-white shadow-lg rounded-xl border border-gray-100`}>
							<View style={tw`px-4 py-3 border-b border-gray-100 flex flex-row items-center justify-between`}>
								<View style={tw`flex flex-row items-center`}>
									<Icon name={"shopping"} size={18} style={tw`text-gray-600 mr-2`} />
									<Text style={tw`font-semibold text-gray-800 text-base`}>Đơn hàng</Text>
								</View>
								<TouchableOpacity
									style={tw`flex flex-row items-center`}
									onPress={() => props.navigation.navigate('Orders')}
									activeOpacity={0.7}
								>
									<Text style={tw`text-cyan-600 text-sm font-medium`}>Xem tất cả</Text>
									<Icon name={"chevron-right"} size={16} style={tw`text-cyan-600`} />
								</TouchableOpacity>
							</View>

							<ScrollView
								style={tw`py-3`}
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={tw`px-4`}
							>
								<TouchableOpacity
									style={tw`mr-3 px-3 py-2 flex items-center min-w-16`}
									onPress={() => props.navigation.navigate('Orders', {position: 1})}
									activeOpacity={0.7}
								>
									<View style={tw`relative`}>
										{quickStats && quickStats.chothanhtoan > 0 && (
											<View style={tw`absolute -top-1 -right-1 z-50`}>
												<View style={tw`bg-red-500 rounded-full px-1.5 py-0.5 min-w-4 items-center`}>
													<Text style={tw`text-white text-xs font-bold`}>
														{quickStats && quickStats.chothanhtoan}
													</Text>
												</View>
											</View>
										)}
										<View style={tw`w-10 h-10 bg-yellow-100 rounded-lg items-center justify-center mb-1`}>
											<Icon name={"clock"} size={18} style={tw`text-yellow-600`}/>
										</View>
									</View>
									<Text style={tw`text-gray-800 text-xs font-medium text-center`}>Chờ thanh toán</Text>
								</TouchableOpacity>

								<TouchableOpacity
									onPress={() => props.navigation.navigate('Orders', {position: 2})}
									style={tw`mr-3 px-3 py-2 flex items-center min-w-16`}
									activeOpacity={0.7}
								>
									<View style={tw`relative`}>
										{quickStats && quickStats.cholayhang > 0 && (
											<View style={tw`absolute -top-1 -right-1 z-50`}>
												<View style={tw`bg-red-500 rounded-full px-1.5 py-0.5 min-w-4 items-center`}>
													<Text style={tw`text-white text-xs font-bold`}>
														{quickStats && quickStats.cholayhang}
													</Text>
												</View>
											</View>
										)}
										<View style={tw`w-10 h-10 bg-blue-100 rounded-lg items-center justify-center mb-1`}>
											<Icon name={"package"} size={18} style={tw`text-blue-600`} />
										</View>
									</View>
									<Text style={tw`text-gray-800 text-xs font-medium text-center`}>Chờ lấy hàng</Text>
								</TouchableOpacity>

								<TouchableOpacity
									onPress={() => props.navigation.navigate('Orders', {position: 3})}
									style={tw`mr-3 px-3 py-2 flex items-center min-w-16`}
									activeOpacity={0.7}
								>
									<View style={tw`relative`}>
										{quickStats && quickStats.danggiao > 0 && (
											<View style={tw`absolute -top-1 -right-1 z-50`}>
												<View style={tw`bg-red-500 rounded-full px-1.5 py-0.5 min-w-4 items-center`}>
													<Text style={tw`text-white text-xs font-bold`}>
														{quickStats && quickStats.danggiao}
													</Text>
												</View>
											</View>
										)}
										<View style={tw`w-10 h-10 bg-orange-100 rounded-lg items-center justify-center mb-1`}>
											<Icon name={"truck-check"} size={18} style={tw`text-orange-600`} />
										</View>
									</View>
									<Text style={tw`text-gray-800 text-xs font-medium text-center`}>Đang giao</Text>
								</TouchableOpacity>

								<TouchableOpacity
									onPress={() => props.navigation.navigate('Orders', {position: 4})}
									style={tw`mr-3 px-3 py-2 flex items-center min-w-16`}
									activeOpacity={0.7}
								>
									<View style={tw`relative`}>
										{quickStats && quickStats.danhanhang > 0 && (
											<View style={tw`absolute -top-1 -right-1 z-50`}>
												<View style={tw`bg-red-500 rounded-full px-1.5 py-0.5 min-w-4 items-center`}>
													<Text style={tw`text-white text-xs font-bold`}>
														{quickStats && quickStats.danhanhang}
													</Text>
												</View>
											</View>
										)}
										<View style={tw`w-10 h-10 bg-green-100 rounded-lg items-center justify-center mb-1`}>
											<Icon name={"clipboard-check"} size={18} style={tw`text-green-600`} />
										</View>
									</View>
									<Text style={tw`text-gray-800 text-xs font-medium text-center`}>Đã nhận hàng</Text>
								</TouchableOpacity>

								<TouchableOpacity
									onPress={() => props.navigation.navigate('Orders', {position: 5})}
									style={tw`mr-3 px-3 py-2 flex items-center min-w-16`}
									activeOpacity={0.7}
								>
									<View style={tw`relative`}>
										{quickStats && quickStats.dahuy > 0 && (
											<View style={tw`absolute -top-1 -right-1 z-50`}>
												<View style={tw`bg-red-500 rounded-full px-1.5 py-0.5 min-w-4 items-center`}>
													<Text style={tw`text-white text-xs font-bold`}>
														{quickStats && quickStats.dahuy}
													</Text>
												</View>
											</View>
										)}
										<View style={tw`w-10 h-10 bg-red-100 rounded-lg items-center justify-center mb-1`}>
											<Icon name={"archive-remove"} size={18} style={tw`text-red-600`} />
										</View>
									</View>
									<Text style={tw`text-gray-800 text-xs font-medium text-center`}>Đã huỷ</Text>
								</TouchableOpacity>
							</ScrollView>
						</View>

						{/* Menu Sections - Compact & Clean */}
						{menu && menu.map((item, index) => (
							<View key={index} style={tw`bg-white mb-3 shadow-lg rounded-xl border border-gray-100`}>
								<View style={tw`px-4 py-2 border-b border-gray-100`}>
									<Text style={tw`font-semibold text-gray-800 text-base`}>{item.title}</Text>
								</View>
								<View>
									{item.child && item.child.map((child, childIndex) => (
										<TouchableOpacity
											key={child.id}
											onPress={() => props.navigation.navigate(child.link, child.params)}
											activeOpacity={0.7}
										>
											<View style={tw`flex flex-row items-center px-4 py-3 ${childIndex !== item.child.length - 1 && 'border-b border-gray-100'}`}>
												<View style={tw`w-8 h-8 rounded-lg items-center justify-center mr-3 ${child.iconColor ? 'bg-red-100' : 'bg-gray-100'}`}>
													<Icon
														name={child.icon}
														size={16}
														style={tw`${child.iconColor ? child.iconColor : 'text-gray-600'}`}
													/>
												</View>
												<View style={tw`flex-1`}>
													<Text style={tw`text-sm font-medium ${child.iconColor ? child.iconColor : 'text-gray-800'}`}>
														{child.title}
													</Text>
												</View>
												<Icon name={"chevron-right"} size={16} style={tw`text-gray-400`} />
											</View>
										</TouchableOpacity>
									))}
								</View>
							</View>
						))}

						{/* Logout Button - Subtle */}
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
								style={tw`bg-gray-200 px-6 py-2 rounded-lg`}
								activeOpacity={0.7}
							>
								<Text style={tw`text-gray-600 font-medium text-sm`}>Đăng xuất</Text>
							</TouchableOpacity>
						</View>
					</View>

					<View style={tw`flex items-center pb-6`}>
						<Text style={tw`text-xs text-gray-500`}>Version: {Platform.OS === 'android' ? AppConfig.androidVersion : AppConfig.iosVersion}</Text>
					</View>
				</ScrollView>

				
                {/* Level Progress Modal */}
                <Modal
                    visible={showLevelModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowLevelModal(false)}
                >
                    <View style={tw`flex-1 bg-black bg-opacity-50 justify-end`}>
                        <View style={tw`bg-white rounded-t-xl max-h-5/6`}>
                            {/* Modal Header */}
                            <View style={tw`px-4 py-3 border-b border-gray-200 flex flex-row items-center justify-between`}>
                                <Text style={tw`font-bold text-lg text-gray-800`}>Tiến trình cấp bậc</Text>
                                <TouchableOpacity
                                    onPress={() => setShowLevelModal(false)}
                                    style={tw`w-8 h-8 rounded-full bg-gray-100 items-center justify-center`}
                                >
                                    <Icon name="close" size={16} style={tw`text-gray-600`} />
                                </TouchableOpacity>
                            </View>

                            {/* Modal Content */}
                            <ScrollView style={tw`px-4 py-3`}>
                                {loadingLevelData ? (
                                    <View style={tw`py-6 items-center`}>
                                        <ActivityIndicator />
                                        <Text style={tw`text-gray-600 mt-2`}>Đang tải dữ liệu...</Text>
                                    </View>
                                ) : (!currentUser || !levelsInfo) ? (
                                    <View style={tw`py-6 items-center`}>
                                        <Text style={tw`text-gray-600`}>Không có dữ liệu cấp bậc</Text>
                                    </View>
                                ) : (
                                    <View>
                                        {/* Header */}
                                        <View style={tw`mb-4 text-center`}>
                                            <View style={tw`flex flex-row items-center justify-center mb-2`}>
                                                <Icon name="trophy" size={20} style={tw`text-yellow-500 mr-2`} />
                                                <Text style={tw`font-bold text-lg text-gray-800`}>Tiến trình cấp bậc</Text>
                                            </View>
                                            <Text style={tw`text-gray-600 text-sm`}>
                                                Theo dõi tiến trình phát triển cấp bậc của bạn
                                            </Text>
                                        </View>

                                        {(() => {
                                            const levels = levelsInfo?.levels || [];
                                            const currentPositionNumber = Number(currentUser.positionNumber || 0);
                                            const currentPositionName = currentUser.position || 'Khách hàng';
                                            const currentLevel = levels.find(l => l.name === currentPositionName) || levels[0] || {};
                                            const checkMonths = kpiData?.checkMonths || 2;

                                            const progressWidth = (current = 0, total = 0) => {
                                                if (!total || total <= 0) return 0;
                                                return Math.min(100, (current / total) * 100);
                                            }

                                            return (
                                                <View>
                                                    {/* Current Level Info */}
                                                    <View style={tw`bg-green-50 p-3 rounded-lg mb-4`}>
                                                        <View style={tw`flex flex-row items-center justify-between`}>
                                                            <View style={tw`flex flex-row items-center`}>
                                                                <Icon name="star" size={24} style={{ color: levelColors[currentPositionNumber] || '#6b7280' }} />
                                                                <Text style={tw`ml-2 font-bold text-gray-800 text-base`}>
                                                                    Cấp bậc hiện tại: {currentPositionName}
                                                                </Text>
                                                            </View>
                                                            {currentPositionNumber >= 2 && (
                                                                <View style={tw`bg-blue-100 px-2 py-1 rounded-full`}>
                                                                    <Text style={tw`text-blue-700 text-xs font-medium`}>Check KPI: {checkMonths} tháng</Text>
                                                                </View>
                                                            )}
                                                        </View>
                                                        <Text style={tw`text-gray-600 text-sm mt-1`}>
                                                            Chiết khấu: {currentLevel.discountPercent || 0}%
                                                        </Text>
                                                    </View>

                                                    {/* KPI Current Status */}
                                                    {currentPositionNumber >= 2 && kpiData && kpiData.eligible && (
                                                        <View>
                                                            <View style={tw`bg-white border border-gray-200 rounded-lg p-3 mb-3`}>
                                                                <View style={tw`flex flex-row justify-between items-center mb-2`}>
                                                                    <View style={tw`flex-1`}>
                                                                        <Text style={tw`text-sm text-gray-600`}>
                                                                            KPI hiện tại ({checkMonths} tháng)
                                                                            {kpiData.currentMonths && kpiData.currentMonths.length > 0 && (
                                                                                <Text style={tw`text-xs text-gray-500`}>
                                                                                    {'\n'}({kpiData.currentMonths.join(' + ')})
                                                                                </Text>
                                                                            )}
                                                                        </Text>
                                                                    </View>
                                                                    <Text style={tw`font-bold text-base ${kpiData.kpiData.totalKPISales >= (kpiData.maintainKPI || kpiData.upgradeKPI) ? 'text-green-600' : 'text-red-600'}`}>
                                                                        {formatVND(kpiData.kpiData.totalKPISales)}
                                                                    </Text>
                                                                </View>
                                                                <Text style={tw`text-xs text-gray-500`}>
                                                                    Cá nhân: {formatVND(kpiData.kpiData.personalSales)} | F1: {formatVND(kpiData.kpiData.f1Sales)} | F2: {formatVND(kpiData.kpiData.f2Sales)}
                                                                </Text>
                                                            </View>

                                                            {/* KPI duy trì */}
                                                            {kpiData.maintainKPI > 0 && (
                                                                <View style={tw`bg-white border border-gray-200 rounded-lg p-3 mb-3`}>
                                                                    <View style={tw`flex flex-row justify-between items-center mb-1`}>
                                                                        <Text style={tw`text-sm text-gray-700`}>KPI duy trì:</Text>
                                                                        <Text style={tw`font-medium text-base ${kpiData.maintainStatus ? 'text-green-600' : 'text-red-600'}`}>
                                                                            {formatVND(kpiData.maintainKPI)}
                                                                        </Text>
                                                                    </View>
                                                                    {!kpiData.maintainStatus && kpiData.maintainMissing > 0 && (
                                                                        <View>
                                                                            <View style={tw`h-2 bg-gray-200 rounded-full overflow-hidden`}>
                                                                                <View style={[tw`h-full bg-red-500 rounded-full`, { width: `${progressWidth(kpiData.kpiData.totalKPISales, kpiData.maintainKPI)}%` }]} />
                                                                            </View>
                                                                            <Text style={tw`text-xs text-red-600 text-right mt-1`}>
                                                                                Còn thiếu {formatVND(kpiData.maintainMissing)}
                                                                            </Text>
                                                                        </View>
                                                                    )}
                                                                    {kpiData.maintainStatus && (
                                                                        <View style={tw`flex flex-row items-center mt-1`}>
                                                                            <Icon name="check-circle" size={14} style={tw`text-green-600 mr-1`} />
                                                                            <Text style={tw`text-xs text-green-600`}>Đã đạt KPI duy trì</Text>
                                                                        </View>
                                                                    )}
                                                                </View>
                                                            )}

                                                            {/* KPI lên cấp */}
                                                            {kpiData.nextPosition && kpiData.upgradeKPI > 0 && (
                                                                <View style={tw`bg-white border border-gray-200 rounded-lg p-3 mb-3`}>
                                                                    <View style={tw`flex flex-row justify-between items-center mb-1`}>
                                                                        <Text style={tw`text-sm text-gray-700`}>KPI lên cấp {kpiData.nextPosition}:</Text>
                                                                        <Text style={tw`font-medium text-base ${kpiData.upgradeStatus ? 'text-green-600' : 'text-red-600'}`}>
                                                                            {formatVND(kpiData.upgradeKPI)}
                                                                        </Text>
                                                                    </View>
                                                                    {!kpiData.upgradeStatus && kpiData.upgradeMissing > 0 && (
                                                                        <View>
                                                                            <View style={tw`h-2 bg-gray-200 rounded-full overflow-hidden`}>
                                                                                <View style={[tw`h-full bg-blue-500 rounded-full`, { width: `${progressWidth(kpiData.kpiData.totalKPISales, kpiData.upgradeKPI)}%` }]} />
                                                                            </View>
                                                                            <Text style={tw`text-xs text-red-600 text-right mt-1`}>
                                                                                Còn thiếu {formatVND(kpiData.upgradeMissing)}
                                                                            </Text>
                                                                        </View>
                                                                    )}
                                                                    {kpiData.upgradeStatus && (
                                                                        <View style={tw`flex flex-row items-center mt-1`}>
                                                                            <Icon name="check-circle" size={14} style={tw`text-green-600 mr-1`} />
                                                                            <Text style={tw`text-xs text-green-600`}>Đã đủ điều kiện lên cấp {kpiData.nextPosition}!</Text>
                                                                        </View>
                                                                    )}

                                                                    {/* Single order upgrade notice */}
                                                                    {kpiData.singleOrderUpgrade && kpiData.singleOrderUpgrade.eligible && (
                                                                        <View style={tw`mt-3 bg-green-50 border border-green-200 rounded-lg p-3`}>
                                                                            <View style={tw`flex flex-row items-start`}>
                                                                                <Icon name="rocket" size={16} style={tw`text-green-600 mr-2`} />
                                                                                <Text style={tw`text-green-700 text-xs`}>
                                                                                    Bạn đã có đơn hàng riêng lẻ đủ điều kiện lên {kpiData.singleOrderUpgrade.newPosition}.
                                                                                </Text>
                                                                            </View>
                                                                        </View>
                                                                    )}
                                                                </View>
                                                            )}

                                                            {/* Thông báo */}
                                                            {kpiData.messages && kpiData.messages.length > 0 && (
                                                                <View style={tw`mt-3`}>
                                                                    {kpiData.messages.map((msg, index) => {
                                                                        const isSuccess = msg.includes('đủ điều kiện') || msg.includes('đạt KPI') || msg.includes('Chúc mừng') || msg.includes('thăng cấp');
                                                                        const isWarning = msg.includes('thiếu') || msg.includes('cần thêm');
                                                                        
                                                                        let bgColor = 'bg-blue-50';
                                                                        let borderColor = 'border-blue-300';
                                                                        let textColor = 'text-blue-800';
                                                                        let iconColor = 'text-blue-600';
                                                                        let iconName = 'information';

                                                                        if (isSuccess) {
                                                                            bgColor = 'bg-green-50';
                                                                            borderColor = 'border-green-300';
                                                                            textColor = 'text-green-800';
                                                                            iconColor = 'text-green-600';
                                                                            iconName = 'check-circle';
                                                                        } else if (isWarning) {
                                                                            bgColor = 'bg-yellow-50';
                                                                            borderColor = 'border-yellow-300';
                                                                            textColor = 'text-yellow-800';
                                                                            iconColor = 'text-yellow-600';
                                                                            iconName = 'alert';
                                                                        }

                                                                        return (
                                                                            <View 
                                                                                key={index} 
                                                                                style={tw`${bgColor} ${borderColor} border rounded-lg p-3 mb-2`}
                                                                            >
                                                                                <View style={tw`flex flex-row items-start`}>
                                                                                    <Icon name={iconName} size={16} style={tw`${iconColor} mr-2 mt-0.5`} />
                                                                                    <Text style={tw`${textColor} text-xs flex-1`}>{msg}</Text>
                                                                                </View>
                                                                            </View>
                                                                        );
                                                                    })}
                                                                </View>
                                                            )}
                                                        </View>
                                                    )}

                                                    {/* All Levels Overview */}
                                                    <View style={tw`bg-white border border-gray-200 rounded-lg p-3`}>
                                                        <Text style={tw`font-bold text-gray-800 text-base mb-3`}>
                                                            Tổng quan hệ thống cấp bậc
                                                        </Text>
                                                        <View style={tw`space-y-2`}>
                                                            {(levels || []).map((level, index) => {
                                                                const isCurrent = level.name === currentPositionName;
                                                                const isPast = Number(level.positionNumber) < currentPositionNumber;

                                                                return (
                                                                    <View
                                                                        key={`${level.name}-${index}`}
                                                                        style={tw`p-3 rounded-lg border ${
                                                                            isCurrent
                                                                                ? 'border-blue-500 bg-blue-50'
                                                                                : isPast
                                                                                ? 'border-green-200 bg-green-50'
                                                                                : 'border-gray-200'
                                                                        }`}
                                                                    >
                                                                        <View style={tw`flex flex-row items-center justify-between`}>
                                                                            <View style={tw`flex flex-row items-center`}>
                                                                                <Icon name="star" size={16} style={{ color: levelColors[level.positionNumber] || '#6b7280' }} />
                                                                                <Text style={tw`ml-2 font-semibold ${isCurrent ? 'text-blue-600' : isPast ? 'text-green-600' : 'text-gray-800'}`}>
                                                                                    {level.name}
                                                                                </Text>
                                                                            </View>
                                                                            <Text style={tw`text-sm text-gray-600`}>
                                                                                Chiết khấu: {level.discountPercent}%
                                                                            </Text>
                                                                        </View>

                                                                        {level.positionNumber >= 2 && (
                                                                            <View style={tw`mt-2 space-y-1`}>
                                                                                {level.kpiUpgrade > 0 && (
                                                                                    <View style={tw`flex flex-row justify-between`}>
                                                                                        <Text style={tw`text-xs text-gray-600`}>KPI lên cấp:</Text>
                                                                                        <Text style={tw`text-xs font-medium`}>{formatVND(level.kpiUpgrade)}</Text>
                                                                                    </View>
                                                                                )}
                                                                                {level.kpiMaintain > 0 && (
                                                                                    <View style={tw`flex flex-row justify-between`}>
                                                                                        <Text style={tw`text-xs text-gray-600`}>KPI duy trì:</Text>
                                                                                        <Text style={tw`text-xs font-medium`}>{formatVND(level.kpiMaintain)}</Text>
                                                                                    </View>
                                                                                )}
                                                                                {(level.kpiUpgrade > 0 || level.kpiMaintain > 0) && (
                                                                                    <Text style={tw`text-xs text-gray-500`}>
                                                                                        (Doanh số cá nhân + F1 + F2 trong {checkMonths} tháng)
                                                                                    </Text>
                                                                                )}
                                                                                {level.minSingleOrder > 0 && (
                                                                                    <View style={tw`flex flex-row justify-between`}>
                                                                                        <Text style={tw`text-xs text-gray-600`}>Đơn hàng riêng lẻ tối thiểu:</Text>
                                                                                        <Text style={tw`text-xs font-medium text-blue-600`}>{formatVND(level.minSingleOrder)}</Text>
                                                                                    </View>
                                                                                )}
                                                                            </View>
                                                                        )}

                                                                        {level.positionNumber < 2 && (
                                                                            <View style={tw`mt-1`}>
                                                                                <Text style={tw`text-xs text-gray-500`}>
                                                                                    {level.positionNumber === 0 ? 'Không có yêu cầu đặc biệt' : 'Chỉ cần có một đơn hàng thành công'}
                                                                                </Text>
                                                                            </View>
                                                                        )}
                                                                    </View>
                                                                )
                                                            })}
                                                        </View>
                                                    </View>
                                                </View>
                                            )
                                        })()}
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* Position History Modal */}
                <Modal
                    visible={showHistoryModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowHistoryModal(false)}
                >
                    <View style={tw`flex-1 bg-black bg-opacity-50 justify-end`}>
                        <View style={tw`bg-white rounded-t-xl max-h-5/6`}>
                            {/* Modal Header */}
                            <View style={tw`px-4 py-3 border-b border-gray-200 flex flex-row items-center justify-between`}>
                                <Text style={tw`font-bold text-lg text-gray-800`}>Lịch sử cấp bậc</Text>
                                <TouchableOpacity
                                    onPress={() => setShowHistoryModal(false)}
                                    style={tw`w-8 h-8 rounded-full bg-gray-100 items-center justify-center`}
                                >
                                    <Icon name="close" size={16} style={tw`text-gray-600`} />
                                </TouchableOpacity>
                            </View>

                            {/* Modal Content */}
                            <ScrollView style={tw`px-4 py-3`}>
                                {loadingHistory ? (
                                    <View style={tw`py-6 items-center`}>
                                        <ActivityIndicator />
                                        <Text style={tw`text-gray-600 mt-2`}>Đang tải lịch sử...</Text>
                                    </View>
                                ) : positionHistory.length === 0 ? (
                                    <View style={tw`py-6 items-center`}>
                                        <Icon name="history" size={48} style={tw`text-gray-300 mb-2`} />
                                        <Text style={tw`text-gray-600`}>Chưa có lịch sử cấp bậc</Text>
                                    </View>
                                ) : (
                                    <View style={tw`space-y-4`}>
                                        {positionHistory.map((item, index) => (
                                            <View
                                                key={index}
                                                style={tw`flex flex-row items-start pb-4 ${index !== positionHistory.length - 1 ? 'border-b border-gray-200' : ''}`}
                                            >
                                                <View style={tw`flex-shrink-0 mt-1 mr-3`}>
                                                    {getHistoryIcon(item)}
                                                </View>
                                                <View style={tw`flex-1`}>
                                                    <Text style={tw`font-semibold text-base mb-1 text-gray-800`}>
                                                        {item.position}
                                                    </Text>
                                                    <Text style={tw`text-gray-600 text-sm mb-1`}>
                                                        {item.description}
                                                    </Text>
                                                    <Text style={tw`text-gray-400 text-xs`}>
                                                        {formatDateTime(item.date)}
                                                    </Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

			</View>
		)
	);
}

export default AccountScreen;
