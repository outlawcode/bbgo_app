import React from "react";
import { Text, View } from "react-native";
import tw from "twrnc";
import { formatNumber, formatVND } from "app/utils/helper.js";

function ProductStockItem(props) {
  const {item} = props;
  console.log(item);
  return (
    <View style={tw`p-3 border-b border-gray-100`}>
      <Text style={tw`mb-1 text-gray-500`}>Mã Sản phẩm: <Text style={tw`font-medium text-green-600`}>{item.SKU}</Text></Text>
      <Text style={tw`mb-1 text-gray-500`}>Tên: <Text style={tw`font-medium text-gray-800`}>{item.name}</Text></Text>
      <Text style={tw`mb-1 text-gray-500`}>Đơn giá: <Text style={tw`font-medium text-green-600`}>{formatVND(item.price)}</Text></Text>
      <Text style={tw`mb-1 text-gray-500`}>Tổng nhập: <Text style={tw`font-medium text-green-600`}>{formatNumber(item.inQty)}</Text></Text>
      <Text style={tw`mb-1 text-gray-500`}>Đã bán: <Text style={tw`text-gray-700`}>{formatNumber(item.outQty)}</Text></Text>
      <Text style={tw`mb-1 text-gray-500`}>Tồn kho: <Text style={tw`font-medium text-red-500`}>{formatNumber(Number(item.inQty) - Number(item.outQty))}</Text></Text>
    </View>
  );
}

export default ProductStockItem;
