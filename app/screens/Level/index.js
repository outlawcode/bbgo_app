import React, { useEffect } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import { formatVND } from "app/utils/helper";
import { useSelector } from "react-redux";
import { UserLevel } from "app/models/commons/member.model";
import * as Progress from 'react-native-progress';

function AccountLevelScreen(props) {
	const currentUser = useSelector(state => state.memberAuth.user);
	const settings = useSelector(state => state.SettingsReducer.options);

	return (
		!currentUser ? <ActivityIndicator /> :
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
						<Text  style={tw`text-white mb-3 font-medium text-lg`}>Doanh số cộng dồn</Text>
						<Text  style={tw`text-white font-bold text-4xl mb-3`}>{currentUser && formatVND(currentUser.sales)}</Text>
						<Text  style={tw`text-white text-base`}>Cấp bậc: <Text style={tw`font-bold`}>{UserLevel.map((item) => item.code === currentUser.level && item.name)}</Text></Text>
						{currentUser.officeStatus && currentUser.officeStatus === 'TRUE' &&
							<Text  style={tw`text-white text-base`}>Bạn đang là <Text style={tw`font-bold`}>Văn phòng kinh doanh</Text></Text>
						}
					</View>
				</View>
			</View>
			<ScrollView
				showsVerticalScrollIndicator={false}
				overScrollMode={'never'}
				scrollEventThrottle={16}
			>
				<View style={tw`pb-64 my-5 mx-3`}>
					<View style={tw`mb-5 bg-blue-50 p-3 border border-blue-300`}>
						{(Number(currentUser.sales) < Number(settings && settings.upgrade_to_agency_level3_value)) && (Number(currentUser.sales) >= Number(settings && settings.upgrade_to_agency_level2_value))
							&&
							<View>
								<Text>Bạn cần <Text  style={tw`font-medium text-red-600`}>{formatVND(Number(settings && settings.upgrade_to_agency_level3_value) - Number(currentUser.sales))}</Text> nữa để lên cấp <Text style={tw`font-bold text-green-600`}>Đại lý cấp 3</Text></Text>

							</View>
						}
						{(Number(currentUser.sales) < Number(settings && settings.upgrade_to_agency_level2_value)) && (Number(currentUser.sales) >= Number(settings && settings.upgrade_to_agency_level1_value))
							&&
							<View>
								<Text>Bạn cần <Text  style={tw`font-medium text-red-600`}>{formatVND(Number(settings && settings.upgrade_to_agency_level2_value) - Number(currentUser.sales))}</Text> nữa để lên cấp <Text style={tw`font-bold text-green-600`}>Đại lý cấp 2</Text></Text>

							</View>
						}
						{(Number(currentUser.sales) < Number(settings && settings.upgrade_to_agency_level1_value)) && (Number(currentUser.sales) >= Number(settings && settings.upgrade_to_agency_value))
							&&
							<View>
								<Text>Bạn cần <Text  style={tw`font-medium text-red-600`}>{formatVND(Number(settings && settings.upgrade_to_agency_level1_value) - Number(currentUser.sales))}</Text> nữa để lên cấp <Text style={tw`font-bold text-green-600`}>Đại lý cấp 1</Text></Text>

							</View>
						}
						{(Number(currentUser.sales) < Number(settings && settings.upgrade_to_agency_value))
							&&
							<View>
								<Text>Bạn cần <Text  style={tw`font-medium text-red-600`}>{formatVND(Number(settings && settings.upgrade_to_agency_value) - Number(currentUser.sales))}</Text> nữa để lên cấp <Text style={tw`font-bold text-green-600`}>Đại lý</Text></Text>
								<Progress.Bar progress={(Number(currentUser.sales) / Number(settings.upgrade_to_agency_value))} style={tw`mt-3`} width={null} height={8}/>
							</View>
						}
					</View>
					<View style={tw`mb-5`}>
						<View style={tw`mb-3 flex flex-row items-center`}>
							<Icon name={"chart-box-outline"} size={18} style={tw`mr-2 text-green-600`}/>
							<Text  style={tw`font-bold text-green-600`}>Chính sách lên cấp</Text>
						</View>
						<View>
							<View style={tw`flex flex-row items-center justify-between pb-3 mb-3 border-b border-gray-200`}>
								<Text>Doanh số &ge; {formatVND(settings && settings.upgrade_to_agency_value)}</Text>
								<Text>Đại lý</Text>
							</View>
							<View style={tw`flex flex-row items-center justify-between pb-3 mb-3 border-b border-gray-200`}>
								<Text>Doanh số &ge; {formatVND(settings && settings.upgrade_to_agency_level1_value)}</Text>
								<Text>Đại lý cấp 1</Text>
							</View>
							<View style={tw`flex flex-row items-center justify-between pb-3 mb-3 border-b border-gray-200`}>
								<Text>Doanh số &ge; {formatVND(settings && settings.upgrade_to_agency_level2_value)}</Text>
								<Text>Đại lý cấp 2</Text>
							</View>
							<View style={tw`flex flex-row items-center justify-between pb-3 mb-3 border-b border-gray-200`}>
								<Text>Doanh số &ge; {formatVND(settings && settings.upgrade_to_agency_level3_value)}</Text>
								<Text>Đại lý cấp 3</Text>
							</View>
						</View>
					</View>
					<View style={tw`mb-5`}>
						<View style={tw`mb-3 flex flex-row items-center`}>
							<Icon name={"license"} size={18} style={tw`mr-2 text-orange-500`}/>
							<Text  style={tw`font-bold text-orange-500`}>Quyền lợi các cấp</Text>
						</View>

						<View>
							<View style={tw`pb-3 mb-3 border-b border-gray-200`}>
								<Text  style={tw`font-bold`}>Đại lý: <Text style={tw`font-normal`}>Chiết khấu trực tiếp <Text style={tw`font-bold text-green-600`}>{settings && settings.agency_order_value_gt_percent}%</Text></Text></Text>
							</View>
							<View style={tw`pb-3 mb-3 border-b border-gray-200`}>
								<Text  style={tw`font-bold`}>Đại lý cấp 1: <Text style={tw`font-normal`}>Chiết khấu trực tiếp <Text style={tw`font-bold text-green-600`}>{settings && settings.agency_discount_level1}%</Text> + thưởng <Text style={tw`font-bold text-red-600`}>{settings && settings.reward_agency_level1}%</Text> vào ví mua hàng</Text></Text>
							</View>
							<View style={tw`pb-3 mb-3 border-b border-gray-200`}>
								<Text  style={tw`font-bold`}>Đại lý cấp 2: <Text style={tw`font-normal`}>Chiết khấu trực tiếp <Text style={tw`font-bold text-green-600`}>{settings && settings.agency_discount_level2}%</Text> + thưởng <Text style={tw`font-bold text-red-600`}>{settings && settings.reward_agency_level2}%</Text> vào ví mua hàng</Text></Text>
							</View>
							<View style={tw`pb-3 mb-3 border-b border-gray-200`}>
								<Text  style={tw`font-bold`}>Đại lý cấp 3: <Text style={tw`font-normal`}>Chiết khấu trực tiếp <Text style={tw`font-bold text-green-600`}>{settings && settings.agency_discount_level3}%</Text> + thưởng <Text style={tw`font-bold text-red-600`}>{settings && settings.reward_agency_level3}%</Text> vào ví mua hàng</Text></Text>
							</View>
						</View>
					</View>
				</View>
			</ScrollView>
		</View>
	);
}

export default AccountLevelScreen;
