import React from 'react'
import {Text, TextInput, StyleSheet, View} from 'react-native';
import tw from 'twrnc';

const CustomInput = React.forwardRef((props, ref) => {
    const {
        field,
        form,
        label,
        textarea,
        ...inputProps
    } = props

    // Xử lý trường hợp field có thể undefined
    const name = field?.name || '';
    const onBlur = field?.onBlur || (() => {});
    const onChange = field?.onChange || (() => {});
    const value = field?.value || '';

    const errors = form?.errors || {};
    const touched = form?.touched || {};
    const setFieldTouched = form?.setFieldTouched || (() => {});

    const hasError = errors[name] && touched[name]

    return (
        <View style={tw`mb-5`}>
            {label && <Text  style={tw`mb-1 font-medium text-gray-600`}>{label} {props.required && <Text style={tw`text-red-600`}>*</Text>}</Text>}
            <TextInput
                ref={ref}
                value={value}
                onChangeText={(text) => {
                    if (onChange && name) {
                        onChange(name)(text);
                    }
                }}
                onBlur={() => {
                    if (setFieldTouched && name) {
                        setFieldTouched(name);
                    }
                    if (onBlur && name) {
                        onBlur(name);
                    }
                }}
                keyboardType={props.number && 'numeric'}
                multiline={textarea}
                textAlignVertical={textarea ? 'top' : 'center'}
                style={tw`${textarea ? 'h-22' : 'h-12' } text-gray-800 rounded border ${hasError ? 'border-red-500' : 'border-gray-300'} px-2 -pt-2 pb-2 bg-white text-base`}
                {...inputProps}
            />
            {hasError && <Text  style={tw`text-xs text-red-500`}>{errors[name]}</Text>}
        </View>
    )
})

export default CustomInput
