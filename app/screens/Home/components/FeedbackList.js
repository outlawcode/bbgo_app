import React, {useEffect, useRef, useState} from "react";
import {Dimensions, Image, ScrollView, Text, TouchableOpacity, View} from "react-native";
import tw from "twrnc";
import Carousel from "react-native-reanimated-carousel";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {useFocusEffect} from '@react-navigation/native';

const {width: screenWidth} = Dimensions.get('window');

function FeedbackList(props) {
	const [activeSlide, setActiveSlide] = useState(0);
	const carouselRef = useRef(null);
	const scrollRef = useRef(null);
	const [avatarRowWidth, setAvatarRowWidth] = useState(0);
	const [carouselKey, setCarouselKey] = useState(0);

	const items = Array.isArray(props.items) ? props.items : [];
	const CARD_HEIGHT = 280;

	const SLOT_WIDTH = 44; // fixed space for each avatar (keeps centering stable)
	const AVATAR_INACTIVE = 28;
	const AVATAR_ACTIVE = 36;

	const centerAvatarToIndex = (index) => {
		if (!scrollRef.current || avatarRowWidth === 0 || items.length === 0) return;
		const totalContentWidth = items.length * SLOT_WIDTH;
		let x = index * SLOT_WIDTH + (SLOT_WIDTH / 2) - (avatarRowWidth / 2);
		if (x < 0) x = 0;
		const max = Math.max(0, totalContentWidth - avatarRowWidth);
		if (x > max) x = max;
		scrollRef.current.scrollTo({x, animated: true});
	};

	useEffect(() => {
		centerAvatarToIndex(activeSlide);
	}, [activeSlide, avatarRowWidth]);

	// Force re-render carousel when component mounts or items change
	useEffect(() => {
		if (items.length > 0) {
			setCarouselKey(prev => prev + 1);
		}
	}, [items.length]);

	// Reset carousel when screen comes into focus
	useFocusEffect(
		React.useCallback(() => {
			if (items.length > 0) {
				setCarouselKey(prev => prev + 1);
				setActiveSlide(0);
			}
		}, [items.length])
	);

	return (
		<View style={tw`bg-white mb-3 py-3`}>
			<View style={tw`flex items-center`}>
				<View style={tw`flex flex-row`}>
					<Icon name={"star"} style={tw`text-yellow-400`} size={16} />
					<Icon name={"star"} style={tw`text-yellow-400`} size={18} />
					<Icon name={"star"} style={tw`text-yellow-400`} size={20} />
					<Icon name={"star"} style={tw`text-yellow-400`} size={18} />
					<Icon name={"star"} style={tw`text-yellow-400`} size={16} />
				</View>
			</View>
			<View>
				{items.length > 0 && (
				<Carousel
					key={carouselKey}
					width={screenWidth}
					height={150}
					ref={carouselRef}
					data={items}
					renderItem={({item}) => (
						<View style={tw`px-4`}>
							<View style={[tw`items-center px-2`, {height: 150, justifyContent: 'center'}]}>
								<Text style={tw`text-center text-gray-600 mb-2`} numberOfLines={6}>
									{item?.content || ''}
								</Text>
								<Text style={tw`font-bold text-cyan-700 mb-1`}>{item?.name || ''}</Text>
								<Text style={tw`text-gray-400 text-xs`}>{item?.job || ''}</Text>
							</View>
						</View>
					)}
					autoPlay={items.length > 1}
					autoPlayInterval={5000}
					loop={items.length > 1}
					onProgressChange={(_, absoluteProgress) =>
						setActiveSlide(Math.round(absoluteProgress))
					}
					style={tw`flex-1`}
					enabled={true}
					pagingEnabled={true}
				/>
				)}

				{/* Avatars navigation row (active centered) */}
				<View style={tw`flex items-center`} onLayout={(e) => setAvatarRowWidth(e.nativeEvent.layout.width)}>
					<ScrollView
						ref={scrollRef}
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={tw`px-4`}
					>
						{items.map((it, idx) => (
							<View key={idx}>
								<TouchableOpacity
									onPress={() => {
										carouselRef.current?.scrollTo(idx);
										centerAvatarToIndex(idx);
									}}
									style={{ width: SLOT_WIDTH, alignItems: 'center' }}
								>
									<Image
										source={{uri: it.image}}
										style={[
											tw`${activeSlide === idx ? '' : 'opacity-40 top-1'} rounded-full`,
											{
												width: activeSlide === idx ? AVATAR_ACTIVE : AVATAR_INACTIVE,
												height: activeSlide === idx ? AVATAR_ACTIVE : AVATAR_INACTIVE,
											}
										]}
										resizeMode="cover"
									/>
								</TouchableOpacity>
							</View>
						))}
					</ScrollView>
				</View>
			</View>
		</View>
	);
}

export default FeedbackList;
