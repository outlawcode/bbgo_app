import React from 'react';
import {Text, TouchableOpacity, useWindowDimensions, View} from 'react-native';
import tw from 'twrnc';
import {WebView} from 'react-native-webview';
import InfoModalContent from './ModalContent';
import RenderHtml from 'react-native-render-html';

function InfoBox({content, title, navigation, backScreen, slug, shopId}) {
    const { width } = useWindowDimensions();
    const source = content ?
        {
           html: `<head>
                    <link rel="preconnect" href="https://fonts.gstatic.com">
                    <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body {
                           
                            font-size: 16px;
                        }
                        p, h1, h2, h3, h4, h5, h6, ul, li, a, strong, italic {
                       font-size: 16px;
                        }
                        li {
                        box-sizing: unset !important;;
                        line-height: unset !important;
                        }
                        img { display: block; max-width: 100%; height: auto; }
                    </style>
                    </head>
                    <body>${content}</body>`
        }
        :
        {}

    const tagsStyles = {
        body: {
            whiteSpace: 'normal',
            fontSize: 13,
            fontFamily: 'Be Vietnam'
        },
        a: {
            color: 'blue'
        },
        img: {
            marginTop: 10,
            marginBottom: 20,
            width: '100%'
        },
        ul: {
            marginTop: 50
        },
        p: {
            marginBottom: -5
        }
    };

    return (
        <View style={tw`mb-3 bg-white py-3`}>
            {typeof content !== 'undefined' && content !== null ?
                <View style={tw`px-1`}>
                    <View style={tw`px-3 h-40 overflow-hidden`}>
                        <RenderHtml
                            source={source}
                            width={width}
                            tagsStyles={tagsStyles}
                            allowedStyles={[]}
                        />
                    </View>

                    <View style={tw`flex items-center content-center mt-3`}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('ModalOverlay', {content: <InfoModalContent title={title} content={content} navigation={navigation} backScreen={backScreen} routeParams={{slug: slug, shopId: shopId}}/>})}
                            style={tw`bg-white px-8 py-2 rounded-lg border border-gray-300`}
                        >
                            <Text>Xem thêm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                :
                <View style={tw`mt-5`}>
                    <Text style={tw`text-center`}>Đang cập nhật...</Text>
                </View>
            }

        </View>
    );
}

export default InfoBox;
