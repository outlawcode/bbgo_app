import React, { useEffect, useState } from "react";
import { Dimensions, Image, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { apiClient } from "app/services/client";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import YoutubePlayer from "react-native-youtube-iframe";
import TextTicker from 'react-native-text-ticker';
import LinearGradient from "react-native-linear-gradient";

const height = (Dimensions.get("window").width / 16) * 9;

function Videos(props) {
	const [result, setResult] = useState();
	const [catId, setCatId] = useState('ALL');
	const [categories, setCategories] = useState();
	const [loading, setLoading] = useState(false)
	const [playing, setPlaying] = useState({
		index: 0, video: null, title: null, play: false
	});

	useEffect(() => {
		setLoading(true)
		async function getCategory() {
			await apiClient.get('/post-category', {
				params: {
					userOnly: 'FALSE',
					videoCat: 'TRUE'
				}
			}).then(function (response) {
				if (response.status === 200) {
					setCategories(response.data)
					setLoading(false)
				}
			}).catch(function(error){
				console.log(error);
				setLoading(false)
			})
		}
		getCategory();
	},[])

	useEffect(() => {
		setLoading(true)
		async function getCategory() {
			await apiClient.get('/post', {
				params: {
					catId: catId === 'ALL' ? 'ALL' : [catId],
					limit: 5,
					page: 1,
					status: 'ACTIVE',
					userOnly: 'FALSE',
					type: 'video'
				}
			})
				.then(function (response) {
					if (response.status === 200) {
						setResult(response.data)
						setPlaying({
							index: 0,
							video: response.data.posts[0].videoId,
							title: response.data.posts[0].title
						})
						setLoading(false);
					}
				}).catch(function(error){
					console.log(error);
					setLoading(false);
				})
		}
		getCategory();
	},[catId])

	// Header section with Youtube icon
	const renderHeader = () => (
		<View style={tw`px-4 flex-row items-center justify-between mb-4`}>
			<View style={tw`flex-row items-center`}>
				<View style={tw`bg-red-50 p-2 rounded-full mr-2`}>
					<Icon name="youtube" size={20} style={tw`text-red-600`} />
				</View>
				<Text style={tw`text-gray-800 font-bold text-base uppercase`}>Video clip</Text>
			</View>
			<TouchableOpacity
				style={tw`flex-row items-center`}
				onPress={() => props.navigation.navigate("Videos")}
			>
				<Text style={tw`mr-1 text-red-600 font-medium`}>Xem thêm</Text>
				<Icon name="chevron-right" size={16} style={tw`text-red-600`} />
			</TouchableOpacity>
		</View>
	);

	// Category filter tabs
	const renderCategoryTabs = () => (
		<View style={tw`mb-4 px-4`}>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={tw`py-1`}
			>
				<TouchableOpacity
					activeOpacity={0.7}
					onPress={() => setCatId('ALL')}
					style={tw`mr-2 rounded-full px-4 py-2 ${catId === 'ALL' ? 'bg-red-600' : 'bg-gray-100'}`}
				>
					<Text style={tw`font-medium ${catId === 'ALL' ? 'text-white' : 'text-gray-700'}`}>Tất cả</Text>
				</TouchableOpacity>
				{categories && categories.length > 0 && categories.map((item, index) => (
					<TouchableOpacity
						key={index}
						activeOpacity={0.7}
						style={tw`mr-2 rounded-full px-4 py-2 ${catId === item.id ? 'bg-red-600' : 'bg-gray-100'}`}
						onPress={() => setCatId(item.id)}
					>
						<Text style={tw`font-medium ${catId === item.id ? 'text-white' : 'text-gray-700'}`}>{item.name}</Text>
					</TouchableOpacity>
				))}
			</ScrollView>
		</View>
	);

	// Loading skeleton
	const renderSkeleton = () => (
		<SkeletonPlaceholder>
			<View style={tw`mb-5 mx-4`}>
				<View style={tw`h-52 w-full rounded-xl mb-2`} />
				<View style={tw`w-3/4 h-4 rounded-full mb-1`} />
				<View style={tw`w-1/2 h-3 rounded-full mb-4`} />

				<View style={tw`flex-row items-center mb-3`}>
					<View style={tw`w-20 h-14 rounded-lg mr-3`} />
					<View style={tw`flex-1`}>
						<View style={tw`w-3/4 h-3 rounded-full mb-1`} />
						<View style={tw`w-1/2 h-3 rounded-full`} />
					</View>
				</View>

				<View style={tw`flex-row items-center mb-3`}>
					<View style={tw`w-20 h-14 rounded-lg mr-3`} />
					<View style={tw`flex-1`}>
						<View style={tw`w-3/4 h-3 rounded-full mb-1`} />
						<View style={tw`w-1/2 h-3 rounded-full`} />
					</View>
				</View>
			</View>
		</SkeletonPlaceholder>
	);

	// Video Player with title
	const renderVideoPlayer = () => (
		<View style={tw`mb-4 mx-4`}>
			<View style={tw`rounded-xl overflow-hidden mb-2`}>
				<YoutubePlayer
					webViewStyle={{opacity: 0.99}}
					play={playing.play}
					width={'100%'}
					height={height}
					videoId={playing.video}
					allowWebViewZoom={false}
				/>
			</View>
			<View style={tw`flex-row items-center bg-gray-50 rounded-xl p-3`}>
				<View style={tw`bg-red-100 rounded-full p-2 mr-2`}>
					<Icon name="play" size={16} style={tw`text-red-600`} />
				</View>
				<TextTicker
					style={tw`text-base font-medium text-gray-800`}
					duration={8000}
					loop
					bounce={false}
					repeatSpacer={50}
					marqueeDelay={1000}
				>
					{playing.title}
				</TextTicker>
			</View>
		</View>
	);

	// Video playlist items
	const renderVideoList = () => (
		<View style={tw`px-4`}>
			{result.posts.map((item, index) => (
				<TouchableOpacity
					key={index}
					onPress={() => setPlaying({index, video: item.videoId, title: item.title, play: true})}
					activeOpacity={0.7}
					style={tw`flex-row items-center bg-white mb-3 p-2 rounded-xl ${playing.index === index ? 'border border-red-500' : 'border border-gray-100'}`}
				>
					<View style={tw`relative mr-3`}>
						<Image
							source={{uri: item.featureImage}}
							style={tw`w-24 h-16 rounded-lg bg-gray-100`}
							resizeMode="cover"
						/>
						<View style={tw`absolute inset-0 items-center justify-center`}>
							<View style={tw`${playing.index === index ? 'bg-red-600' : 'bg-black bg-opacity-40'} rounded-full p-1`}>
								<Icon
									name={playing.index === index ? "pause" : "play"}
									size={16}
									style={tw`text-white`}
								/>
							</View>
						</View>
					</View>
					<View style={tw`flex-1`}>
						<Text
							numberOfLines={2}
							style={tw`font-medium text-gray-800 ${playing.index === index ? 'text-red-600' : ''}`}
						>
							{item.title}
						</Text>
					</View>
				</TouchableOpacity>
			))}
		</View>
	);

	// Empty state
	const renderEmptyState = () => (
		<View style={tw`items-center justify-center py-8`}>
			<View style={tw`bg-gray-100 p-5 rounded-full mb-3`}>
				<Icon name="youtube" size={40} style={tw`text-gray-300`} />
			</View>
			<Text style={tw`text-gray-400 text-base mb-1`}>Chuyên mục này</Text>
			<Text style={tw`text-gray-500 text-sm`}>hiện chưa có video!</Text>
		</View>
	);

	// View all button
	const renderViewAllButton = () => (
		<View style={tw`items-center border-t border-gray-100 mt-3 pt-4 pb-2 mx-4`}>
			<TouchableOpacity
				style={tw`bg-red-50 rounded-full px-6 py-2 flex-row items-center`}
				onPress={() => props.navigation.navigate("Videos")}
			>
				<Text style={tw`mr-1 text-red-600 font-medium`}>Xem thêm video</Text>
				<Icon name="chevron-right" size={16} style={tw`text-red-600`} />
			</TouchableOpacity>
		</View>
	);

	return (
		<View style={tw`py-4`}>
			{renderHeader()}
			{renderCategoryTabs()}

			{loading ? (
				renderSkeleton()
			) : result && result.posts && result.posts.length > 0 ? (
				<>
					{renderVideoPlayer()}
					{renderVideoList()}
					{renderViewAllButton()}
				</>
			) : (
				renderEmptyState()
			)}
		</View>
	);
}

export default Videos;
