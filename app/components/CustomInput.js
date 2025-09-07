import React from 'react'
import {Text, TextInput, StyleSheet, View} from 'react-native';
import tw from 'twrnc';

const CustomInput = (props) => {
    const {
        field: { name, onBlur, onChange, value },
        form: { errors, touched, setFieldTouched },
        label,
        textarea,
        ...inputProps
    } = props

    const hasError = errors[name] && touched[name]

    return (
        <View style={tw`mb-5`}>
            <Text  style={tw`mb-1 font-medium text-gray-600`}>{label} {props.required && <Text style={tw`text-red-600`}>*</Text>}</Text>
            <TextInput
                value={value}
                onChangeText={(text) => onChange(name)(text)}
                onBlur={() => {
                    setFieldTouched(name)
                    onBlur(name)
                }}
                keyboardType={props.number && 'numeric'}
                style={tw`${textarea ? 'h-22' : 'h-12' } text-gray-800 rounded border ${hasError ? 'border-red-500' : 'border-gray-300'} px-2 -pt-2 pb-2 bg-white text-base`}
                {...inputProps}
            />
            {hasError && <Text  style={tw`text-xs text-red-500`}>{errors[name]}</Text>}
        </View>
    )
}

export default CustomInput
