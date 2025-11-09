/**
 * Text shim to disable font scaling globally
 * This file must be imported FIRST, before react-native-gesture-handler
 * and any other imports that might use Text or TextInput components
 * 
 * This patches the defaultProps of Text and TextInput from react-native
 * so that ALL Text and TextInput components throughout the app will have
 * allowFontScaling={false} by default.
 */
import { Text as RNText, TextInput as RNTextInput } from 'react-native';

// Patch Text component defaultProps
RNText.defaultProps = RNText.defaultProps || {};
RNText.defaultProps.allowFontScaling = false;

// Patch TextInput component defaultProps  
RNTextInput.defaultProps = RNTextInput.defaultProps || {};
RNTextInput.defaultProps.allowFontScaling = false;

// Log to confirm patching (can be removed in production)
if (__DEV__) {
  console.log('Text and TextInput font scaling disabled globally');
}

