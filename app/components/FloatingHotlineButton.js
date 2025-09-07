import React, {useEffect, useMemo, useRef} from "react";
import {Animated, Dimensions, Easing, Linking, PanResponder, Platform, TouchableOpacity, View} from "react-native";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const dialNumber = async (hotline) => {
  if (!hotline) return;
  const phone = hotline.replace(/\s|-/g, "");
  const url = Platform.select({ ios: `telprompt:${phone}`, android: `tel:${phone}` });
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
  } catch (e) {}
};

function FloatingHotlineButton({ phoneNumber, bottom = 100, right = 10, size = 32 }) {
  const scale = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const { width, height } = Dimensions.get('window');

  // Initial absolute position (top/left) computed from bottom/right
  const initialPos = useMemo(() => ({
    x: Math.max(8, width - right - size),
    y: Math.max(40, height - bottom - size),
  }), [width, height, right, bottom, size]);
  const position = useRef(new Animated.ValueXY(initialPos)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        position.setOffset({ x: position.x.__getValue(), y: position.y.__getValue() });
        position.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: position.x, dy: position.y }], { useNativeDriver: false }),
      onPanResponderRelease: () => {
        position.flattenOffset();
        // Clamp within screen bounds with small padding
        const pad = 8;
        const minY = 40; // keep above bottom bar a bit
        const maxX = width - size - pad;
        const maxY = height - size - pad;
        let x = position.x.__getValue();
        let y = position.y.__getValue();
        if (x < pad) x = pad; if (x > maxX) x = maxX;
        if (y < minY) y = minY; if (y > maxY) y = maxY;
        position.setValue({ x, y });
      },
    })
  ).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.08, duration: 280, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(rotate, { toValue: 1, duration: 280, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 280, easing: Easing.in(Easing.ease), useNativeDriver: true }),
          Animated.timing(rotate, { toValue: 0, duration: 280, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        ]),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [scale, rotate]);

  const rotateInterpolate = rotate.interpolate({ inputRange: [0, 1], outputRange: ["-6deg", "6deg"] });

  return (
    <Animated.View
      style={[tw`absolute`, {
        transform: [{ translateX: position.x }, { translateY: position.y }, { scale }, { rotate: rotateInterpolate }],
        zIndex: 9999,
        elevation: 9999,
      }]}
      pointerEvents="box-none"
      {...panResponder.panHandlers}
    >
      <TouchableOpacity activeOpacity={0.8} onPress={() => dialNumber(phoneNumber)}>
        <View style={[tw`bg-cyan-600 rounded-full items-center justify-center`, { width: size, height: size }]}>
          <Icon name="phone" size={Math.floor(size * 0.5)} style={tw`text-white`} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default FloatingHotlineButton;


