import React, { useEffect, useState} from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, useWindowDimensions, View, ActivityIndicator } from "react-native";
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
						console.log('Related posts:', response.data.relatedPosts);
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
		!result ? <ActivityIndicator animating={loading} /> :
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
						<Text  style={tw`font-bold text-lg text-cyan-600`}>
							{result.post.title}
						</Text>
						<View style={tw`flex flex-row items-center`}>
							<Icon name={"calendar"} style={tw`mr-1 text-gray-500`}/>
							<Text  style={tw`text-xs text-gray-500`}>
								{formatDateTime(result.post.createdAt)}
							</Text>
						</View>

					</View>

					<View style={tw`w-full mb-4`}>
						<RenderHtml
							contentWidth={width}
							source={{ html: result.post.content }}
							tagsStyles={{
								body: {
									fontFamily: 'System',
									fontSize: 16,
									lineHeight: 24,
									color: '#333333',
									margin: 0,
									padding: 0,
								},
								p: {
									marginBottom: 12,
									marginTop: 12,
								},
								img: {
									maxWidth: '100%',
									height: 'auto',
									marginTop: 10,
									marginBottom: 10,
								},
								h1: {
									fontSize: 24,
									fontWeight: 'bold',
									marginBottom: 16,
									marginTop: 16,
								},
								h2: {
									fontSize: 20,
									fontWeight: 'bold',
									marginBottom: 14,
									marginTop: 14,
								},
								h3: {
									fontSize: 18,
									fontWeight: 'bold',
									marginBottom: 12,
									marginTop: 12,
								},
								ul: {
									marginBottom: 12,
									marginTop: 12,
								},
								ol: {
									marginBottom: 12,
									marginTop: 12,
								},
								li: {
									marginBottom: 4,
								},
								blockquote: {
									borderLeftWidth: 4,
									borderLeftColor: '#008A97',
									paddingLeft: 16,
									marginLeft: 0,
									marginRight: 0,
									marginTop: 12,
									marginBottom: 12,
									fontStyle: 'italic',
								},
								a: {
									color: '#008A97',
									textDecorationLine: 'underline',
								},
								strong: {
									fontWeight: 'bold',
								},
								em: {
									fontStyle: 'italic',
								},
							}}
							renderersProps={{
								img: {
									enableExperimentalPercentWidth: true,
								},
							}}
						/>
					</View>

					{result && result.relatedPosts && result.relatedPosts.length > 0 &&
						<View style={tw`bg-white mb-3 mt-4`}>
							<View style={tw`px-3 pt-3 mb-3`}>
								<Text style={tw`uppercase text-gray-600 font-bold text-base`}>Tin tức liên quan</Text>
							</View>

							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={tw`px-3 pb-3`}
							>
								{result.relatedPosts && result.relatedPosts.map((item, index) => (
									<NewsItem horizontal item={item} key={index} navigation={props.navigation}/>
								))}
							</ScrollView>
						</View>
					}
				</View>
			</ScrollView>
		</View>
	);
}

export default PostDetailScreen;
