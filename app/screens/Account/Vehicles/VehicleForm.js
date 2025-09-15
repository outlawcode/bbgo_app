import React, { useState } from "react";
import * as Yup from "yup";
import { Text, TouchableOpacity, View } from "react-native";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Field, Formik } from "formik";
import CustomInput from "app/components/CustomInput";

function VehicleForm(props) {
  const [vehicleType, setVehicleType] = useState(props.initialValues && props.initialValues.vehicleType ? props.initialValues.vehicleType : 'Ô tô');
  const FormSchema = Yup.object().shape({
    licensePlate: Yup.string().required("Vui lòng nhập thông tin")
  });

  function handleSubmit(values) {
    if (props.formType === 'add') {
      props.onSubmit({
        ...values,
        vehicleType,
        id: Math.random()
      })
      props.navigation.navigate(props.backScreen)
    } else {
      props.onSubmit({
        ...values,
        vehicleType,
        id: props.initialValues.id
      })
      props.navigation.navigate(props.backScreen)
    }
  }

  const vehiclesTypes = ["Ô tô", "Xe máy"];

  return (
    <View>
      <View style={tw`bg-white ios:pt-14 android:pt-4 pb-4 flex-row items-center`}>
        <TouchableOpacity
          onPress={() => props.navigation.navigate(props.backScreen)}
          style={tw`mr-3 ml-3`}
        >
          <Icon name="close" size={26}/>
        </TouchableOpacity>
        <Text style={tw`font-medium uppercase`}>{props.formType === 'add' ? 'Thêm phương tiện' : 'Sửa phương tiện'}</Text>
      </View>
      <Formik
        initialValues={props.initialValues}
        onSubmit={values => handleSubmit(values)}
        validationSchema={FormSchema}
      >
        {({handleSubmit, values, setFieldValue, isValid}) => (
          <KeyboardAwareScrollView
            keyboardShouldPersistTaps={"handled"}
          >
            <View style={tw`pb-32`}>
              <View style={tw`px-3 py-5 my-3 bg-white`}>
                <View style={tw`mb-5`}>
                  <Text style={tw`mb-5 font-medium text-gray-500`}>
                    Chọn loại phương tiện
                  </Text>
                  <View style={tw`flex items-center flex-row`}>
                    {vehiclesTypes.map(el => (
                      <View style={tw`mr-3 relative`}>
                        <TouchableOpacity
                          onPress={() => setVehicleType(el)}
                          style={tw`px-3 py-2 rounded-md ${
                            el === vehicleType
                              ? 'bg-red-500'
                              : 'bg-gray-200'
                          }`}
                        >
                          <Text
                            style={tw`${
                              el === vehicleType
                                ? 'text-white'
                                : 'text-gray-700'
                            }`}
                          >
                            {el}
                          </Text>
                        </TouchableOpacity>
                        {el === vehicleType && (
                          <Icon
                            name={'check-circle'}
                            size={20}
                            style={tw`absolute -top-1 -right-1 text-red-200`}
                          />
                        )}
                      </View>
                    ))}
                  </View>
                </View>

                <Field
                  component={CustomInput}
                  required
                  name="licensePlate"
                  label="Biển số xe"
                />

                <TouchableOpacity
                  style={tw`bg-green-600 px-5 py-4 mt-3 rounded w-full flex items-center justify-between`}
                  onPress={handleSubmit}
                >
                  <Text style={tw`text-white font-bold uppercase`}>
                    Xác nhận
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAwareScrollView>
        )}
      </Formik>
    </View>
  );
}

export default VehicleForm;
