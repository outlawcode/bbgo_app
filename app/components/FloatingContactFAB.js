import React, { useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Linking, Platform, TouchableOpacity, View, Alert, TouchableWithoutFeedback, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import tw from 'twrnc';
import * as RootNavigation from 'app/navigation/RootNavigation';
import { navigationRef } from 'app/navigation/RootNavigation';

function openTel(phone) {
  if (!phone) {
    Alert.alert('Liên hệ', 'Chưa cấu hình số hotline');
    return;
  }
  const digits = String(phone).replace(/\s|-/g, '');
  const url = Platform.select({ ios: `telprompt:${digits}`, android: `tel:${digits}` });
  Linking.canOpenURL(url).then(s => s && Linking.openURL(url)).catch(() => {});
}

function openZalo(zalo) {
  if (!zalo) return;
  const digits = String(zalo).replace(/\D/g, '');
  // Prefer native scheme if available; fallback to web link
  const nativeUrl = `zalo://chat?phone=${digits}`;
  const webUrl = `https://zalo.me/${digits}`;
  Linking.canOpenURL(nativeUrl).then(supported => {
    if (supported) return Linking.openURL(nativeUrl);
    return Linking.openURL(webUrl);
  }).catch(() => Linking.openURL(webUrl));
}

const ActionBtn = ({ icon, label, color = '#2563eb', onPress, size = 44 }) => (
  <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={tw`shadow-lg`}>
    <View style={[tw`rounded-full items-center justify-center`, { width: size, height: size, backgroundColor: color, paddingHorizontal: 10 }]}> 
      {label ? (
        <Text numberOfLines={1} style={[tw`text-white font-bold`, { fontSize: 10 }]}>{label}</Text>
      ) : (
        <Icon name={icon} size={Math.floor(size * 0.5)} style={tw`text-white`} />
      )}
    </View>
  </TouchableOpacity>
);

function FloatingContactFAB({ hotline, zalo, bottom = 90, right = 16 }) {
  const { width, height } = Dimensions.get('window');
  const [expanded, setExpanded] = useState(false);

  const mainScale = useRef(new Animated.Value(1)).current;
  const anim = useRef(new Animated.Value(0)).current; // 0 collapsed, 1 expanded
  const carousel = useRef(new Animated.Value(0)).current; // cycles icons when collapsed

  const mainSize = 48;
  const initialPos = useMemo(() => ({ x: Math.max(8, width - right - mainSize), y: Math.max(60, height - bottom - mainSize) }), [width, height, right, bottom]);
  const position = useRef(new Animated.ValueXY(initialPos)).current;

  const toggle = () => {
    const to = expanded ? 0 : 1;
    setExpanded(!expanded);
    Animated.timing(anim, { toValue: to, duration: 220, easing: Easing.inOut(Easing.ease), useNativeDriver: true }).start();
  };

  const collapseNow = () => {
    setExpanded(false);
    try { anim.stopAnimation(); } catch (e) {}
    try { anim.setValue(0); } catch (e) {}
  };

  // fun pulse on main button
  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(mainScale, { toValue: 1.06, duration: 280, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(mainScale, { toValue: 1.0, duration: 280, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [mainScale]);

  // Auto-collapse on any navigation state change (e.g., when moving to Contact)
  React.useEffect(() => {
    const unsubscribe = navigationRef.addListener('state', () => {
      collapseNow();
    });
    return () => {
      try { unsubscribe && unsubscribe(); } catch (e) {}
    };
  }, []);

  // Carousel icons when collapsed (slide horizontally with 1.5s hold, infinite loop)
  React.useEffect(() => {
    let looping;
    if (!expanded) {
      // Always reset to the first icon to ensure it's visible initially
      try { carousel.setValue(0); } catch (e) {}
      const seq = Animated.sequence([
        Animated.delay(1500),
        Animated.timing(carousel, { toValue: 1, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.delay(1500),
        Animated.timing(carousel, { toValue: 2, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.delay(1500),
        Animated.timing(carousel, { toValue: 3, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        // snap back to 0 instantly (duplicate of first icon ensures seamless loop)
        Animated.timing(carousel, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]);
      looping = Animated.loop(seq);
      looping.start();
    }
    return () => { looping && looping.stop && looping.stop(); };
  }, [expanded, carousel]);

  const translate = (index) => ({
    transform: [
      { translateX: position.x },
      { translateY: Animated.add(position.y, Animated.multiply(anim, new Animated.Value(-(index * 60)))) },
      { scale: Animated.add(new Animated.Value(0.8), Animated.multiply(anim, new Animated.Value(0.2))) },
    ],
    opacity: Animated.add(new Animated.Value(0), anim),
  });

  return (
    <View pointerEvents="box-none" style={tw`absolute left-0 right-0 top-0 bottom-0`}> 
      {/* Backdrop to close when tapping outside */}
      {expanded && (
        <TouchableWithoutFeedback onPress={() => toggle()}>
          <View style={tw`absolute left-0 right-0 top-0 bottom-0`} />
        </TouchableWithoutFeedback>
      )}
      {/* Action items */}
      <Animated.View style={[tw`absolute`, translate(1), { zIndex: 9998, elevation: 9998 }]}> 
        <ActionBtn icon="phone" color="#ef4444" onPress={() => { collapseNow(); openTel(hotline); }} />
      </Animated.View>
      <Animated.View style={[tw`absolute`, translate(2), { zIndex: 9998, elevation: 9998 }]}> 
        <ActionBtn label="Zalo" color="#0ea5e9" onPress={() => { collapseNow(); openZalo(zalo || hotline); }} />
      </Animated.View>
      <Animated.View style={[tw`absolute`, translate(3), { zIndex: 9998, elevation: 9998 }]}> 
        <ActionBtn icon="email" color="#8b5cf6" onPress={() => {
          collapseNow();
          try {
            // Use nested navigation into Home tab's stack to ensure availability from any tab
            RootNavigation.navigate('Trang chủ', { screen: 'Contact' });
          } catch (e) {
            try { RootNavigation.navigate('Contact'); } catch (err) { console.log('NAV_ERROR', err); }
          }
        }} />
      </Animated.View>

      {/* Main toggle button */}
      <Animated.View style={[tw`absolute`, { transform: [{ translateX: position.x }, { translateY: position.y }, { scale: mainScale }], zIndex: 9999, elevation: 9999 }]}> 
        <TouchableOpacity activeOpacity={0.95} onPress={toggle}>
          <View style={[tw`bg-orange-500 rounded-full overflow-hidden`, { width: mainSize, height: mainSize }]}> 
            {/* When collapsed: carousel slide of icons (email, phone, Zalo). When expanded: show close. */}
            {!expanded ? (
              <Animated.View style={{ position: 'absolute', left: 0, top: 0, width: mainSize * 4, height: mainSize, flexDirection: 'row', transform: [{ translateX: carousel.interpolate({ inputRange: [0,1,2,3], outputRange: [0, -mainSize, -mainSize*2, -mainSize*3] }) }] }}>
                <View style={{ width: mainSize, height: mainSize, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={tw`text-white font-bold text-xs`}>Zalo</Text>
                </View>
                <View style={{ width: mainSize, height: mainSize, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={'phone'} size={20} style={tw`text-white`} />
                </View>
                <View style={{ width: mainSize, height: mainSize, alignItems: 'center', justifyContent: 'center' }}>
                  <FAIcon name={'envelope'} size={18} style={tw`text-white`} />
                </View>
                {/* duplicate first for seamless wrap */}
                <View style={{ width: mainSize, height: mainSize, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={tw`text-white font-bold text-xs`}>Zalo</Text>
                </View>
              </Animated.View>
            ) : (
              <View style={{ width: mainSize, height: mainSize, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={'close'} size={18} style={tw`text-white`} />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export default FloatingContactFAB;


