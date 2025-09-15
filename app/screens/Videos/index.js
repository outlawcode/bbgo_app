import React, { useEffect, useState } from "react";
import { Dimensions, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import CartIcon from "app/screens/Cart/components/cartIcon";
import { useDispatch, useSelector } from "react-redux";
import { apiClient } from "app/services/client";
import { FlatGrid } from "react-native-super-grid";
import NewsItem from "app/components/NewsItem";
import PostCategoryList from "app/screens/Posts/components/PostCategoryList";
import PostsLoading from "app/screens/Posts/components/PostsLoading";
import YoutubePlayer from "react-native-youtube-iframe";
import TextTicker from "react-native-text-ticker";

const height = (Dimensions.get("window").width / 16) * 9;

function VideosScreen(props) {
	const dispatch = useDispatch();
	const settings = useSelector(state => state.SettingsReducer.options)
	const [catId, setCatId] = useState('ALL');
	const [category, setCategory] = useState([]);
	const [page, setPage] = useState(1);
	const [posts, setPosts] = useState([]);
	const [refresh, setRefresh] = useState(false);
	const [loading, setLoading] = useState(false);
	const [playing, setPlaying] = useState({
		index: 0, video: null, title: null, play: false
	});

	useEffect(() => {
		props.navigation.setOptions({
			title: 'VIDEO',
			headerStyle: {
				backgroundColor: '#b2002a',
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
				<View style={tw`mr-3`}>
					<CartIcon
						navigation={props.navigation}
					/>
				</View>
			)
		})
	}, [])

	useEffect(() => {
		setLoading(true);
		const dataRequests = [
			apiClient.get('/post-category', {
				params: {
					userOnly: 'FALSE',
					videoCat: 'TRUE'
				}
			}),
			apiClient.get('/post', {
				params: {
					catId: catId === 'ALL' ? 'ALL' : [catId],
					limit: 100000,
					page,
					status: 'ACTIVE',
					userOnly: 'FALSE',
					type: 'video'
				}
			}),
		]

		Promise.all(dataRequests)
			.then((result) => {
				setRefresh(false);
				setLoading(false);
				setCategory(result[0].data);
				setPosts(result[1].data);
				setPlaying({
					index: 0,
					video: result[1].data.posts[0].videoId,
					title: result[1].data.posts[0].title,
					play: true
				})
			})
			.catch((error) => {
				console.log(error);
			})
	}, [refresh, page, catId])

	console.log(posts);

	return (
		loading ? <PostsLoading /> :
		<View style={tw`flex bg-gray-100 min-h-full`}>
			<View style={tw`mb-3`}>
				<YoutubePlayer
					webViewStyle={{opacity: 0.99}}
					play={playing.play}
					height={height}
					videoId={playing.video}
				/>
				<View style={tw`flex flex-row items-center mt-2`}>
					<Icon name={"play"} size={20} style={tw`text-green-600`} />
					<TextTicker
						style={tw`text-lg font-medium`}
						duration={5000}
						loop
						bounce={false}
						repeatSpacer={50}
						marqueeDelay={1000}
						shouldAnimateTreshold={40}
					>
						{playing.title}
					</TextTicker>
				</View>

			</View>
			<View style={tw`mb-3 px-3`}>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
				>
					<TouchableOpacity
						activeOpacity={1}
						onPress={() => setCatId('ALL')}
						style={tw`mr-2 rounded-full border border-gray-700 px-4 py-2 ${catId === 'ALL' && 'border-red-700 bg-red-700'}`}
					>
						<Text style={tw`font-medium text-gray-600 ${catId === 'ALL' && 'text-white'}`}>Tất cả</Text>
					</TouchableOpacity>
					{category && category.length > 0 && category.map((item, index) => (
						<TouchableOpacity
							activeOpacity={1}
							style={tw`mr-2 rounded-full border border-gray-700 px-4 py-2 ${catId === item.id && 'border-red-700 bg-red-700'}`}
							onPress={() => setCatId(item.id)}
						>
							<View>
								<Text  style={tw`font-medium text-gray-600 ${catId === item.id && 'text-white'}`}>{item.name}</Text>
							</View>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>
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
				<View style={tw`pb-80 bg-white px-3`}>
					{posts && posts.posts && posts.posts.map((item, index) => (
						<TouchableOpacity
							onPress={() => {
								setPlaying({ index, video: item.videoId, title: item.title, play: true });
							}}
							activeOpacity={1}
							style={tw`border-t border-gray-200 pt-2`}
						>
							<View style={tw`flex flex-row items-center justify-between mb-2`}>
								<View style={tw`flex flex-row items-center w-2/3`}>
									<Image source={{uri: item.featureImage}} style={tw`w-20 h-14 rounded mr-2`} />
									<Text numberOfLines={2} style={tw`font-medium`}>{item.title}</Text>
								</View>
								<View>
									<Icon name={"play-circle"} size={20} style={tw`text-gray-500 ${playing.index === index && 'text-red-600'}`}/>
								</View>
							</View>
						</TouchableOpacity>
					))}
				</View>
			</ScrollView>
		</View>
	);
}

export default VideosScreen;
