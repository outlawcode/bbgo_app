import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import CartIcon from "app/screens/Cart/components/cartIcon";
import { apiClient } from "app/services/client";

function TrainingScreen(props) {
	const [refresh, setRefresh] = useState(false)
	const [loading, setLoading] = useState(false)
	const [categories, setCategories] = useState([])

	useEffect(() => {
		props.navigation.setOptions({
			title: 'Đào tạo',
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
		async function fetchCategories() {
			setLoading(true)
			try {
				const res = await apiClient.get('/training/categories')
				const all = Array.isArray(res.data) ? res.data : []
				const onlyTraining = all.filter(c => c && (c.isTraining === true || c.isTraining === 1))
				setCategories(onlyTraining)
			} catch (e) {
				console.log('Training categories error:', e?.response?.data || e?.message)
			} finally {
				setLoading(false)
				setRefresh(false)
			}
		}
		fetchCategories()
	}, [refresh])

	return (
		<View style={tw`flex bg-gray-100 min-h-full`}>
			<ScrollView
				showsVerticalScrollIndicator={false}
				overScrollMode={'never'}
				scrollEventThrottle={16}
				refreshControl={
					<RefreshControl
						refreshing={refresh || loading}
						onRefresh={() => setRefresh(true)}
						title="đang tải"
						titleColor="#000"
						tintColor="#000"
					/>
				}
			>
				<View style={tw`pb-10`}>
					<View style={tw`bg-white mt-3 mx-3 rounded-xl border border-gray-100`}>
						<View style={tw`px-4 py-3 border-b border-gray-100 flex flex-row items-center`}>
							<Icon name={"school-outline"} size={18} style={tw`text-gray-700 mr-2`} />
							<Text style={tw`font-semibold text-gray-800`}>Danh mục đào tạo</Text>
						</View>

						{categories && categories.length > 0 ? categories.map((cat, idx) => (
							<TouchableOpacity
								key={cat.id || idx}
								onPress={() => props.navigation.navigate('TrainingCategory', { categoryId: cat.id, categoryName: cat.name })}
								activeOpacity={0.7}
							>
								<View style={tw`px-4 py-3 flex flex-row items-center ${idx !== categories.length - 1 && 'border-b border-gray-100'}`}>
									<View style={tw`w-8 h-8 bg-blue-100 rounded-lg items-center justify-center mr-3`}>
										<Icon name={"folder"} size={16} style={tw`text-blue-600`} />
									</View>
									<View style={tw`flex-1`}>
										<Text style={tw`text-sm font-medium text-gray-800`}>{cat.name}</Text>
										{cat.description ? (
											<Text style={tw`text-xs text-gray-500 mt-0.5`} numberOfLines={2}>{cat.description}</Text>
										) : null}
									</View>
									<Icon name={"chevron-right"} size={16} style={tw`text-gray-400`} />
								</View>
							</TouchableOpacity>
						)) : (
							<View style={tw`px-4 py-6 items-center`}>
								<Icon name={"file-document-outline"} size={40} style={tw`text-gray-300 mb-2`} />
								<Text style={tw`text-gray-600`}>Chưa có danh mục đào tạo</Text>
							</View>
						)}
					</View>
				</View>
			</ScrollView>
		</View>
	)
}

export default TrainingScreen;


