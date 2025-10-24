import React, {useEffect, useState} from "react";
import {
	ActivityIndicator,
	// Image,
	Platform,
	RefreshControl,
	ScrollView,
	Share,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
// import affiliateImage from '../../assets/images/affiliate.jpg'
import {useDispatch, useSelector} from "react-redux";
import {formatDateTime, formatNumber, formatVND} from "app/utils/helper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";
import TreeView from "react-native-final-tree-view";
import QRCode from "react-native-qrcode-svg";
import Logo from '../../assets/images/logo.png'
import {GetMe} from "app/screens/Auth/action";
import DateRangeSelect from "app/components/DateRangeSelect";
import moment from "moment";

function AffiliateProgramScreen(props) {
	const dispatch = useDispatch();
	const currentUser = useSelector(state => state.memberAuth.user);
	const settings = useSelector(state => state.SettingsReducer.options)
	const [users, setUsers] = useState();
	const [members, setMembers] = useState();
	const [loadingMembers, setLoadingMembers] = useState(false);
	const [refresh, setRefresh] = useState(false);
	const [activeTab, setActiveTab] = useState('list'); // 'tree' | 'list'
	const [availableLevels, setAvailableLevels] = useState([]);
	const [selectedLevel, setSelectedLevel] = useState(1);
	const [loadingLevels, setLoadingLevels] = useState(false);
	const [changingLevel, setChangingLevel] = useState(false);
	const [dateRange, setDateRange] = useState([
		moment().startOf('month'),
		moment().endOf('month')
	]);

	useEffect(() => {
		props.navigation.setOptions({
			title: 'Chương trình Affiliate',
			headerStyle: {
				backgroundColor: '#008A97',
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

	// Load available levels only once
	useEffect(() => {
		async function getAvailableLevels() {
			const Token = await AsyncStorage.getItem('sme_user_token');
			setLoadingLevels(true)
			axios({
				method: 'get',
				url: `${apiConfig.BASE_URL}/user/system/levels`,
				headers: {Authorization: `Bearer ${Token}`}
			}).then(function (response) {
				if (response.status === 200) {
					console.log('Available levels:', response.data.levels);
					setAvailableLevels(response.data.levels);
					// Set default level to first available level only if not already set
					if (response.data.levels && response.data.levels.length > 0 && selectedLevel === 1) {
						setSelectedLevel(response.data.levels[0].level);
					}
				}
				setLoadingLevels(false)
			}).catch(function(error){
				console.log('Error loading levels:', error);
				// Fallback: show basic levels if API fails
				console.log('Using fallback levels: [1, 2, 3, 4, 5, 6, 7]');
				setAvailableLevels([
					{level: 1, count: 0},
					{level: 2, count: 0},
					{level: 3, count: 0},
					{level: 4, count: 0},
					{level: 5, count: 0},
					{level: 6, count: 0},
					{level: 7, count: 0}
				]);
				setLoadingLevels(false)
			})
		}
		getAvailableLevels();
	}, [refresh])

	// Load members when selectedLevel changes
	useEffect(() => {
		async function getMemberList() {
			const Token = await AsyncStorage.getItem('sme_user_token');
			setLoadingMembers(true)
			setChangingLevel(true)
			axios({
				method: 'get',
				url: `${apiConfig.BASE_URL}/user/system`,
				params: { status: 'ALL', level: selectedLevel },
				headers: {Authorization: `Bearer ${Token}`}
			}).then(function (response) {
				if (response.status === 200) {
					setMembers(response.data);
				}
				setLoadingMembers(false)
				setChangingLevel(false)
			}).catch(function(error){
				console.log(error);
				setLoadingMembers(false)
				setChangingLevel(false)
			})
		}
		getMemberList();
	}, [selectedLevel])

	// Load tree data
	useEffect(() => {
		async function getUsers() {
			const Token = await AsyncStorage.getItem('sme_user_token');
			axios({
				method: 'get',
				url: `${apiConfig.BASE_URL}/user/tree`,
				params: {
					rangeStart: dateRange[0].format('YYYY-MM-DD'),
					rangeEnd: dateRange[1].format('YYYY-MM-DD'),
				},
				headers: {Authorization: `Bearer ${Token}`}
			}).then(function (response) {
				if (response.status === 200) {
					setUsers(response.data);
					setRefresh(false)
					dispatch(GetMe(Token))
				}
			}).catch(function(error){
				console.log(error);
				setRefresh(false)
			})
		}
		getUsers();
	}, [refresh, dateRange])

	function handleShare() {
		let  text = settings && settings.sharing_text ? settings.sharing_text : '';
		if(Platform.OS === 'android')
			text = text.concat(`${settings && settings.website_url}/register${currentUser && '?ref='+currentUser.refId}`)
		else
			text = text.concat(`${settings && settings.website_url}/register${currentUser && '?ref='+currentUser.refId}`)

		Share.share({
			subject: 'Chia sẻ liên kết BBHerb',
			title: 'Chia sẻ liên kết BBHerb',
			message: text,
			url: text,
		}, {
			dialogTitle: 'Chia sẻ liên kết BBHerb',
			excludedActivityTypes: []
		})
	}

	function getIndicator(isExpanded, hasChildrenNodes) {
		if (!hasChildrenNodes) {
			return <Icon name={"minus"} />
		} else if (isExpanded) {
			return <Icon name={"minus"} />
		} else {
			return <Icon name={"plus"} />
		}
	}

	return (
		<View style={tw`bg-white h-full`}>
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
				<View style={tw`flex pb-10 pt-3`}>
					{/* Intro - compact instead of hero image */}
					<View style={tw`mx-5 mb-3 bg-white border border-gray-100 p-3 rounded-md`}>
						<Text style={tw`text-gray-600 text-xs`}>Giới thiệu bạn bè tham gia để nhận thưởng và hoa hồng theo doanh số. Sao chép liên kết hoặc chia sẻ mã QR để bắt đầu.</Text>
					</View>

					{currentUser && currentUser.refId &&
						<View>
							{/* Referral code + Share */}
							<View style={tw`flex items-center justify-between border border-blue-500 flex-row mx-5 px-2 py-1 rounded mb-3`}>
								<View>
									<Text style={tw`text-xs`}>Mã giới thiệu</Text>
									<Text style={tw`font-bold text-2xl`}>{currentUser && currentUser.refId}</Text>
								</View>
								<View style={tw`flex flex-row items-center`}>
									<TouchableOpacity
										style={tw`bg-green-600 rounded p-3 flex flex-row items-center`}
										onPress={() => handleShare()}
									>
										<Icon name="share-variant" size={18} style={tw`text-white mr-1`} />
										<Text style={tw`text-white`}>Chia sẻ</Text>
									</TouchableOpacity>
								</View>
							</View>
							{/* QR */}
							<View style={tw`flex items-center mx-auto mb-3`}>
								<QRCode
									logoSize={20}
									size={130}
									logo={Logo}
									value={`${settings && settings.website_url}/register${currentUser && "?ref=" + currentUser.refId}`}
								/>
								<Text style={tw`mt-1 text-xs text-gray-600`}>Mã QR của tôi</Text>
							</View>
							{/* Referrer */}
							{currentUser && currentUser.parent && (
								<View style={tw`mx-5 mb-3 bg-white border border-gray-100 p-3 rounded-md`}>
									<View style={tw`flex flex-row items-center`}>
										<Icon name={"account-arrow-left-outline"} size={18} style={tw`text-purple-600 mr-2`} />
										<Text style={tw`text-gray-700 text-xs`}>Người giới thiệu: <Text style={tw`font-semibold text-cyan-700`}>{currentUser.parent.refId} - {currentUser.parent.name}</Text></Text>
									</View>
								</View>
							)}
							{/* Metrics - compact cards */}
							<View style={tw`mx-5`}>
								<View style={tw`flex flex-row`}>
									<View style={tw`flex-1 bg-white border border-gray-100 p-3 rounded-md mr-1`}>
										<View>
											<View style={tw`flex flex-row items-center`}>
												<Icon name={"account-multiple-plus"} size={22} style={tw`mr-2 text-red-600`} />
												<Text style={tw`text-gray-700 text-xs`}>Giới thiệu trực tiếp</Text>
											</View>
											<Text style={tw`font-bold mt-1`}>{users && formatNumber(users.countF1)}</Text>
										</View>
									</View>
									<View style={tw`flex-1 bg-white border border-gray-100 p-3 rounded-md`}>
										<View style={tw`flex flex-col`}>
											<View style={tw`flex flex-row items-center`}>
												<Icon name={"share-variant-outline"} size={22} style={tw`mr-2 text-green-600`} />
												<Text style={tw`text-gray-700 text-xs`}>Mã giới thiệu</Text>
											</View>
											<Text style={tw`font-bold mt-1`}>{currentUser ? currentUser.refId : ''}</Text>
										</View>
									</View>
								</View>
								{/* Date Range Selector */}
								<View style={tw`my-3`}>
									<DateRangeSelect
										dateRange={dateRange}
										onSetRange={setDateRange}
									/>
								</View>
								<View style={tw`flex flex-row`}>
									<View style={tw`flex-1 bg-white border border-gray-100 p-3 rounded-md mr-1`}>
										<View>
											<View style={tw`flex flex-row items-center`}>
												<Icon name={"cash"} size={22} style={tw`mr-2 text-red-600`} />
												<Text style={tw`text-gray-700 text-xs`}>Doanh số cá nhân</Text>
											</View>
											<Text style={tw`font-bold mt-1`}>{users && formatVND(users.personalRevenue)}</Text>
										</View>
									</View>
									<View style={tw`flex-1 bg-white border border-gray-100 p-3 rounded-md`}>
										<View style={tw`flex flex-col`}>
											<View style={tw`flex flex-row items-center`}>
												<Icon name={"account-group-outline"} size={22} style={tw`mr-2 text-cyan-600`} />
												<Text style={tw`text-gray-700 text-xs`}>Doanh số nhóm</Text>
											</View>
											<Text style={tw`font-bold mt-1`}>{users && formatVND(users.groupRevenue)}</Text>
										</View>
									</View>
								</View>
							</View>
						</View>
					}

					{/* Tabs */}
					<View style={tw`mx-5 mt-3`}>
						<View style={tw`bg-gray-100 rounded-full p-1 flex-row w-56`}>
							<TouchableOpacity onPress={() => setActiveTab('list')} style={tw`flex-1`}>
								<View style={tw`${activeTab==='list' ? 'bg-white' : ''} rounded-full py-2 items-center`}>
									<Text style={tw`${activeTab==='list' ? 'text-cyan-600 font-bold' : 'text-gray-600'}`}>Danh sách</Text>
								</View>
							</TouchableOpacity>
							<TouchableOpacity onPress={() => setActiveTab('tree')} style={tw`flex-1`}>
								<View style={tw`${activeTab==='tree' ? 'bg-white' : ''} rounded-full py-2 items-center`}>
									<Text style={tw`${activeTab==='tree' ? 'text-cyan-600 font-bold' : 'text-gray-600'}`}>Sơ đồ</Text>
								</View>
							</TouchableOpacity>
						</View>
					</View>

					{/* Level Selection - only show in list tab and if there are levels */}
					{activeTab === 'list' && !loadingLevels && availableLevels && availableLevels.length > 0 && (
						<View style={tw`mx-5 mt-3`}>
							<Text style={tw`text-gray-700 text-sm font-medium mb-2`}>Chọn cấp độ:</Text>
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								style={tw`mb-3`}
							>
								<View style={tw`flex-row`}>
									{availableLevels.map((levelData) => (
										<TouchableOpacity
											key={levelData.level}
											onPress={() => setSelectedLevel(levelData.level)}
											style={tw`mr-2 px-4 py-2 rounded-full ${
												selectedLevel === levelData.level 
													? 'bg-cyan-600' 
													: 'bg-gray-100'
											}`}
										>
											<Text style={tw`text-sm font-medium ${
												selectedLevel === levelData.level 
													? 'text-white' 
													: 'text-gray-600'
											}`}>
												Level {levelData.level}
											</Text>
										</TouchableOpacity>
									))}
								</View>
							</ScrollView>
						</View>
					)}

					{/* No levels message - only show in list tab */}
					{activeTab === 'list' && !loadingLevels && (!availableLevels || availableLevels.length === 0) && (
						<View style={tw`mx-5 mt-3`}>
							<View style={tw`bg-yellow-50 border border-yellow-200 rounded-md p-4`}>
								<View style={tw`flex items-center`}>
									<Icon name={"account-group"} size={18} style={tw`text-yellow-600 mr-2`} />
									<Text style={tw`text-yellow-700 text-sm font-medium`}>
										Bạn chưa có thành viên ở các cấp độ dưới. Hãy mời bạn bè tham gia để xem danh sách thành viên.
									</Text>
								</View>
							</View>
						</View>
					)}

					{/* Content per tab */}
					{activeTab === 'tree' ? (
						<View style={tw`mx-5 mt-3`}>
							{!users ? <ActivityIndicator /> :
								<TreeView
									initialExpanded
									data={users && users.tree}
									renderNode={({ node, level, isExpanded, hasChildrenNodes }) => {
										return (
											<View>
												<Text
													style={{
														marginLeft: 25 * level,
														marginBottom: 5
													}}
												>
													{getIndicator(isExpanded, hasChildrenNodes)} {node.name} - {node.refId}
												</Text>
											</View>
										)
									}}
								/>
							}
						</View>
					) : (
						<View style={tw`mx-5 mt-3`}>
							{/* Level Info */}
							<View style={tw`bg-cyan-50 border border-cyan-200 rounded-md p-3 mb-3`}>
								<View style={tw`flex flex-row items-center`}>
									{changingLevel ? (
										<ActivityIndicator size="small" style={tw`mr-2`} />
									) : (
										<Icon name={"account-group"} size={18} style={tw`text-cyan-600 mr-2`} />
									)}
									<Text style={tw`text-cyan-700 text-sm font-medium`}>
										{changingLevel ? 'Đang tải...' : `Đang xem Level ${selectedLevel} - ${members && members.count} thành viên`}
									</Text>
								</View>
							</View>

							<View style={tw`bg-white border border-gray-200 rounded-md`}>
								<View style={{maxHeight: 320}}>
									<ScrollView showsVerticalScrollIndicator={true}>
										{loadingMembers ? (
											<View style={tw`px-3 py-4`}><ActivityIndicator /></View>
										) : members && members.list && members.list.length > 0 ? (
											members.list.map((m, idx) => (
												<View key={m.id || idx} style={tw`px-3 py-3 ${idx !== members.list.length - 1 && 'border-b border-gray-100'}`}>
													<View style={tw`flex flex-row items-center`}>
														<View style={tw`w-9 h-9 rounded-full bg-gray-100 items-center justify-center mr-3`}>
															<Icon name={"account-circle-outline"} size={20} style={tw`text-gray-500`} />
														</View>
														<View style={tw`flex-1`}>
															<Text style={tw`text-gray-900 font-medium`} numberOfLines={1}>{m.name}</Text>
															<Text style={tw`text-xs text-gray-600`} numberOfLines={1}>{m.phone}  •  ID: {m.id}</Text>
														</View>
														<View style={tw`items-end`}>
															<Text style={tw`text-xs text-blue-600 font-semibold`} numberOfLines={1}>Level: {m.level}</Text>
															<Text style={tw`text-xs text-gray-600`} numberOfLines={1}>{(m.position || '') + (m.congdoanPosition || '')}</Text>
															<Text style={tw`text-xs text-gray-500`} numberOfLines={1}>{formatDateTime(m.createdAt)}</Text>
														</View>
													</View>
												</View>
											))
										) : (
											<View style={tw`px-3 py-4`}><Text style={tw`text-gray-600`}>Không có dữ liệu</Text></View>
										)}
									</ScrollView>
								</View>
							</View>
						</View>
					)}
				</View>
			</ScrollView>
		</View>
	);
}

export default AffiliateProgramScreen;
