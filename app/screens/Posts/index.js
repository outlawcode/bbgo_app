import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import CartIcon from "app/screens/Cart/components/cartIcon";
import { useDispatch, useSelector } from "react-redux";
import { apiClient } from "app/services/client";
import { FlatGrid } from "react-native-super-grid";
import NewsItem from "app/components/NewsItem";
import PostCategoryList from "app/screens/Posts/components/PostCategoryList";
import PostsLoading from "app/screens/Posts/components/PostsLoading";

function PostsScreen(props) {
	const dispatch = useDispatch();
	const settings = useSelector(state => state.SettingsReducer.options)
	const [category, setCategory] = useState([]);
	const [page, setPage] = useState(1);
	const [posts, setPosts] = useState([]);
	const [refresh, setRefresh] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		props.navigation.setOptions({
			title: 'TIN TỨC',
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

	useEffect(() => {
		setLoading(true);
		const dataRequests = [
			apiClient.get('/post-category'),
			apiClient.get('/post', {
				params: {
					catId: 'ALL',
					limit: 100000,
					page,
					status: 'Đăng',
				}
			}),
		]

		Promise.all(dataRequests)
			.then((result) => {
				setRefresh(false);
				setLoading(false);
				setCategory(result[0].data);
				setPosts(result[1].data);
			})
			.catch((error) => {
				console.log(error);
			})
	}, [refresh, page])

	return (
		loading ? <PostsLoading /> :
		<View style={tw`flex bg-gray-100 min-h-full`}>
			<PostCategoryList
				category={category}
				navigation={props.navigation}
			/>
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
				<View style={tw`pb-10`}>
					<View style={tw`bg-white py-3`}>
						<FlatGrid
							itemDimension={170}
							data={posts && posts.posts}
							additionalRowStyle={tw`flex items-start`}
							spacing={10}
							fixed
							renderItem={({item, index}) => (
								<NewsItem item={item} navigation={props.navigation} key={index}/>
							)} />
					</View>
				</View>
			</ScrollView>
		</View>
	);
}

export default PostsScreen;
