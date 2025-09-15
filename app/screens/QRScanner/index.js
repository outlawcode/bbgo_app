import React, { useEffect, useState } from "react";
import QRCodeScanner from "react-native-qrcode-scanner";
import { Dimensions, Linking, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { showMessage } from "react-native-flash-message";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import * as Animatable from "react-native-animatable";
import InfoModalContent from "app/components/ModalContent.js";
import UseGuide from "app/screens/QRScanner/UseGuide.js";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;

console.disableYellowBox = true;

function QRScanner(props) {
    const [result, setResult] = useState(null)
    const settings = useSelector(state => state.SettingsReducer.options);

    useEffect(() => {
        props.navigation.setOptions({
            title: 'Scanner',
            headerStyle: {
                backgroundColor: '#fff',
            },
            headerTintColor: '#000',
            headerLeft: () => (
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => props.navigation.goBack()}>
                    <Icon name="chevron-left"
                          size={32}
                          style={tw`ml-3`}
                    />
                </TouchableOpacity>
            ),
        })
    }, [])

    function getDomain(url, subdomain) {
        subdomain = subdomain || false;

        url = url.replace(/(https?:\/\/)?(www.)?/i, '');

        if (!subdomain) {
            url = url.split('.');

            url = url.slice(url.length - 2).join('.');
        }

        if (url.indexOf('/') !== -1) {
            return url.split('/')[0];
        }

        return url;
    }

    function onSuccess(res) {
        const url = res.data;
        console.log(url);
        if (url) {
            const domain = getDomain(url);
            if (settings) {
                if (settings.mk_website_url !== `https://${domain}`) {
                    showMessage({
                        message: 'Mã QR không hợp lệ',
                        type: 'danger',
                        icon: 'danger',
                        duration: 3000,
                    });
                } else {
                    const urlArr = url.split('/');
                    const id = urlArr[urlArr.length - 1];
                    const action = urlArr[urlArr.length - 2];
                    console.log(id);
                    console.log(action);
                    if (action && id) {
                        if (action === 'classroom-rollup') {
                            props.navigation.navigate("ClassroomRollup", {
                                id
                            })
                        }
                        if (action === 'parking-checkin') {
                            props.navigation.navigate("ParkingCheckin", {
                                id
                            })
                        }
                        if (action === 'company-checkin') {
                            props.navigation.navigate("CompanyCheckin", {
                                id
                            })
                        }
                        if (action === 'card.hotromua.com') {
                            if (id) {
                                Linking.openURL(`https://card.hotromua.com/${id}`)
                            }
                        }
                        if (action === 'pay-order') {
                            props.navigation.navigate("PayOrder", {
                                id
                            })
                        }
                    } else {
                        showMessage({
                            message: 'Mã QR không hợp lệ',
                            type: 'danger',
                            icon: 'danger',
                            duration: 3000,
                        });
                    }
                }
            }
        } else {
            showMessage({
                message: 'Mã QR không hợp lệ',
                type: 'danger',
                icon: 'danger',
                duration: 3000,
            });
        }
    }

    const overlayColor = "rgba(0,0,0,0.5)"; // this gives us a black color with a 50% transparency

    const rectDimensions = SCREEN_WIDTH * 0.65; // this is equivalent to 255 from a 393 device width
    const rectBorderWidth = SCREEN_WIDTH * 0.005; // this is equivalent to 2 from a 393 device width
    const rectBorderColor = "transparent";

    const scanBarWidth = SCREEN_WIDTH * 0.46; // this is equivalent to 180 from a 393 device width
    const scanBarHeight = SCREEN_WIDTH * 0.0025; //this is equivalent to 1 from a 393 device width
    const scanBarColor = "#34b200";

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
        <View style={tw`flex bg-white min-h-full content-between`}>
            <QRCodeScanner
                onRead={onSuccess}
                reactivate={true}
                reactivateTimeout={3000}
                cameraType={'back'}
                showMarker={true}
                cameraProps={{captureAudio: false}}
                cameraStyle={{ height: SCREEN_HEIGHT }}
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
                                    duration={1200}
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
                                Hướng Camera Về Phía Mã QR
                            </Text>
                            <TouchableOpacity
                              activeOpacity={1}
                              onPress={() => props.navigation.navigate('ModalOverlay', {content: <UseGuide navigation={props.navigation} backScreen={"QRScan"}/>})}
                            >
                                <Icon name="help-circle"
                                      size={26}
                                      style={tw`ml-3 text-white`}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                }
            />
        </View>

    );
}

export default QRScanner;
