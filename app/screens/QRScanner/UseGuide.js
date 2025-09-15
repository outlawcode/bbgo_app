import React from "react";
import { Text, View } from "react-native";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { WebView } from "react-native-webview";

function UseGuide(props) {

  const uses = [
    {title: 'Điểm danh lớp học.'},
    {title: 'Chấm công doanh nghiệp.'},
    {title: 'Ra vào các khu gửi xe.'},
    {title: 'Xem danh thiếp điện tử.'},
    {title: 'Thanh toán hoá đơn tại các siêu thị đại diện SME Mart.'},
  ]

  return (
    <View>
      <View style={tw`flex flex-row justify-between border-b border-gray-200 py-2 px-3 items-center`}>
        <Text  style={tw`font-medium`}>Hướng dẫn sử dụng</Text>
        <Icon name="close-circle" style={tw`text-red-500`} size={24} onPress={() => props.navigation.navigate(props.backScreen)}/>
      </View>
      <View style={tw`h-full pb-44 bg-white px-3 pt-5`}>
        <View style={tw`mb-2`}>
          <Text>
            Sử dụng chức năng quét mã QR, bạn có thể:
          </Text>
        </View>

        {uses.map((el) => (
          <View style={tw`flex flex-row items-center py-2`}>
            <Icon name={"check-circle"} style={tw`text-green-600 mr-2`} size={22}/>
            <Text style={tw`text-base`}>{el.title}</Text>
          </View>
        ))}

      </View>
    </View>
  );
}

export default UseGuide;
