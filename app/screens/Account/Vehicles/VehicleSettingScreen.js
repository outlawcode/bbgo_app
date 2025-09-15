import React, { useEffect, useState } from "react";
import { Keyboard, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";
import { useDispatch, useSelector } from "react-redux";
import { updateAccount } from "app/screens/Auth/action.js";
import VehicleForm from "app/screens/Account/Vehicles/VehicleForm.js";

function VehicleSettingScreen(props) {
	const dispatch = useDispatch()
	const currentUser = useSelector(state => state.memberAuth.user);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		props.navigation.setOptions({
			title: 'Cài đặt phương tiện',
			headerStyle: {
				backgroundColor: '#fff',
			},
			headerTintColor: '#000',
			headerLeft: () => (
				<TouchableOpacity
					activeOpacity={1}
					onPress={() => props.navigation.goBack()}>
					<Icon name="chevron-left"
					      size={26}
					      style={tw`ml-3`}
					/>
				</TouchableOpacity>
			),
			headerRight: () => (
				<TouchableOpacity
					activeOpacity={1}
					onPress={() => props.navigation.navigate('Modal', {
						content: <VehicleForm
							initialValues={{}}
							formType={"add"}
							navigation={props.navigation}
							backScreen={'VehicleSetting'}
							onSubmit={handleAdd}
						/>
					})}
				>
					<Icon name="plus"
					      size={26}
					      style={tw`mr-3`}
					/>
				</TouchableOpacity>
			),
		})
	}, [])

	let vehicles = []
	if (currentUser && currentUser.vehicles) {
		vehicles = JSON.parse(currentUser.vehicles)
	}
	const [newVehicles, setNewVehicles] = useState(vehicles);

	useEffect(() => {
		setNewVehicles(vehicles)
	}, [currentUser]);



	function handleAdd(data) {
		const newList = [...newVehicles, data]
		setNewVehicles(newList)
	}

	function handleEdit(data) {
		const index = newVehicles.findIndex(item => item.id === data.id);
		if (index !== -1) {
			const newList = [
				...newVehicles.slice(0, index),
				data,
				...newVehicles.slice(index + 1)
			];
			setNewVehicles(newList)
		}
	}

	function handleDelete(id) {
		const newList = newVehicles.filter(item => item.id !== id)
		setNewVehicles(newList)
	}

	function handleUpdate(values) {
		Keyboard.dismiss();
		dispatch(updateAccount( {
			vehicles: JSON.stringify(newVehicles),
		}))
	}

	console.log(newVehicles);

	return (
		<View style={tw`flex bg-gray-100 min-h-full content-between`}>
			<StatusBar barStyle={"dark-content"}/>
			<ScrollView
				showsVerticalScrollIndicator={false}
				scrollEnabled={true}
			>
				<View style={tw`pb-32`}>
					<View style={tw`my-3`}>
						{newVehicles.length === 0 ?
							<View style={tw`flex items-center`}>
								<Icon name={"car-off"} size={32 } style={tw`mb-5 text-gray-500`} />
								<Text>Chưa có phương tiện, vui lòng thêm mới</Text>
							</View>
							:
							<View>
								{newVehicles && newVehicles.map((el) => (
									<View style={tw`mb-2 bg-white shadow flex items-center flex-row justify-between p-2`}>
										<View style={tw`flex items-center flex-row`}>
											<Icon name={el.vehicleType === 'Ô tô' ? 'car' : 'motorbike'} size={32} style={tw`mr-3 text-gray-400`} />
											<View>
												<Text style={tw`text-gray-500 text-xs`}>{el.vehicleType}</Text>
												<Text style={tw`font-medium text-base text-red-500`}>{el.licensePlate}</Text>
											</View>
										</View>
										<View style={tw`flex items-center flex-row`}>
											<TouchableOpacity
												onPress={() => props.navigation.navigate('Modal', {
													content: <VehicleForm
														initialValues={el}
														formType={"edit"}
														navigation={props.navigation}
														backScreen={'VehicleSetting'}
														onSubmit={handleEdit}
													/>
												})}
												style={tw`p-2 bg-green-600 rounded mr-3`}
											>
												<Text style={tw`text-white`}>Sửa</Text>
											</TouchableOpacity>
											<TouchableOpacity
												onPress={() => handleDelete(el.id)}
												style={tw`p-2 bg-red-500 rounded`}
											>
												<Text style={tw`text-white`}>Xoá</Text>
											</TouchableOpacity>
										</View>
									</View>
								))}
							</View>
						}
					</View>
				</View>
			</ScrollView>

			<View style={tw`absolute bottom-0 android:bottom-14 bg-white w-full pb-5 pt-1 shadow-lg px-3`}>
				<TouchableOpacity
					style={tw`bg-green-600 px-5 py-4 mt-3 rounded w-full flex items-center justify-between`}
					onPress={handleUpdate}
				>
					<Text  style={tw`text-white font-bold uppercase`}>Lưu lại</Text>
				</TouchableOpacity>
			</View>

		</View>
	);
}

export default VehicleSettingScreen;
