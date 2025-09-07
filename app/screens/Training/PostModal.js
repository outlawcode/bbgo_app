import React, { useEffect, useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import { apiClient } from "app/services/client";
import DynamicWebView from "app/components/DynamicWebView";

function TrainingPostModal(props) {
	const { width } = useWindowDimensions();
	const slug = props.route.params?.slug
	const [visible, setVisible] = useState(true)
	const [post, setPost] = useState()

	useEffect(() => {
		async function fetchPost() {
			if (!slug) return
			try {
				const res = await apiClient.get(`/training-post/${slug}`)
				setPost(res.data?.post)
			} catch (e) {
				console.log('Training post error:', e?.response?.data || e?.message)
			}
		}
		fetchPost()
	}, [slug])

	const close = () => {
		setVisible(false)
		setTimeout(() => props.navigation.goBack(), 250)
	}

	return (
		<Modal
			visible={visible}
			transparent
			animationType="slide"
			onRequestClose={close}
		>
			<View style={tw`flex-1 bg-black bg-opacity-50 justify-end`}>
				<View style={tw`bg-white rounded-t-2xl max-h-5/6`}>
					<View style={tw`px-4 py-3 border-b border-gray-100 flex flex-row items-center justify-between`}>
						<Text style={tw`font-bold text-base text-gray-800`} numberOfLines={1}>{post?.title || 'Bài viết'}</Text>
						<TouchableOpacity onPress={close} style={tw`w-8 h-8 rounded-full bg-gray-100 items-center justify-center`}>
							<Icon name="close" size={18} style={tw`text-gray-600`} />
						</TouchableOpacity>
					</View>

					<ScrollView showsVerticalScrollIndicator={false}>
						<View style={tw`px-4 py-3`}>
							{post?.content ? (
								<DynamicWebView
									style={tw`w-full h-full`}
									source={{
										html: `<head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>${post.content}</body>`
									}}
								/>
							) : (
								<Text style={tw`text-gray-600`}>Đang tải nội dung...</Text>
							)}
						</View>
					</ScrollView>
				</View>
			</View>
		</Modal>
	)
}

export default TrainingPostModal;


