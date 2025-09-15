import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StatusBar, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import CartIcon from "app/screens/Cart/components/cartIcon";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiConfig from "app/config/api-config";
import { formatDateTime } from "app/utils/helper";
import { showMessage } from "react-native-flash-message";

function NotificationScreen(props) {
	const [notifications, setNotifications] = useState([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [marking, setMarking] = useState(false);

	useEffect(() => {
		props.navigation.setOptions({
			title: 'Thông báo',
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
			headerRight: () => (
				<View style={tw`flex flex-row items-center`}>
					{getUnreadCount() > 0 && (
						<TouchableOpacity
							activeOpacity={0.8}
							onPress={markAllAsRead}
							disabled={marking}
						>
							<Icon name="check-all"
							      size={23}
							      style={tw`text-white mr-3`}
							/>
						</TouchableOpacity>
					)}
				</View>
			)
		})
	}, [props.navigation, notifications, marking]);

	useEffect(() => {
		fetchNotifications(page, limit, false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, limit]);

	const fetchNotifications = useCallback(async (targetPage = 1, targetLimit = 10, append = false) => {
		if (loading) return;
		setLoading(true);
		try {
			const token = await AsyncStorage.getItem('sme_user_token');
			const response = await axios({
				method: 'get',
				url: `${apiConfig.BASE_URL}/notification/member/list`,
				params: { page: targetPage, limit: targetLimit },
				headers: { Authorization: `Bearer ${token}` },
			});
			if (response.status === 200) {
				const data = response.data;
				setTotal(data.total || 0);
				setNotifications(prev => append ? [...prev, ...(data.list || [])] : (data.list || []));
			}
		} catch (error) {
			console.log('Fetch notifications error:', error);
			showMessage({ type: 'danger', message: 'Bạn cần đăng nhập để xem thông báo' });
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, [loading]);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		setPage(1);
		fetchNotifications(1, limit, false);
	}, [limit, fetchNotifications]);

	const loadMore = useCallback(() => {
		if (loading) return;
		const hasMore = notifications.length < total;
		if (!hasMore) return;
		const nextPage = page + 1;
		setPage(nextPage);
		fetchNotifications(nextPage, limit, true);
	}, [loading, notifications.length, total, page, limit, fetchNotifications]);

	const getUnreadCount = () => notifications.filter(item => !item.isRead).length;

	const markAsRead = async (notificationId) => {
		if (marking) return;
		setMarking(true);
		try {
			const token = await AsyncStorage.getItem('sme_user_token');
			await axios({
				method: 'put',
				url: `${apiConfig.BASE_URL}/notification/member/mark-read/${notificationId}`,
				headers: { Authorization: `Bearer ${token}` },
			});
			setNotifications(prev => prev.map(item => item.notification.id === notificationId ? { ...item, isRead: true, readAt: new Date().toISOString() } : item));
			showMessage({ type: 'success', message: 'Đã đánh dấu đã đọc' });
		} catch (error) {
			console.log('Mark as read error:', error);
			showMessage({ type: 'danger', message: 'Có lỗi xảy ra' });
		} finally {
			setMarking(false);
		}
	};

	const markAllAsRead = async () => {
		if (marking || getUnreadCount() === 0) return;
		setMarking(true);
		try {
			const token = await AsyncStorage.getItem('sme_user_token');
			await axios({
				method: 'put',
				url: `${apiConfig.BASE_URL}/notification/member/mark-all-read`,
				headers: { Authorization: `Bearer ${token}` },
			});
			setNotifications(prev => prev.map(item => ({ ...item, isRead: true, readAt: item.readAt || new Date().toISOString() })));
			showMessage({ type: 'success', message: 'Đã đánh dấu tất cả thông báo là đã đọc' });
		} catch (error) {
			console.log('Mark all as read error:', error);
			showMessage({ type: 'danger', message: 'Có lỗi xảy ra' });
		} finally {
			setMarking(false);
		}
	};

	const renderItem = ({ item }) => (
		<View style={tw`mx-4 mb-2 bg-white rounded-xl border ${!item.isRead ? 'border-blue-200 bg-blue-50' : 'border-gray-100'} p-3`}>
			<View style={tw`flex flex-row items-start justify-between`}>
				<View style={tw`flex-1 pr-3`}>
					<Text style={tw`text-gray-900 font-semibold mb-1`} numberOfLines={2}>
						{item?.notification?.title}
					</Text>
					<Text style={tw`text-gray-700 text-xs mb-2`} numberOfLines={3}>
						{item?.notification?.content}
					</Text>
					<View style={tw`flex flex-row items-center`}>
						<Icon name="clock-outline" size={14} style={tw`text-gray-500 mr-1`} />
						<Text style={tw`text-gray-500 text-xs`}>{formatDateTime(item?.createdAt)}</Text>
						{item?.isRead && item?.readAt ? (
							<Text style={tw`text-gray-400 text-xs ml-3`}>Đã đọc: {formatDateTime(item.readAt)}</Text>
						) : null}
					</View>
				</View>
				{!item?.isRead ? (
					<TouchableOpacity
						onPress={() => markAsRead(item?.notification?.id)}
						disabled={marking}
						style={tw`bg-white border border-blue-200 px-3 py-1 rounded-lg`}
					>
						<Text style={tw`text-blue-600 text-xs font-semibold`}>Đã đọc</Text>
					</TouchableOpacity>
				) : null}
			</View>
		</View>
	);

	const ListHeader = () => (
		<View>
			{/* Summary + Actions */}
			<View style={tw`mx-4 mt-3 mb-2`}>
				<View style={tw`bg-white rounded-xl border border-gray-100 p-3 flex flex-row items-center justify-between`}>
					<View>
						<Text style={tw`text-gray-800 font-semibold`}>Tổng thông báo: {total}</Text>
						<Text style={tw`text-gray-500 text-xs mt-0.5`}>Chưa đọc: {getUnreadCount()} • Đã đọc: {Math.max(0, total - getUnreadCount())}</Text>
					</View>
					{getUnreadCount() > 0 ? (
						<TouchableOpacity onPress={markAllAsRead} disabled={marking} style={tw`bg-blue-50 px-3 py-1 rounded-lg border border-blue-200`}>
							<View style={tw`flex flex-row items-center`}>
								<Icon name="check-all" size={16} style={tw`text-blue-600 mr-1`} />
								<Text style={tw`text-blue-600 text-xs font-semibold`}>Đã đọc tất cả</Text>
							</View>
						</TouchableOpacity>
					) : null}
				</View>
			</View>
		</View>
	);

	const ListFooter = () => (
		<View style={tw`py-4`}>
			{loading && notifications.length > 0 ? (
				<View style={tw`py-2`}>
					<ActivityIndicator size="small" color="#008A97" />
				</View>
			) : notifications.length < total ? (
				<TouchableOpacity onPress={loadMore} style={tw`mx-4 bg-white rounded-xl border border-gray-100 py-2 items-center`}>
					<Text style={tw`text-cyan-700 font-medium`}>Tải thêm</Text>
				</TouchableOpacity>
			) : (
				<View style={tw`items-center`}>
					<Text style={tw`text-gray-400 text-xs`}>Đã hiển thị tất cả</Text>
				</View>
			)}
		</View>
	);

	return (
		<View style={tw`flex-1 bg-gray-50`}>
			<StatusBar barStyle={"dark-content"}/>
			{loading && notifications.length === 0 ? (
				<View style={tw`flex-1 items-center justify-center`}>
					<ActivityIndicator size="small" color="#008A97" />
					<Text style={tw`text-gray-500 text-xs mt-2`}>Đang tải thông báo...</Text>
				</View>
			) : notifications.length === 0 ? (
				<View style={tw`flex-1 items-center justify-center px-6`}>
					<View style={tw`items-center`}>
						<Icon name="bell-outline" size={40} style={tw`text-gray-400 mb-2`} />
						<Text style={tw`text-gray-600 mb-1`}>Bạn chưa có thông báo nào</Text>
						<TouchableOpacity onPress={onRefresh} style={tw`mt-2 bg-white border border-gray-200 px-4 py-1.5 rounded-lg`}>
							<Text style={tw`text-cyan-700 font-medium text-sm`}>Tải lại</Text>
						</TouchableOpacity>
					</View>
				</View>
			) : (
				<FlatList
					data={notifications}
					keyExtractor={(item) => String(item?.notification?.id)}
					renderItem={renderItem}
					ListHeaderComponent={ListHeader}
					ListFooterComponent={ListFooter}
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" title="đang tải" titleColor="#000" />}
					contentContainerStyle={tw`pb-4`}
				/>
			)}
		</View>
	);
}

export default NotificationScreen;
