import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Modal, Platform } from 'react-native';
import { Text } from 'app/components';
;
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from "moment";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";

function DateRangeSelect(props) {
	const { dateRange, onSetRange } = props;
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [pickingStartDate, setPickingStartDate] = useState(true);
	const [tempStartDate, setTempStartDate] = useState(dateRange?.[0] || moment());
	const [tempEndDate, setTempEndDate] = useState(dateRange?.[1] || moment());
	const [pickerKey, setPickerKey] = useState(0); // Key to force re-render DateTimePicker on Android

	// Update temp dates when dateRange prop changes
	useEffect(() => {
		if (dateRange && dateRange[0] && dateRange[1]) {
			setTempStartDate(moment(dateRange[0]));
			setTempEndDate(moment(dateRange[1]));
		}
	}, [dateRange]);

	// Auto-open end date picker on Android after selecting start date
	useEffect(() => {
		if (Platform.OS === 'android' && showDatePicker && !pickingStartDate) {
			// Small delay to ensure the previous picker is closed before opening the new one
			const timer = setTimeout(() => {
				setPickerKey(prev => prev + 1);
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [pickingStartDate, showDatePicker]);

	// Get current selected label - Always show date range format
	const getCurrentLabel = () => {
		if (!dateRange || !dateRange[0] || !dateRange[1]) {
			// Default to current month range
			const start = moment().startOf('month');
			const end = moment().endOf('month');
			return `${start.format('DD/MM/YYYY')} - ${end.format('DD/MM/YYYY')}`;
		}

		const start = moment(dateRange[0]);
		const end = moment(dateRange[1]);
		return `${start.format('DD/MM/YYYY')} - ${end.format('DD/MM/YYYY')}`;
	};

	const handleButtonPress = () => {
		setTempStartDate(dateRange?.[0] || moment().startOf('month'));
		setTempEndDate(dateRange?.[1] || moment().endOf('month'));
		setPickingStartDate(true);
		setShowDatePicker(true);
	};

	const handleDateChange = (event, selectedDate) => {
		if (Platform.OS === 'android') {
			if (event.type === 'set' && selectedDate) {
				const selectedMoment = moment(selectedDate);
				if (pickingStartDate) {
					setTempStartDate(selectedMoment);
					// Set end date to start date + 1 month
					const newEndDate = moment(selectedMoment).add(1, 'month');
					setTempEndDate(newEndDate);
					// Automatically switch to picking end date and force re-render picker
					setPickingStartDate(false);
					// Force DateTimePicker to re-render by changing key
					setPickerKey(prev => prev + 1);
				} else {
					// Validate end date
					if (selectedMoment.isBefore(tempStartDate)) {
						// End date before start date, swap them
						setTempStartDate(selectedMoment);
						setTempEndDate(tempStartDate);
					} else {
						setTempEndDate(selectedMoment);
					}
					// Apply the range
					applyDateRange();
					setShowDatePicker(false);
				}
			} else {
				// User cancelled, close picker
				if (!pickingStartDate) {
					// If cancelling end date selection, close modal
					setShowDatePicker(false);
				} else {
					// If cancelling start date selection, close modal
					setShowDatePicker(false);
				}
			}
		} else {
			// iOS
			if (selectedDate) {
				const selectedMoment = moment(selectedDate);
				if (pickingStartDate) {
					setTempStartDate(selectedMoment);
					// Set end date to start date + 1 month
					const newEndDate = moment(selectedMoment).add(1, 'month');
					setTempEndDate(newEndDate);
					// Automatically switch to picking end date
					setPickingStartDate(false);
				} else {
					if (selectedMoment.isBefore(tempStartDate)) {
						setTempStartDate(selectedMoment);
						setTempEndDate(tempStartDate);
					} else {
						setTempEndDate(selectedMoment);
					}
				}
			}
		}
	};

	const applyDateRange = () => {
		if (tempStartDate && tempEndDate && onSetRange) {
			const start = moment(tempStartDate).startOf('day');
			const end = moment(tempEndDate).endOf('day');
			onSetRange([start, end]);
		}
	};

	const handleStartDatePress = () => {
		setPickingStartDate(true);
	};

	const handleEndDatePress = () => {
		setPickingStartDate(false);
	};

	const handleConfirm = () => {
		applyDateRange();
		setShowDatePicker(false);
	};

	const currentDate = pickingStartDate ? tempStartDate.toDate() : tempEndDate.toDate();

	return (
		<View>
			{/* Date Range Display Button */}
			<TouchableOpacity
				style={tw`border border-gray-100 rounded p-2 flex-row items-center justify-between`}
				onPress={handleButtonPress}
			>
				<Text style={tw`text-gray-700 text-sm`}>
					{getCurrentLabel()}
				</Text>
				<Icon name="calendar-range" size={20} style={tw`text-gray-500`} />
			</TouchableOpacity>

			{/* Simple Date Picker BottomSheet */}
			<Modal
				visible={showDatePicker}
				transparent={true}
				animationType="slide"
				onRequestClose={() => setShowDatePicker(false)}
			>
				<TouchableOpacity
					style={tw`flex-1 bg-black bg-opacity-50`}
					activeOpacity={1}
					onPress={() => setShowDatePicker(false)}
				>
					<View style={tw`flex-1 justify-end`}>
						<View style={tw`bg-white rounded-t-3xl`}>
							{/* Handle bar */}
							<View style={tw`w-12 h-1 bg-gray-300 rounded-full self-center mt-2 mb-4`} />
							
							<View style={tw`px-4 pb-6`}>
								<Text style={tw`text-lg font-semibold mb-4 text-center`}>
									Chọn khoảng thời gian
								</Text>

								{/* Date Selection Buttons */}
								<View style={tw`flex-row justify-between mb-4`}>
									<TouchableOpacity
										style={tw`flex-1 mr-2 bg-gray-50 border-2 ${pickingStartDate ? 'border-blue-500' : 'border-gray-300'} rounded-md p-3`}
										onPress={handleStartDatePress}
									>
										<Text style={tw`text-xs text-gray-500 mb-1`}>Từ ngày</Text>
										<Text style={tw`text-sm font-medium text-gray-900`}>
											{tempStartDate.format('DD/MM/YYYY')}
										</Text>
									</TouchableOpacity>

									<TouchableOpacity
										style={tw`flex-1 ml-2 bg-gray-50 border-2 ${!pickingStartDate ? 'border-blue-500' : 'border-gray-300'} rounded-md p-3`}
										onPress={handleEndDatePress}
									>
										<Text style={tw`text-xs text-gray-500 mb-1`}>Đến ngày</Text>
										<Text style={tw`text-sm font-medium text-gray-900`}>
											{tempEndDate.format('DD/MM/YYYY')}
										</Text>
									</TouchableOpacity>
								</View>

								{/* Date Picker */}
								{Platform.OS === 'android' ? (
									<View key={pickerKey}>
										<DateTimePicker
											value={currentDate}
											mode="date"
											display="default"
											onChange={handleDateChange}
										/>
									</View>
								) : (
									<>
										<DateTimePicker
											value={currentDate}
											mode="date"
											display="spinner"
											onChange={handleDateChange}
											style={tw`bg-white`}
										/>
										<View style={tw`flex-row justify-between mt-4`}>
											<TouchableOpacity
												style={tw`bg-gray-300 px-6 py-2 rounded`}
												onPress={() => setShowDatePicker(false)}
											>
												<Text style={tw`text-gray-700 font-medium`}>Hủy</Text>
											</TouchableOpacity>
											<TouchableOpacity
												style={tw`bg-blue-500 px-6 py-2 rounded`}
												onPress={handleConfirm}
											>
												<Text style={tw`text-white font-medium`}>Xong</Text>
											</TouchableOpacity>
										</View>
									</>
								)}
							</View>
						</View>
					</View>
				</TouchableOpacity>
			</Modal>
		</View>
	);
}

export default DateRangeSelect;
