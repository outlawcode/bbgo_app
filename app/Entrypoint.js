/**
 * React Native App
 * Everything starts from the Entry-point
 */
import React, {useEffect} from "react";
import {ActivityIndicator, LogBox, Platform, Text, TextInput} from "react-native";
import {Provider, useDispatch, useSelector} from "react-redux";
import {PersistGate} from 'redux-persist/es/integration/react';
import {Provider as PaperProvider} from 'react-native-paper';

import {CombinedDarkTheme, CombinedDefaultTheme, PaperThemeDark, PaperThemeDefault,} from 'app/config/theme-config';
import Navigator from 'app/navigation/index';
import configureStore from 'app/store';
import {GetProductCategories, GetSettings} from "app/store/actions/settingActions";
import FlashMessage from "react-native-flash-message";
import {appUpgradeVersionCheck} from "app-upgrade-react-native-sdk";
import {AppConfig} from "app/config/api-config";
import {GetFCMToken, NotificationListener, requestUserPermission} from "app/utils/pushnotifycation";
import {WalletConnectModal} from "@walletconnect/modal-react-native";
import tw from "twrnc";

// Use main project ID (make sure this is correct and active)
const projectId = 'b5adb2e19ab2dd031b96956954f8cc6c';

// Debug log for checking project ID
console.log('Using WalletConnect Project ID:', projectId);

const providerMetadata = {
  name: 'BBGo',
  description: 'Connect to BBGo',
  url: 'https://bbgo.vn',
  icons: ['https://api.bbgo.vn/v1/media/file/logo-8f66.png'],
  redirect: {
    native: 'bbgo://',
    universal: 'https://bbgo.vn'
  },
};

// Define additional chain-specific settings including the Binance Smart Chain (BSC)
const bscChain = {
  chainId: 56,
  name: 'Binance Smart Chain',
  rpc: ['https://bsc-dataseed.binance.org/', 'https://bsc-dataseed1.binance.org/'],
  shortName: 'BSC',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  blockExplorerUrls: ['https://bscscan.com'],
};

// Improved session parameters - simpler and more focused
const sessionParams = {
  namespaces: {
    eip155: {
      methods: [
        'eth_sendTransaction',
        'personal_sign',
        'eth_signTypedData',
        'eth_accounts',
        'eth_chainId',
      ],
      chains: ['eip155:56'],
      events: ['accountsChanged', 'chainChanged'],
      rpcMap: {
        56: bscChain.rpc[0],
      },
    },
  },
};

// Modal appearance customization for better UX
const modalOptions = {
  themeMode: 'light',
  themeVariables: {
    '--wcm-z-index': 9999,
    '--wcm-background-color': '#ffffff',
    '--wcm-accent-color': '#3396FF',
    '--wcm-accent-fill-color': '#ffffff',
  },
  explorerRecommendedWalletIds: ['c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96'], // MetaMask
  enableExplorer: true,
  projectId: projectId,
  metadata: providerMetadata,
};

const { persistor, store } = configureStore();

Text.defaultProps = {
  ...(Text.defaultProps || {}),
  allowFontScaling: false,
};
TextInput.defaultProps = {
  ...(TextInput.defaultProps || {}),
  allowFontScaling: false,
};

const RootNavigation = (props) => {
  const dispatch = useDispatch();
  const isDark = useSelector((state) => state.themeReducer.isDark);
  const cart = useSelector((state) => state.CartReducer);
  const paperTheme = isDark ? PaperThemeDark : PaperThemeDefault;
  const combinedTheme = isDark ? CombinedDarkTheme : CombinedDefaultTheme;
  const currentUser = useSelector(state => state.memberAuth.user);
  const settings = useSelector(state => state.SettingsReducer.options);

  /*PushNotification.configure({
    // (optional) Called when Token is generated (iOS and Android)
    onRegister: function (token) {
      console.log('TOKEN:', token);
    },

    // (required) Called when a remote is received or opened, or local notification is opened
    onNotification: function (notification) {
      console.log('NOTIFICATION:', notification);

      // process the notification
      // (required) Called when a remote is received or opened, or local notification is opened
      notification.finish(PushNotificationIOS.FetchResult.NoData);
    },

    // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
    onAction: function (notification) {
      console.log('ACTION:', notification.action);
      console.log('NOTIFICATION:', notification);
      // process the action
    },

    // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
    onRegistrationError: function (err) {
      console.error(err.message, err);
    },

    // IOS ONLY (optional): default: all - Permissions to register.
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },

    // Should the initial notification be popped automatically
    // default: true

    popInitialNotification: true,

    /!**
     * (optional) default: true
     * - Specified if permissions (ios) and token (android and ios) will requested or not,
     * - if not, you must call PushNotificationsHandler.requestPermissions() later
     * - if you are not using remote notification or do not have Firebase installed, use this:
     *     requestPermissions: Platform.OS === 'ios'
     *!/

    requestPermissions: true,
  });*/

  useEffect(() => {
    LogBox.ignoreAllLogs();
    requestUserPermission()
    NotificationListener()
    GetFCMToken({
      currentUser: currentUser && currentUser,
      os: Platform.OS
    })
  }, [dispatch, settings, currentUser])

  useEffect(() => {
    dispatch(GetSettings());
    dispatch(GetProductCategories());
  }, [])

  return (
    <PaperProvider theme={paperTheme}>
      <Navigator theme={combinedTheme} />
      {/*<FloatingHotlineButton phoneNumber={(settings && settings.contact_hotline) ? settings.contact_hotline : "0909456789"} bottom={104} right={16} size={48} />*/}
    </PaperProvider>
  );
};

const EntryPoint = () => {
  const xApiKey = "OWY0NjM4ZTItOTM4MC00YjAxLTgwY2YtZTU1MmUxZjcwMjI5"; // Your project key
  const appInfo = {
    appId: Platform.OS === 'android' ? 'com.bbherb.bbgo' : 'id6744519551', // Your app url in play store or app store
    appName: 'BBGo', // Your app name
    appVersion: Platform.OS === 'android' ? AppConfig.androidVersion : AppConfig.iosVersion, // Your app version
    platform: Platform.OS === 'android' ? 'android' : 'iOS', // App Platform, android or ios
    environment: 'production', // App Environment, production, development
  };

  // Alert config is optional
  const alertConfig = {
    title: 'New version is now available!',
    updateButtonTitle: 'Update Now',
    laterButtonTitle: 'Later',
  };

  appUpgradeVersionCheck(appInfo, xApiKey, alertConfig);

  // Log platform info for debugging
  useEffect(() => {
    console.log('Platform:', Platform.OS);
    console.log('App initialized, preparing WalletConnect');
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={<ActivityIndicator />} persistor={persistor}>
        <RootNavigation />
        <WalletConnectModal
          projectId={projectId}
          providerMetadata={providerMetadata}
          sessionParams={sessionParams}
          explorerRecommendedWalletIds={modalOptions.explorerRecommendedWalletIds}
          explorerExcludedWalletIds={[]}
          enableExplorer={modalOptions.enableExplorer}
          themeMode={modalOptions.themeMode}
          themeVariables={modalOptions.themeVariables}
        />
        <FlashMessage position={"top"} style={tw`pt-12`} />
      </PersistGate>
    </Provider>
  );
};

export default EntryPoint;
