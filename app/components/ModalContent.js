import React, {useState} from 'react';
import {View, Text} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {WebView} from 'react-native-webview';
import tw from "twrnc";

function InfoModalContent(props) {
    const [height, setHeight] = useState(100)
    const source = props.content ?
        {
            html: `<head>
                   <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body {
                       font-size: 16px;
                        }
                        li {
                        box-sizing: unset !important;;
                        height: unset !important;
                        }
                        img { display: block; max-width: 100%; height: auto; }
                        p {margin-bottom: -15px}
                    </style></head><body>${props.content}</body>`
        }
        :
        {}
    const webViewScript = `
      setTimeout(function() {
        window.postMessage(document.documentElement.scrollHeight);
      }, 500);
      true; // note: this is required, or you'll sometimes get silent failures
    `;
    return (
        <View>
            <View style={tw`flex flex-row justify-between border-b border-gray-200 py-2 px-3 items-center`}>
                <Text  style={tw`font-medium`}>{props.title}</Text>
                <Icon name="close-circle" size={24} onPress={() => props.navigation.navigate(props.backScreen, props.routeParams)}/>
            </View>
            <View style={tw`h-full pb-44 bg-white px-2`}>
                <WebView
                    automaticallyAdjustContentInsets={false}
                    scrollEnabled={true}
                    source={source}
                    onMessage={event => {
                        setHeight(parseInt(event.nativeEvent.data));
                    }}
                    javaScriptEnabled={true}
                    injectedJavaScript ={webViewScript}
                    domStorageEnabled={true}
                />
            </View>
        </View>
    );
}

export default InfoModalContent;
