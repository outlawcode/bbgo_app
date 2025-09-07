import React from "react";
import tw from "twrnc";
import { Field, Formik } from "formik";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CustomInput from "app/components/CustomInput";
import { Text, TouchableOpacity } from "react-native";

function CanceledOrderForm(props) {
	function handleSubmit(values) {
		props.onCancel(values)
	}
	return (
		<Formik
			initialValues={{}}
			onSubmit={values => handleSubmit(values)}
		>
			{({ handleSubmit, isValid }) => (
				<KeyboardAwareScrollView
					showsVerticalScrollIndicator={false}
					scrollEnabled={true}
					style={tw`mx-3`}
				>
					<Field
						component={CustomInput}
						name="reason"
						label="Vui lòng nhập lý do của bạn"
						textarea
					/>
					<TouchableOpacity
						onPress={handleSubmit}
						style={tw`${!isValid ? 'bg-gray-300' : 'bg-red-500'} px-4 py-3 rounded`}
						disabled={!isValid}
					>
						<Text  style={tw`text-white text-center font-medium uppercase`}>Xác nhận huỷ đơn</Text>
					</TouchableOpacity>
				</KeyboardAwareScrollView>
			)}
		</Formik>
	);
}

export default CanceledOrderForm;