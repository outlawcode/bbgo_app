import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Image,
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
import affiliateImage from '../../assets/images/affiliate.jpg'
import { useDispatch, useSelector } from "react-redux";
import { formatNumber, formatVND } from "app/utils/helper";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import ApiConfig from "app/config/api-config";
import apiConfig from "app/config/api-config";
import { showMessage } from "react-native-flash-message";
import Clipboard from '@react-native-community/clipboard';
import TreeView from "react-native-final-tree-view";
import QRCode from "react-native-qrcode-svg";
import Logo from '../../assets/images/logo.png'
import ActiveCard from "app/screens/ActiveCard";
import { GetMe } from "app/screens/Auth/action";

function AffiliateProgramScreen(props) {
	const dispatch = useDispatch();
	const currentUser = useSelector(state => state.memberAuth.user);
	const settings = useSelector(state => state.SettingsReducer.options)
	const [users, setUsers] = useState();
	const [refresh, setRefresh] = useState(false);

	useEffect(() => {
		props.navigation.setOptions({
			title: 'Chương trình Affiliate',
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
		async function getUsers() {
			const Token = await AsyncStorage.getItem('sme_user_token');
			axios({
				method: 'get',
				url: `${apiConfig.BASE_URL}/user/tree`,
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
	}, [refresh])

	console.log(users);

	function handleShare() {
		let  text = settings && settings.sharing_text ? settings.sharing_text : '';
		if(Platform.OS === 'android')
			text = text.concat(`${settings && settings.mk_website_url}/register${currentUser && '?ref='+currentUser.refId}`)
		else
			text = text.concat(`${settings && settings.mk_website_url}/register${currentUser && '?ref='+currentUser.refId}`)

		Share.share({
			subject: 'Chia sẻ liên kết SME Mart',
			title: 'Chia sẻ liên kết SME Mart',
			message: text,
			url: text,

		}, {
			// Android only:
			dialogTitle: 'Chia sẻ liên kết SME Mart',
			// iOS only:
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
					<Image source={affiliateImage} style={tw`w-full h-50 mb-5`} />
					{currentUser && currentUser.refId ?
						<View>
							<View
								style={tw`flex items-center justify-between border border-blue-500 flex-row mx-5 px-2 py-1 rounded mb-3`}>
								<View>
									<Text style={tw`text-xs`}>Mã giới thiệu</Text>
									<Text style={tw`font-bold text-2xl`}>{currentUser && currentUser.refId}</Text>
								</View>
								<View style={tw`flex flex-row items-center`}>
									{/*<TouchableOpacity
								style={tw`bg-orange-500 rounded p-3 mr-2`}
								onPress={() => {
									Clipboard.setString(`${currentUser && currentUser.id}`);
									showMessage({
										message: 'Đã sao chép mã giới thiệu',
										type: 'success',
										icon: 'success',
										duration: 3000,
									});
								}}
							>
								<Text  style={tw`text-white`}>Copy</Text>
							</TouchableOpacity>*/}
									<TouchableOpacity
										style={tw`bg-green-600 rounded p-3 flex flex-row items-center`}
										onPress={() => handleShare()}
									>
										<Icon name="share-variant"
										      size={18}
										      style={tw`text-white mr-1`}
										/>
										<Text style={tw`text-white`}>Chia sẻ</Text>
									</TouchableOpacity>
								</View>
							</View>
							<View style={tw`flex items-center mx-auto mb-5`}>
								<QRCode
									logoSize={20}
									size={150}
									logo={Logo}
									value={`${settings && settings.mk_website_url}/register${currentUser && "?ref=" + currentUser.refId}`}
								/>
								<Text style={tw`mt-2`}>Mã QR của tôi</Text>
							</View>
							<View style={tw`mb-3 mx-3 bg-white border border-gray-200 p-3 rounded-md`}>
								<View
									style={tw`flex items-center justify-between flex-row`}
								>
									<View style={tw`flex items-center flex-row`}>
										<Icon name={"account-multiple-plus"} size={32} style={tw`mr-2 text-red-600`} />
										<View>
											<Text style={tw`text-gray-500 text-xs -mb-1`}>F1</Text>
											<Text style={tw`font-medium text-base text-gray-700`}>Giới thiệu trực
												tiếp</Text>
										</View>

									</View>
									<View style={tw`flex items-center flex-row`}>
										<Text
											style={tw`font-bold text-lg mr-2`}>{users && formatNumber(users.countF1)}</Text>
									</View>
								</View>
							</View>
							<View style={tw`mb-3 mx-3 bg-white border border-gray-200 p-3 rounded-md`}>
								<View
									style={tw`flex items-center justify-between flex-row`}
								>
									<View style={tw`flex items-center flex-row`}>
										<Icon name={"chart-box-plus-outline"} size={32}
										      style={tw`mr-2 text-green-600`} />
										<View>
											<Text style={tw`text-gray-500 text-xs -mb-1`}>Sales</Text>
											<Text style={tw`font-medium text-base text-gray-700`}>Doanh thu giới
												thiệu</Text>
										</View>

									</View>
									<View style={tw`flex items-center flex-row`}>
										<Text
											style={tw`font-bold text-lg mr-2`}>{currentUser && formatVND(currentUser.sales)}</Text>
									</View>
								</View>
							</View>
						</View>
						:
						<View style={tw`mb-3 mx-3 bg-blue-50 border border-blue-200 flex items-center p-5 rounded`}>
							<Text style={tw`mb-3 text-center`}>
								Kích hoạt thẻ để tham gia chương trình Affiliate và hưởng nhiều ưu đãi của thành viên VIP.
							</Text>
							<TouchableOpacity
								style={tw`bg-green-600 px-3 py-2 rounded`}
								onPress={() => props.navigation.navigate('Modal', {content: <ActiveCard navigation={props.navigation} backScreen={'AffiliateProgram'} />})}
							>
								<Text style={tw`text-white font-bold`}>Kích hoạt ngay</Text>
							</TouchableOpacity>
						</View>
					}
					<View style={tw`mx-5`}>
						<View style={tw`flex flex-row items-center`}>
							<Icon name={"account-group"} size={24} style={tw`-mt-4 mr-2 text-blue-500`} />
							<Text style={tw`font-medium text-gray-700 text-base mb-3 text-blue-500`}>Danh sách thành viên</Text>
						</View>

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
				</View>
			</ScrollView>
		</View>
	);
}

export default AffiliateProgramScreen;
