import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StatusBar, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import { useDispatch, useSelector } from "react-redux";
import PostDetailLoading from "app/screens/Posts/components/PostDetailLoading";
import { apiClient } from "app/services/client";
import { showMessage } from "react-native-flash-message";
import DynamicWebView from "app/components/DynamicWebView";
import FaqItem from "app/screens/FAQPage/FAQItem";

function FAQPageScreen(props) {
	const params = props.route.params
	const dispatch = useDispatch();
	const settings = useSelector(state => state.SettingsReducer.options)
	const [loading, setLoading] = useState(false)
	const [refresh, setRefresh] = useState(false);
	const [result, setResult] = useState();

	useEffect(() => {
		props.navigation.setOptions({
			title: params && params.title,
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
		async function getPostDetail() {
			setLoading(true)
			await apiClient.get(`/faq-category/${params.faqCatId}`)
				.then(function (response) {
					if(response.status === 200) {
						setResult(response.data)
						setRefresh(false)
						setLoading(false)
					}
				})
				.catch(function (error) {
					showMessage({
						message: 'Nội dung không tồn tại, vui lòng quay lại!',
						type: 'danger',
						icon: 'danger',
						duration: 3000,
					});
					setLoading(false)
					setRefresh(false)
				})
		}
		getPostDetail()
	}, [refresh, params])

	return (
		loading ? <PostDetailLoading /> :
			<View style={tw`flex bg-white`}>
				<ScrollView
					showsVerticalScrollIndicator={false}
					overScrollMode={'never'}
					scrollEventThrottle={16}
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
					<View style={tw`pb-10 px-3`}>
						{result && result.detail && result.detail.description &&
							<DynamicWebView
								style={tw`w-full h-full`}
								source={{
									html: `<head>
									<meta name="viewport" content="width=device-width, initial-scale=1">
									</head>
									<body>${result.detail.description}</body>`,
								}}
							/>
						}
						{result && result.faqs && result.faqs.length > 0 &&
							<View style={tw`mt-5`}>
								{result.faqs.map((item, index) => (
									<FaqItem
										item={item}
										index={index}
									/>
								))}
							</View>
						}
					</View>
				</ScrollView>
			</View>
	);
}

export default FAQPageScreen;
