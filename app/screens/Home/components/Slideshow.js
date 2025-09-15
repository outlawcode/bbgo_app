import React, {useRef, useState} from "react";
import {
  Dimensions,
  Linking,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  Image
} from "react-native";
import Carousel, {Pagination} from "react-native-snap-carousel";
import tw from "twrnc";
import ApiConfig from "app/config/api-config";

const {width: screenWidth} = Dimensions.get("window");

function SlideShow(props) {
  const carouselRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const renderItem = ({item, index}) => {
    return (
      <TouchableOpacity
        onPress={() =>
          Linking.canOpenURL(item.url).then(supported => {
            supported && Linking.openURL(item.url);
          })
        }
        activeOpacity={0.9}
        style={styles.slideContainer}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{uri: item.image}}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Carousel
        ref={carouselRef}
        data={props.items || []}
        renderItem={renderItem}
        sliderWidth={screenWidth}
        itemWidth={screenWidth}
        sliderHeight={280}
        autoplay
        autoplayInterval={3000}
        loop
        onSnapToItem={index => setActiveSlide(index)}
        removeClippedSubviews={false}
        contentContainerCustomStyle={styles.carouselContainer}
        slideStyle={styles.carouselSlide}
        inactiveSlideScale={1}
        inactiveSlideOpacity={1}
        activeSlideAlignment="center"
        firstItem={0}
        enableSnap={true}
        snapOnAndroid={true}
        callbackOffsetMargin={0}
      />

      {/* Custom pagination dots */}
      <View
        style={tw`absolute bottom-2 left-0 right-0 flex-row justify-center`}
      >
        <Pagination
          dotsLength={props.items ? props.items.length : 0}
          activeDotIndex={activeSlide}
          containerStyle={tw`py-0`}
          dotStyle={tw`w-2 h-2 rounded-full bg-white mx-1`}
          inactiveDotStyle={tw`bg-white bg-opacity-50`}
          inactiveDotOpacity={0.6}
          inactiveDotScale={0.8}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: screenWidth,
    height: 280
  },
  carouselContainer: {
    paddingHorizontal: 0,
    marginHorizontal: 0,
    paddingVertical: 0,
    marginVertical: 0
  },
  carouselSlide: {
    paddingHorizontal: 0,
    marginHorizontal: 0,
    paddingVertical: 0,
    marginVertical: 0,
    paddingLeft: 0,
    paddingRight: 0,
    marginLeft: 0,
    marginRight: 0
  },
  slideContainer: {
    width: screenWidth,
    height: 280,
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginHorizontal: 0,
    marginVertical: 0,
    justifyContent: "center",
    alignItems: "center"
  },
  imageContainer: {
    width: screenWidth,
    height: 280,
    backgroundColor: "#f5f5f5",
    borderRadius: 0,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center"
  },
  image: {
    width: "100%",
    height: "100%"
  }
});

export default SlideShow;
