import React, { useEffect, useState } from "react";
import QRCodeScanner from "react-native-qrcode-scanner";
import { Dimensions, Linking, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { showMessage } from "react-native-flash-message";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import * as Animatable from "react-native-animatable";
import InfoModalContent from "app/components/ModalContent.js";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";
import apiConfig from "app/config/api-config";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;

console.disableYellowBox = true;

function BarCodeScanner(props) {
  const {onClose, onChoose} = props;
  const [result, setResult] = useState(null)
  const settings = useSelector(state => state.SettingsReducer.options);

  function onSuccess(res) {
    const data = res.data;
    console.log(data);
    if (data) {
      setResult(data)
    } else {
      showMessage({
        message: 'Mã Barcode không hợp lệ',
        type: 'danger',
        icon: 'danger',
        duration: 3000,
      });
    }
  }

  useEffect(() => {
    if (result) {
      async function getData() {
        const token = await AsyncStorage.getItem('sme_user_token');
        axios({
          method: 'get',
          url: `${apiConfig.BASE_URL}/member/shop-product-stock/search`,
          params: {
            query: result
          },
          headers: { Authorization: `Bearer ${token}` }
        }).then(function(response) {
          if (response.status === 200) {
            if (response.data.list.length > 0) {
              onChoose(response.data.list[0])
            } else {
              showMessage({
                message: 'Không tìm thấy sản phẩm!',
                type: 'danger',
                icon: 'danger',
                duration: 3000,
              });
            }
          }
        }).catch(function(error) {
          console.log(error);
        })
      }

      getData();
    }
  }, [result])


  const overlayColor = "rgba(0,0,0,0.5)"; // this gives us a black color with a 50% transparency

  const rectDimensions = SCREEN_WIDTH * 0.65; // this is equivalent to 255 from a 393 device width
  const rectBorderWidth = SCREEN_WIDTH * 0.005; // this is equivalent to 2 from a 393 device width
  const rectBorderColor = "transparent";

  const scanBarWidth = SCREEN_WIDTH * 0.46; // this is equivalent to 180 from a 393 device width
  const scanBarHeight = SCREEN_WIDTH * 0.0025; //this is equivalent to 1 from a 393 device width
  const scanBarColor = "#c50036";

  const iconScanColor = "white";

  const styles = {
    rectangleContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent"
    },

    rectangle: {
      height: rectDimensions,
      width: rectDimensions,
      borderWidth: rectBorderWidth,
      borderColor: rectBorderColor,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent"
    },

    topOverlay: {
      flex: 1,
      height: SCREEN_WIDTH,
      width: SCREEN_WIDTH,
      backgroundColor: overlayColor,
      justifyContent: "center",
      alignItems: "center"
    },

    bottomOverlay: {
      flex: 1,
      height: SCREEN_WIDTH,
      width: SCREEN_WIDTH,
      backgroundColor: overlayColor,
      paddingBottom: SCREEN_WIDTH * 0.25,
      justifyContent: "center",
      alignItems: "center"
    },

    leftAndRightOverlay: {
      height: SCREEN_WIDTH * 0.65,
      width: SCREEN_WIDTH,
      backgroundColor: overlayColor
    },

    scanBar: {
      width: scanBarWidth,
      height: scanBarHeight,
      backgroundColor: scanBarColor
    }
  };

  function makeSlideOutTranslation(translationType, fromValue) {
    return {
      from: {
        [translationType]: SCREEN_WIDTH * -0.18
      },
      to: {
        [translationType]: fromValue
      }
    };
  }

  return (
    <View style={tw`-top-35 -left-5`}>
      <QRCodeScanner
        onRead={onSuccess}
        reactivate={true}
        reactivateTimeout={3000}
        cameraType={'back'}
        showMarker={true}
        cameraProps={{captureAudio: false}}
        cameraStyle={{ height: SCREEN_HEIGHT/2 }}
        customMarker={
          <View style={styles.rectangleContainer}>
            <View style={styles.topOverlay} />

            <View style={{ flexDirection: "row" }}>
              <View style={styles.leftAndRightOverlay} />
              <View style={styles.rectangle}>
                <Icon
                  name="scan-helper"
                  size={SCREEN_WIDTH * 0.6}
                  color={iconScanColor}
                />
                <Animatable.View
                  style={styles.scanBar}
                  direction="alternate-reverse"
                  iterationCount="infinite"
                  duration={1700}
                  easing="linear"
                  animation={makeSlideOutTranslation(
                    "translateY",
                    SCREEN_WIDTH * -0.54
                  )}
                />
              </View>

              <View style={styles.leftAndRightOverlay} />
            </View>

            <View style={[styles.bottomOverlay, tw`flex flex-row items-center`]}>
              <Text style={{ fontSize: 16, color: "white" }}>
                Hướng Camera Về Mã Barcode
              </Text>
            </View>
          </View>
        }
      />

      <View style={tw`-right-5 bottom-0 mb-5 pb-5`}>
        <TouchableOpacity
          onPress={() => onClose()}
          style={tw`flex items-center flex-row bg-red-50 border border-red-200 px-3 py-2`}
        >
          <Icon name={"close"} style={tw`text-red-500`} size={18} />
          <Text style={tw`font-medium text-red-500`}>Đóng lại</Text>
        </TouchableOpacity>
      </View>

    </View>

  );
}

export default BarCodeScanner;
