import React, { useEffect, useMemo, useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import { apiClient } from "app/services/client";
import DynamicWebView from "app/components/DynamicWebView";
import WebView from "react-native-webview";
import { Platform } from 'react-native';

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

	// Try to detect video url on post from several likely fields
	const videoUrl = useMemo(() => {
		if (!post) return undefined;
		return post.videoLink || post.videoUrl || post.youtube || post.youtubeUrl || post.video;
	}, [post]);

	const youtubeId = useMemo(() => {
		if (!videoUrl) return undefined;
		// Support: https://www.youtube.com/watch?v=ID, youtu.be/ID, embed/ID, shorts/ID
		const patterns = [
			/[?&]v=([^&#]+)/, // watch?v=
			/https?:\/\/youtu\.be\/([^?&#/]+)/,
			/\/embed\/([^?&#/]+)/,
			/\/shorts\/([^?&#/]+)/,
		];
		for (const p of patterns) {
			const m = String(videoUrl).match(p);
			if (m && m[1]) return m[1];
		}
		return undefined;
	}, [videoUrl]);

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
							{/* YouTube Player */}
                            {youtubeId && (
								<View style={tw`mb-4 overflow-hidden rounded-lg bg-black`}> 
									<WebView
										style={{ width: width - 32, height: Math.min(Math.round((width - 32) * 9 / 16), 260), backgroundColor: 'black' }}
										javaScriptEnabled
										domStorageEnabled
										allowsFullscreenVideo
										allowsInlineMediaPlayback
										mediaPlaybackRequiresUserAction={false}
										originWhitelist={["*"]}
										thirdPartyCookiesEnabled
										setSupportMultipleWindows={false}
										androidLayerType={'hardware'}
										mixedContentMode={'always'}
										userAgent={Platform.select({
											ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
											android: 'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36'
										})}
										source={{
											html: `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0;padding:0;background:#000;height:100%} .wrap{position:relative;padding-top:56.25%;} .player{position:absolute;top:0;left:0;width:100%;height:100%;border:0}</style></head><body><div class="wrap"><iframe class="player" src="https://www.youtube.com/embed/${youtubeId}?playsinline=1&rel=0&modestbranding=1&enablejsapi=1&origin=https://bbgo.vn" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div></body></html>`,
											baseUrl: 'https://bbgo.vn'
										}}
									/>
								</View>
							)}

							{/* Post Content */}
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


