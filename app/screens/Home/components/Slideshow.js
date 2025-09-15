import React, {useRef, useState} from "react";
import {Dimensions, Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import tw from "twrnc";

const {width: screenWidth} = Dimensions.get("window");

function SlideShow(props) {
  const carouselRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const renderItem = ({item, index}) => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={styles.slideContainer}
      >
        <Image
          source={{uri: item.image}}
          style={styles.image}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  const CustomPagination = ({items, activeSlide}) => (
    <View style={tw`absolute bottom-2 left-0 right-0 flex-row justify-center`}>
      {(items || []).map((_, index) => (
        <View
          key={index}
          style={[
            tw`w-2 h-2 rounded-full mx-1`,
            activeSlide === index ? tw`bg-white` : tw`bg-white bg-opacity-50`,
          ]}
        />
      ))}
    </View>
  );

  if (!props.items || props.items.length === 0) {
    return (
      <View style={styles.containerEmpty}>
        <Text style={{color: '#666', fontSize: 14}}>Không có ảnh slideshow</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Carousel
        ref={carouselRef}
        data={props.items || []}
        renderItem={renderItem}
        width={screenWidth - 32}
        height={160}
        autoPlay
        autoPlayInterval={4000}
        loop
        onProgressChange={(_, absoluteProgress) =>
          setActiveSlide(Math.round(absoluteProgress))
        }
        style={styles.carousel}
      />
      <CustomPagination items={props.items} activeSlide={activeSlide} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: screenWidth - 32, // match parent with mx-4
    height: 160,
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: 8,
  },
  containerEmpty: {
    width: screenWidth - 32,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  slideContainer: {
    width: screenWidth - 32,
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  carousel: {
    alignSelf: 'center',
  }
});

export default SlideShow;
