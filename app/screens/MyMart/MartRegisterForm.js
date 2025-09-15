import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import tw from "twrnc";
import { Field, Formik } from "formik";
import CustomInput from "app/components/CustomInput.js";
import * as Yup from "yup";

function MartRegisterForm(props) {
  const Schema = Yup.object().shape({
    name: Yup
      .string()
      .required('Vui lòng nhập thông tin'),
  })

  function handleRegister(values) {
    props.onSubmit({
      ...values
    })
  }

  return (
    <View>
      <Formik
        enableReinitialize
        initialValues={{
          name: ''
        }}
        onSubmit={values => handleRegister(values)}
        validationSchema={Schema}
      >
        {({handleSubmit, values, setFieldValue, isValid}) => (
          <>
            <KeyboardAwareScrollView keyboardShouldPersistTaps={"always"}>
              <View style={tw`pb-20`}>
                <View style={tw`bg-white p-3 m-3 shadow-lg rounded`}>
                  <View style={tw`mb-2 mt-2`}>
                    <View>
                      <Field
                        component={CustomInput}
                        required
                        name="name"
                        label="Tên siêu thị"
                        autoFocus
                      />
                      <Field
                        component={CustomInput}
                        required
                        name="address"
                        label="Địa chỉ"
                      />
                      <Field
                        component={CustomInput}
                        required
                        name="phone"
                        label="Số điện thoại"
                        autoCapitalize = 'none'
                      />
                    </View>
                    <TouchableOpacity
                      style={tw`bg-green-600 p-3 mt-2 rounded w-full flex items-center justify-between`}
                      onPress={handleSubmit}
                    >
                      <Text style={tw`text-white font-medium text-base`}>Đăng ký mở siêu thị</Text>
                    </TouchableOpacity>
                    <View style={tw`mt-3`}>
                      <Text style={tw`italic`}>* Điều kiện đăng ký: Có gian hàng trực tuyến đang hoạt động.</Text>
                    </View>
                  </View>
                </View>
              </View>

            </KeyboardAwareScrollView>
          </>
        )}
      </Formik>
    </View>
  );
}

export default MartRegisterForm;
