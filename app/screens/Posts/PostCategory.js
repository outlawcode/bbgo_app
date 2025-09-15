import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import CartIcon from "app/screens/Cart/components/cartIcon";
import { useDispatch, useSelector } from "react-redux";
import { apiClient } from "app/services/client";
import CategoryHorizontalList from "app/screens/Home/components/CategoryHorizontalList";
import ProductItem from "app/components/ProductItem";
import { FlatGrid } from "react-native-super-grid";
import ChildCategoryHorizontalList from "app/screens/Home/components/ChildCategoryHorizontalList";
import NewsItem from "app/components/NewsItem";
import PostsLoading from "app/screens/Posts/components/PostsLoading";

function PostCategoryScreen(props) {
	const dispatch = useDispatch();
	const settings = useSelector(state => state.SettingsReducer.options)
	const catId = props.route.params.catId;
	const catSlug = props.route.params.catSlug;
	const [page, setPage] = useState(1);
	const [category, setCategory] = useState([]);
	const [products, setProducts] = useState([]);
	const [refresh, setRefresh] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setLoading(true)
		const dataRequests = [
			apiClient.get(`/post-category/${catSlug}`, {
				params: {
					page,
					limit: 100000,
					status: 'ACTIVE',
				}
			}),
		]

		Promise.all(dataRequests)
			.then((result) => {
				setRefresh(false);
				setLoading(false);
				setCategory(result[0].data);
			})
			.catch((error) => {
				console.log(error);
			})
	}, [refresh, catId, catSlug])

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
	}, [refresh, catId, catSlug])

	return (
		loading ? <PostsLoading /> :
		<View style={tw`flex bg-gray-100 min-h-full`}>
			{category && category.subCategory && category.subCategory.length > 0 &&
				<ChildCategoryHorizontalList
					category={category && category.subCategory}
					navigation={props.navigation}
				/>
			}
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
					{category && category.detail && category.detail.parent &&
						<View
							style={tw`m-3`}
						>
							<TouchableOpacity
								onPress={() => props.navigation.navigate('PostCategory', {
									catId: category.detail.parent.id,
									catSlug: category.detail.parent.slug,
								})}
								style={tw`border border-blue-500 w-1/2 flex items-center py-2 rounded-full`}
							>
								<View style={tw`flex items-center flex-row`}>
									<Icon name={"arrow-left"} style={tw`mr-1 text-blue-500`} size={18} />
									<Text  style={tw`text-blue-500 font-bold`}>{category.detail.parent.name}</Text>
								</View>

							</TouchableOpacity>
						</View>
					}
					<View style={tw`bg-white py-3`}>
						<View style={tw`ml-3 flex items-center flex-row`}>
							<Text  style={tw`font-bold uppercase text-blue-500`}>{category && category.detail && category.detail.name}</Text>
						</View>

						{category && category.posts && category.posts.length > 0 ?
							<FlatGrid
								itemDimension={150}
								data={category.posts}
								additionalRowStyle={tw`flex items-start`}
								spacing={10}
								renderItem={({ item, index }) => (
									<NewsItem item={item} navigation={props.navigation} key={index} />
								)} />
							:
							<View>
								<View style={tw`my-5 flex items-center`}>
									<Icon name={"note-search-outline"} size={50} style={tw`text-gray-300 mb-2`}/>
									<Text  style={tw`text-gray-600`}>Không có tin tức trong danh mục</Text>
								</View>
							</View>
						}
					</View>
				</View>
			</ScrollView>
		</View>
	);
}

export default PostCategoryScreen;
