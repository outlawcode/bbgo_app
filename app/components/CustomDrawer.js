import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View, Linking } from "react-native";
import tw from "twrnc";
import { apiClient } from "app/services/client";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useSelector } from "react-redux";

function CustomDrawer(props) {
	//const [categories, setCategories] = useState();
	const [postCategories, setPostCategories] = useState();
	const [videoCategories, setVideoCategories] = useState();
	const [loading, setLoading] = useState(false);
	const settings = useSelector(state => state.SettingsReducer.options);

	const categories = useSelector(state => state.SettingsReducer.productCategories)
	const serviceCategories = useSelector(state => state.SettingsReducer.serviceCategories)

	useEffect(() => {
		setLoading(true)
		async function getCategories() {
			await apiClient.get('/post-category',
			).then(function (response) {
				if (response.status === 200) {
					setPostCategories(response.data)
					setLoading(false)
				}
			}).catch(function(error){
				console.log(error);
				setLoading(false)
			})
		}
		getCategories();
	},[])

	const menu = [
		{
			name: 'Danh mục',
			destination: 'Products',
			icon: 'view-grid',
			iconColor: 'text-green-500'
		},
		{
			name: 'Dịch vụ',
			destination: 'Foods',
			icon: 'grid',
			slug: 'service',
			iconColor: 'text-red-500'
		},
		{
			name: 'Gian hàng',
			destination: 'Stores',
			icon: 'store',
			iconColor: 'text-pink-500'
		},
		{
			name: 'Siêu thị',
			destination: 'Mart',
			icon: 'store-24-hour',
			iconColor: 'text-blue-500'
		},
		{
			name: 'Tin tức',
			destination: 'Posts',
			icon: 'newspaper',
			iconColor: 'text-orange-400',
		},
	]

	return (
		<View style={{flex: 1}}>
			<DrawerContentScrollView {...props}>
				<View style={tw`mx-5`}>
					{menu.map((item, index) => (
						<>
							<TouchableOpacity
								onPress={() => props.navigation.navigate(item.destination, {
									screen: item.destination,
									params: {
										slug: item.slug
									},
								})}
								style={tw`w-full flex flex-row items-center py-3 border-t border-gray-100 ${index === 0 && 'border-t-0'}`}
							>
								<Icon name={item.icon} style={tw`mr-2 ${item.iconColor}`} size={20}/>
								<Text style={tw`font-bold uppercase`}>{item.name}</Text>
							</TouchableOpacity>
							{item.destination === 'Products' &&
								categories && categories.map((cat, index) => (
									<TouchableOpacity
										activeOpacity={1}
										onPress={() => props.navigation.navigate('ProductCategory', {catId: cat.id, catSlug: cat.slug})}
										style={tw`ml-5 mb-4`}
									>
										<View style={tw`flex flex-row items-center`}>
											<Icon name={"plus"} style={tw`text-gray-600`} />
											<Text style={tw`font-medium`}>{cat.name}</Text>
										</View>
									</TouchableOpacity>
								))
							}
							{item.destination === 'Posts' &&
								postCategories && postCategories.map((cat, index) => (
									<TouchableOpacity
										activeOpacity={1}
										onPress={() => props.navigation.navigate('PostCategory', {catId: cat.id, catSlug: cat.slug})}
										style={tw`ml-5 mb-4`}
									>
										<View style={tw`flex flex-row items-center`}>
											<Icon name={"plus"} style={tw`text-gray-600`} />
											<Text style={tw`font-medium`}>{cat.name}</Text>
										</View>
									</TouchableOpacity>
								))
							}
						</>
					))}
				</View>

			</DrawerContentScrollView>
		</View>
	);
}

export default CustomDrawer;
