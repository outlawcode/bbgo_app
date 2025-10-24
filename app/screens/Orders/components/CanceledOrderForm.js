import React, { useEffect, useRef, useState } from "react";
import tw from "twrnc";
import { Text, TouchableOpacity, View, TextInput } from "react-native";

function CanceledOrderForm(props) {
	const inputRef = useRef(null);
	const [reason, setReason] = useState('');

	useEffect(() => {
		// Auto focus vào input sau khi modal mở
		const timer = setTimeout(() => {
			if (inputRef.current) {
				inputRef.current.focus();
			}
		}, 500);
		return () => clearTimeout(timer);
	}, []);

	function handleSubmit() {
		if (!reason.trim()) {
			alert('Vui lòng nhập lý do huỷ đơn');
			return;
		}
		props.onCancel({ reason: reason.trim() });
	}

	return (
		<View>
			<View style={tw`mb-4`}>
				<Text style={tw`text-sm text-gray-600 mb-2`}>Vui lòng nhập lý do của bạn</Text>
				<TextInput
					ref={inputRef}
					value={reason}
					onChangeText={setReason}
					multiline
					textAlignVertical="top"
					style={tw`h-20 text-gray-800 rounded border border-gray-300 px-3 pt-3 pb-3 bg-white text-base`}
					placeholder="Nhập lý do huỷ đơn hàng..."
				/>
			</View>

			<TouchableOpacity
				onPress={handleSubmit}
				style={tw`bg-red-500 px-4 py-3 rounded`}
			>
				<Text style={tw`text-white text-center font-bold text-base`}>
					Xác nhận huỷ đơn
				</Text>
			</TouchableOpacity>
		</View>
	);
}

export default CanceledOrderForm;
