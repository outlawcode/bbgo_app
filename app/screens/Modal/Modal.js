import React from 'react';
import {View} from 'react-native';
import tw from 'twrnc';

function ModalScreen (props) {
    return (
        <View style={tw`bg-gray-100`}>
            {props.route.params.content}
        </View>
    )
}

export default ModalScreen
