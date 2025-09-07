import React from 'react';
import {View} from 'react-native';
import tw from 'twrnc';

function ModalOverlayScreen (props) {
    return (
        <View style={tw`bg-gray-100`}>
            {props.route.params.content}
        </View>
    )
}

export default ModalOverlayScreen
