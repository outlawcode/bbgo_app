import React, { useState } from "react";
import WebView from "react-native-webview";

const DynamicHeightWebView = (props) => {
	const [height, setHeight] = useState(0);
	const webViewScript = `
    setTimeout(function() {
      window.ReactNativeWebView.postMessage(document.documentElement.scrollHeight);
    }, 500);
    true; // note: this is required, or you'll sometimes get silent failures
  `;
	return <WebView
		{...props}
		style={{
			...props.style,
			height: height,
		}}
		automaticallyAdjustContentInsets={false}
		scrollEnabled={false}
		onMessage={event => {
			setHeight(parseInt(event.nativeEvent.data));
		}}
		javaScriptEnabled={true}
		injectedJavaScript={webViewScript}
		domStorageEnabled={true}
		useWebKit={true}
	/>
}

export default DynamicHeightWebView;
