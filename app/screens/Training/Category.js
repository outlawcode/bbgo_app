import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import CartIcon from "app/screens/Cart/components/cartIcon";
import { apiClient } from "app/services/client";

function TrainingCategoryScreen(props) {
	const categoryId = props.route.params?.categoryId
	const categoryName = props.route.params?.categoryName
	const [refresh, setRefresh] = useState(false)
	const [loading, setLoading] = useState(false)
	const [data, setData] = useState()

	useEffect(() => {
		props.navigation.setOptions({
			title: categoryName || 'Danh mục đào tạo',
			headerStyle: { backgroundColor: '#008A97' },
			headerTintColor: '#fff',
			headerLeft: () => (
				<TouchableOpacity activeOpacity={1} onPress={() => props.navigation.goBack()}>
					<Icon name="chevron-left" size={26} style={tw`text-white ml-3`} />
				</TouchableOpacity>
			),
			headerRight: () => (
				<View style={tw`mr-3 flex flex-row items-center`}>
					<CartIcon navigation={props.navigation} />
					<TouchableOpacity activeOpacity={1} onPress={() => props.navigation.openDrawer()}>
						<Icon name={"menu"} size={30} style={tw`text-white ml-5`} />
					</TouchableOpacity>
				</View>
			)
		})
	}, [categoryName])

	useEffect(() => {
		async function fetchPosts() {
			if (!categoryId) return
			setLoading(true)
			try {
				const res = await apiClient.get(`/training-post/category/${categoryId}`, { params: { limit: 50, page: 1 } })
				setData(res.data)
			} catch (e) {
				console.log('Training posts error:', e?.response?.data || e?.message)
			} finally {
				setLoading(false)
				setRefresh(false)
			}
		}
		fetchPosts()
	}, [refresh, categoryId])

	return (
		<View style={tw`flex bg-gray-100 min-h-full`}>
			<ScrollView
				showsVerticalScrollIndicator={false}
				overScrollMode={'never'}
				scrollEventThrottle={16}
				refreshControl={<RefreshControl refreshing={refresh || loading} onRefresh={() => setRefresh(true)} title="đang tải" titleColor="#000" tintColor="#000" />}
			>
				<View style={tw`pb-10`}>
					<View style={tw`bg-white mt-3 mx-3 rounded-xl border border-gray-100`}>
						<View style={tw`px-4 py-3 border-b border-gray-100`}>
							<Text style={tw`font-semibold text-gray-800`}>{data?.category?.name || categoryName}</Text>
						</View>

						{data && data.posts && data.posts.length > 0 ? (
							data.posts.map((post, idx) => (
								<TouchableOpacity
									key={post.id || idx}
									onPress={() => props.navigation.navigate('TrainingPostModal', { slug: post.slug })}
									activeOpacity={0.7}
								>
									<View style={tw`px-4 py-3 ${idx !== data.posts.length - 1 && 'border-b border-gray-100'}`}>
										<Text style={tw`text-sm font-medium text-gray-800`} numberOfLines={2}>{post.title}</Text>
										{post.excerpt ? (
											<Text style={tw`text-xs text-gray-500 mt-0.5`} numberOfLines={2}>{post.excerpt}</Text>
										) : null}
									</View>
								</TouchableOpacity>
							))
						) : (
							<View style={tw`px-4 py-6 items-center`}>
								<Icon name={"file-document-outline"} size={40} style={tw`text-gray-300 mb-2`} />
								<Text style={tw`text-gray-600`}>Chưa có bài viết nào</Text>
							</View>
						)}
					</View>
				</View>
			</ScrollView>
		</View>
	)
}

export default TrainingCategoryScreen;


