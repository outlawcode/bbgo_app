/**
 * @format
 */
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './app/Entrypoint';
import { name as appName } from './app.json';
import { enableScreens } from 'react-native-screens';
import messaging from "@react-native-firebase/messaging";
import {enableLatestRenderer} from 'react-native-maps';

if (typeof BigInt === 'undefined') global.BigInt = require('big-integer');
enableScreens();

enableLatestRenderer();

messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handle in the background!', remoteMessage/**/)
})

AppRegistry.registerComponent(appName, () => App);
