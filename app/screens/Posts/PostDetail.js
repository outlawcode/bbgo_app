import React, { useEffect, useState} from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import CartIcon from "app/screens/Cart/components/cartIcon";
import { useDispatch, useSelector } from "react-redux";
import { apiClient } from "app/services/client";
import CategoryHorizontalList from "app/screens/Home/components/CategoryHorizontalList";
import ProductItem from "app/components/ProductItem";
import { FlatGrid } from "react-native-super-grid";
import NewsItem from "app/components/NewsItem";
import PostCategoryList from "app/screens/Posts/components/PostCategoryList";
import RenderHtml from 'react-native-render-html';
import { WebView } from 'react-native-webview';
import DynamicWebView from "app/components/DynamicWebView";
import { formatDate, formatDateTime } from "app/utils/helper";
import PostDetailLoading from "app/screens/Posts/components/PostDetailLoading";
import { showMessage } from "react-native-flash-message";

function PostDetailScreen(props) {
	const { width } = useWindowDimensions();
	const dispatch = useDispatch();
	const settings = useSelector(state => state.SettingsReducer.options)
	const slug = props.route.params.slug;
	const [result, setResult] = useState();
	const [refresh, setRefresh] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		props.navigation.setOptions({
			title: null,
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

	const _scrollView = React.useRef(null);

	console.log('slug', slug);

	useEffect(() => {
		async function getPostDetail() {
			if (!slug) {
				console.log('No slug provided');
				showMessage({
					message: 'Không tìm thấy bài viết!',
					type: 'danger',
					icon: 'danger',
					duration: 3000,
				});
				props.navigation.goBack();
				return;
			}

			setLoading(true)
			console.log('Fetching post with slug:', slug);
			
			await apiClient.get(`/post/${slug}`)
				.then(function (response) {
					if(response.status === 200) {
						console.log('Post found:', response.data);
						setResult(response.data)
						setRefresh(false)
						setLoading(false)
					}
				})
				.catch(function (error) {
					console.log('Error fetching post:', error.response?.data || error.message);
					showMessage({
						message: 'Nội dung không tồn tại, vui lòng quay lại!',
						type: 'danger',
						icon: 'danger',
						duration: 3000,
					});
					setLoading(false)
					setRefresh(false)
					// Navigate back if post not found
					setTimeout(() => {
						props.navigation.goBack();
					}, 2000);
				})
		}
		_scrollView.current?.scrollTo({y: 0, animated: true})
		getPostDetail()
	}, [refresh, slug])

	return (
		!result ? <PostDetailLoading /> :
		<View style={tw`flex bg-white`}>
			<ScrollView
				ref={_scrollView}
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
					<View style={tw`mt-3`}>
						<Text  style={tw`font-bold text-lg text-green-600`}>
							{result.post.title}
						</Text>
						<View style={tw`flex flex-row items-center`}>
							<Icon name={"calendar"} style={tw`mr-1 text-gray-500`}/>
							<Text  style={tw`text-xs text-gray-500`}>
								{formatDateTime(result.post.createdAt)}
							</Text>
						</View>

					</View>

					<DynamicWebView
						style={tw`w-full h-full`}
						source={{
							html: `<head>
									<meta name="viewport" content="width=device-width, initial-scale=1">
									</head>
									<body>${result.post.content}</body>`,
						}}
					/>

					{result && result.relatedPosts && result.relatedPosts.length > 0 &&
						<View style={tw`bg-white mb-3`}>
							<View style={tw`px-3 pt-3 mb-3`}>
								<Text  style={tw`uppercase text-gray-600 font-bold`}>Tin tức liên quan</Text>
							</View>

							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
							>
								{result.relatedPosts && result.relatedPosts.map((item, index) => (
									<NewsItem horizontal item={item} key={index} navigation={props.navigation}/>
								))}
							</ScrollView>
							{/*<FlatGrid
								itemDimension={180}
								data={result.relatedPosts}
								additionalRowStyle={tw`flex items-start`}
								spacing={10}
								renderItem={({item}) => (
									<NewsItem item={item} navigation={props.navigation}/>
								)} />*/}
						</View>
					}
				</View>
			</ScrollView>
		</View>
	);
}

export default PostDetailScreen;
