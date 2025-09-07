import messaging from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-community/async-storage";

import * as RootNavigation from '../navigation/RootNavigation';
import {Linking} from "react-native";
import axios from "axios";
import apiConfig from "app/config/api-config";

export async function requestUserPermission() {
    const authStatus = await messaging().requestPermission()
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
        console.log('Authorization status: ', authStatus)
    }
}

export async function GetFCMToken({currentUser, os}) {
    try {
        let fcmtoken = await messaging().getToken();
        if (fcmtoken) {
            console.log("FCM token: ", fcmtoken)
            console.log("Current user: ", currentUser ? currentUser.id : 'Not logged in')

            await axios.post(
                `${apiConfig.BASE_URL}/push-notify/subscribe`,
                {
                    token: fcmtoken,
                    userId: currentUser && currentUser.id,
                    os,
                },
            ).then(function (response) {
                console.log("Token registered successfully:", response.data);
                // Lưu token vào AsyncStorage để tránh gửi lại liên tục
                AsyncStorage.setItem('htm_fcmtoken', fcmtoken);
            }).catch(function(error) {
                console.log("Error registering token:", error);
            })
        } else {
            console.log("No FCM token available");
        }
    } catch (error) {
        console.log("error in fcmtoken", error)
    }
}

export const NotificationListener = () => {
    // Assume a message-notification contains a "type" property in the data payload of the screen to open

    messaging().onNotificationOpenedApp(remoteMessage => {
        console.log(
            'Notification caused app to open from background state:',
            remoteMessage,
        );
        if (remoteMessage.data) {
            if (remoteMessage.data.type === 'product' && remoteMessage.data.slug) {
                Linking.openURL(`bbgo://app/product/${remoteMessage.data.slug}`)
            }
            if (remoteMessage.data.type === 'info' && remoteMessage.data.slug) {
                Linking.openURL(`bbgo://app/post/${remoteMessage.data.slug}`)
            }
            if (remoteMessage.data.type === 'order' && remoteMessage.data.slug) {
                Linking.openURL(`bbgo://app/order/${remoteMessage.data.slug}`)
            }
            if (remoteMessage.data.type === 'transaction' && remoteMessage.data.slug) {
                console.log('Transaction notification:', remoteMessage.data.slug);
                // Có thể mở transaction detail screen nếu có
                // Linking.openURL(`bbgo://app/transaction/${remoteMessage.data.slug}`)
            }
        }

    });

    // Check whether an initial notification is available
    messaging()
        .getInitialNotification()
        .then(remoteMessage => {
            if (remoteMessage) {
                console.log(
                    'Notification caused app to open from quit state:',
                    remoteMessage,
                );

                if (remoteMessage.data) {
                    if (remoteMessage.data.type === 'product' && remoteMessage.data.slug) {
                        Linking.openURL(`bbgo://app/product/${remoteMessage.data.slug}`)
                    }
                    if (remoteMessage.data.type === 'info' && remoteMessage.data.slug) {
                        console.log('Opening post with slug:', remoteMessage.data.slug);
                        Linking.openURL(`bbgo://app/post/${remoteMessage.data.slug}`)
                    }
                    if (remoteMessage.data.type === 'order' && remoteMessage.data.slug) {
                        console.log('Opening order with slug:', remoteMessage.data.slug);
                        Linking.openURL(`bbgo://app/order/${remoteMessage.data.slug}`)
                    }
                    if (remoteMessage.data.type === 'transaction' && remoteMessage.data.slug) {
                        console.log('Transaction notification:', remoteMessage.data.slug);
                        // Có thể mở transaction detail screen nếu có
                        // Linking.openURL(`bbgo://app/transaction/${remoteMessage.data.slug}`)
                    }
                }
                //setInitialRoute(remoteMessage.data.type); // e.g. "Settings"
            }
            //setLoading(false);
        });

    messaging().onMessage(async remoteMessage => {
        console.log('notification on foreground', remoteMessage)

        if (remoteMessage.data) {
            if (remoteMessage.data.type === 'product' && remoteMessage.data.slug) {
                Linking.openURL(`bbgo://app/product/${remoteMessage.data.slug}`)
            }
            if (remoteMessage.data.type === 'info' && remoteMessage.data.slug) {
                console.log('Opening post with slug:', remoteMessage.data.slug);
                Linking.openURL(`bbgo://app/post/${remoteMessage.data.slug}`)
            }
            if (remoteMessage.data.type === 'order' && remoteMessage.data.slug) {
                console.log('Opening order with slug:', remoteMessage.data.slug);
                Linking.openURL(`bbgo://app/order/${remoteMessage.data.slug}`)
            }
            if (remoteMessage.data.type === 'transaction' && remoteMessage.data.slug) {
                console.log('Transaction notification:', remoteMessage.data.slug);
                // Có thể mở transaction detail screen nếu có
                // Linking.openURL(`bbgo://app/transaction/${remoteMessage.data.slug}`)
            }
        }
    })
}
