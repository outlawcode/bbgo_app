import messaging from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
        // Kiểm tra xem Firebase đã sẵn sàng chưa
        const { firebase } = await import('@react-native-firebase/app');
        if (!firebase.apps.length) {
            console.warn("Firebase chưa được khởi tạo khi gọi GetFCMToken");
            return null;
        }
        
        let fcmtoken = await messaging().getToken();
        if (fcmtoken) {
            console.log("FCM token: ", fcmtoken)
            console.log("Current user: ", currentUser ? currentUser.id : 'Not logged in')

            try {
                const response = await axios.post(
                    `${apiConfig.BASE_URL}/push-notify/subscribe`,
                    {
                        token: fcmtoken,
                        userId: currentUser && currentUser.id,
                        os,
                    },
                );
                console.log("Token registered successfully:", response.data);
                // Lưu token vào AsyncStorage để tránh gửi lại liên tục
                await AsyncStorage.setItem('htm_fcmtoken', fcmtoken);
                return fcmtoken;
            } catch (error) {
                console.log("Error registering token:", error);
                return fcmtoken; // Vẫn trả về token dù có lỗi khi đăng ký
            }
        } else {
            console.log("No FCM token available");
            return null;
        }
    } catch (error) {
        console.log("Error in FCM token generation:", error);
        return null;
    }
}

export const NotificationListener = () => {
    try {
        // Assume a message-notification contains a "type" property in the data payload of the screen to open
        messaging().onNotificationOpenedApp(remoteMessage => {
            try {
                console.log(
                    'Notification caused app to open from background state:',
                    remoteMessage,
                );
                if (remoteMessage.data) {
                    if (remoteMessage.data.type === 'product' && remoteMessage.data.slug) {
                        Linking.openURL(`bbherb://app/product/${remoteMessage.data.slug}`)
                    }
                    if (remoteMessage.data.type === 'info' && remoteMessage.data.slug) {
                        Linking.openURL(`bbherb://app/post/${remoteMessage.data.slug}`)
                    }
                    if (remoteMessage.data.type === 'order' && remoteMessage.data.slug) {
                        Linking.openURL(`bbherb://app/order/${remoteMessage.data.slug}`)
                    }
                    if (remoteMessage.data.type === 'transaction' && remoteMessage.data.slug) {
                        console.log('Transaction notification:', remoteMessage.data.slug);
                        // Có thể mở transaction detail screen nếu có
                        // Linking.openURL(`bbherb://app/transaction/${remoteMessage.data.slug}`)
                    }
                }
            } catch (error) {
                console.error('Lỗi xử lý thông báo khi mở ứng dụng từ background:', error);
            }
        });
    } catch (error) {
        console.error('Lỗi thiết lập onNotificationOpenedApp listener:', error);
    }

    // Check whether an initial notification is available
    try {
        messaging()
            .getInitialNotification()
            .then(remoteMessage => {
                try {
                    if (remoteMessage) {
                        console.log(
                            'Notification caused app to open from quit state:',
                            remoteMessage,
                        );

                        if (remoteMessage.data) {
                            if (remoteMessage.data.type === 'product' && remoteMessage.data.slug) {
                                Linking.openURL(`bbherb://app/product/${remoteMessage.data.slug}`)
                            }
                            if (remoteMessage.data.type === 'info' && remoteMessage.data.slug) {
                                console.log('Opening post with slug:', remoteMessage.data.slug);
                                Linking.openURL(`bbherb://app/post/${remoteMessage.data.slug}`)
                            }
                            if (remoteMessage.data.type === 'order' && remoteMessage.data.slug) {
                                console.log('Opening order with slug:', remoteMessage.data.slug);
                                Linking.openURL(`bbherb://app/order/${remoteMessage.data.slug}`)
                            }
                            if (remoteMessage.data.type === 'transaction' && remoteMessage.data.slug) {
                                console.log('Transaction notification:', remoteMessage.data.slug);
                                // Có thể mở transaction detail screen nếu có
                                // Linking.openURL(`bbherb://app/transaction/${remoteMessage.data.slug}`)
                            }
                        }
                        //setInitialRoute(remoteMessage.data.type); // e.g. "Settings"
                    }
                    //setLoading(false);
                } catch (error) {
                    console.error('Lỗi xử lý thông báo ban đầu:', error);
                }
            })
            .catch(error => {
                console.error('Lỗi khi lấy thông báo ban đầu:', error);
            });
    } catch (error) {
        console.error('Lỗi thiết lập getInitialNotification:', error);
    }

    try {
        messaging().onMessage(async remoteMessage => {
            try {
                console.log('notification on foreground', remoteMessage)

                if (remoteMessage.data) {
                    if (remoteMessage.data.type === 'product' && remoteMessage.data.slug) {
                        Linking.openURL(`bbherb://app/product/${remoteMessage.data.slug}`)
                    }
                    if (remoteMessage.data.type === 'info' && remoteMessage.data.slug) {
                        console.log('Opening post with slug:', remoteMessage.data.slug);
                        Linking.openURL(`bbherb://app/post/${remoteMessage.data.slug}`)
                    }
                    if (remoteMessage.data.type === 'order' && remoteMessage.data.slug) {
                        console.log('Opening order with slug:', remoteMessage.data.slug);
                        Linking.openURL(`bbherb://app/order/${remoteMessage.data.slug}`)
                    }
                    if (remoteMessage.data.type === 'transaction' && remoteMessage.data.slug) {
                        console.log('Transaction notification:', remoteMessage.data.slug);
                        // Có thể mở transaction detail screen nếu có
                        // Linking.openURL(`bbherb://app/transaction/${remoteMessage.data.slug}`)
                    }
                }
            } catch (error) {
                console.error('Lỗi xử lý thông báo trong foreground:', error);
            }
        });
    } catch (error) {
        console.error('Lỗi thiết lập onMessage listener:', error);
    }
}
