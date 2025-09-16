import React, { useState } from "react";
import { Platform, Dimensions } from "react-native";
import WebView from "react-native-webview";

const DynamicHeightWebView = (props) => {
	const [height, setHeight] = useState(600); // Set reasonable initial height
	const maxHeight = Dimensions.get('window').height * 0.8; // Max 80% of screen height
	const webViewScript = `
    function getContentHeight() {
      var body = document.body;
      var html = document.documentElement;
      
      var height = Math.max(
        body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight
      );
      
      // Add extra padding to ensure all content is visible
      return height + 50;
    }
    
    // Try multiple times to get accurate height
    setTimeout(function() {
      var height = getContentHeight();
      window.ReactNativeWebView.postMessage(height);
    }, 100);
    
    setTimeout(function() {
      var height = getContentHeight();
      window.ReactNativeWebView.postMessage(height);
    }, 500);
    
    setTimeout(function() {
      var height = getContentHeight();
      window.ReactNativeWebView.postMessage(height);
    }, 1000);
    
    true; // note: this is required, or you'll sometimes get silent failures
  `;
	
	return <WebView
		{...props}
		style={{
			...props.style,
			height: Math.min(height, maxHeight), // Limit height to max 80% of screen
		}}
		automaticallyAdjustContentInsets={false}
		scrollEnabled={true} // Enable scrolling within WebView for content
		onMessage={event => {
			const newHeight = parseInt(event.nativeEvent.data);
			if (newHeight > 0 && newHeight > height) {
				setHeight(newHeight);
			}
		}}
		onLoadEnd={() => {
			// Recalculate height when content is fully loaded
			setTimeout(() => {
				const recalculateScript = `
					var height = Math.max(
						document.body.scrollHeight, document.body.offsetHeight,
						document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight
					) + 50;
					window.ReactNativeWebView.postMessage(height);
					true;
				`;
				// This will be handled by the injectedJavaScript
			}, 100);
		}}
		javaScriptEnabled={true}
		injectedJavaScript={webViewScript}
		domStorageEnabled={true}
		// Add Android-specific props
		{...Platform.select({
			android: {
				androidLayerType: 'hardware',
				mixedContentMode: 'compatibility',
				thirdPartyCookiesEnabled: true,
				allowsInlineMediaPlayback: true,
				nestedScrollEnabled: true, // Enable nested scrolling for better Android experience
			}
		})}
	/>
}

export default DynamicHeightWebView;
