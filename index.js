/**
 * @format
 */
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import EntryPoint from './app/Entrypoint';
import { name as appName } from './app.json';
import { enableScreens } from 'react-native-screens';
import messaging from "@react-native-firebase/messaging";
// import {enableLatestRenderer} from 'react-native-maps';
import { initializeFirebase } from './app/utils/firebaseInit';

if (typeof BigInt === 'undefined') global.BigInt = require('big-integer');
enableScreens();

// enableLatestRenderer();

// Khởi tạo Firebase trước khi sử dụng
initializeFirebase().then(success => {
  if (success) {
    console.log('Firebase đã được khởi tạo thành công');
    
    // Đăng ký handler cho tin nhắn nền sau khi Firebase đã khởi tạo
    // Sử dụng API mới theo hướng dẫn: https://rnfirebase.io/migrating-to-v22
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handle in the background!', remoteMessage/**/)
    });
  } else {
    console.error('Không thể khởi tạo Firebase, một số tính năng có thể không hoạt động');
  }
});

AppRegistry.registerComponent(appName, () => EntryPoint);
console.log('Component registered successfully');