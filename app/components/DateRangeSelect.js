import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Platform, ScrollView, Alert } from "react-native";
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from "moment";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";

function DateRangeSelect(props) {
	const { dateRange, onSetRange } = props;
	const [showModal, setShowModal] = useState(false);
	const [showStartDatePicker, setShowStartDatePicker] = useState(false);
	const [showEndDatePicker, setShowEndDatePicker] = useState(false);
	const [tempStartDate, setTempStartDate] = useState(dateRange[0] || moment());
	const [tempEndDate, setTempEndDate] = useState(dateRange[1] || moment());
	const [isValidRange, setIsValidRange] = useState(true);

	// Get current selected label
	const getCurrentLabel = () => {
		if (!dateRange || !dateRange[0] || !dateRange[1]) return 'Tháng này';

		const start = moment(dateRange[0]);
		const end = moment(dateRange[1]);

		// Check for exact matches with predefined ranges
		const today = moment();
		const yesterday = moment().subtract(1, 'days');
		const thisWeekStart = moment().startOf('week');
		const thisWeekEnd = moment().endOf('week');
		const lastWeekStart = moment().startOf('week').subtract(7, 'days');
		const lastWeekEnd = moment().endOf('week').subtract(7, 'days');
		const thisMonthStart = moment().startOf('month');
		const thisMonthEnd = moment().endOf('month');
		const lastMonthStart = moment().subtract(1, 'months').startOf('month');
		const lastMonthEnd = moment().subtract(1, 'months').endOf('month');
		const thisYearStart = moment().startOf('year');
		const thisYearEnd = moment().endOf('year');
		const lastYearStart = moment().subtract(1, 'years').startOf('year');
		const lastYearEnd = moment().subtract(1, 'years').endOf('year');

		if (start.isSame(today, 'day') && end.isSame(today, 'day')) return 'Hôm nay';
		if (start.isSame(yesterday, 'day') && end.isSame(yesterday, 'day')) return 'Hôm qua';
		if (start.isSame(thisWeekStart, 'day') && end.isSame(thisWeekEnd, 'day')) return 'Tuần này';
		if (start.isSame(lastWeekStart, 'day') && end.isSame(lastWeekEnd, 'day')) return 'Tuần trước';
		if (start.isSame(thisMonthStart, 'day') && end.isSame(thisMonthEnd, 'day')) return 'Tháng này';
		if (start.isSame(lastMonthStart, 'day') && end.isSame(lastMonthEnd, 'day')) return 'Tháng trước';
		if (start.isSame(thisYearStart, 'day') && end.isSame(thisYearEnd, 'day')) return 'Năm nay';
		if (start.isSame(lastYearStart, 'day') && end.isSame(lastYearEnd, 'day')) return 'Năm trước';

		// Custom range
		return `${start.format('DD/MM/YYYY')} - ${end.format('DD/MM/YYYY')}`;
	};

	const handleQuickSelect = (value) => {
		if (value && onSetRange) {
			onSetRange(value);
			setShowModal(false);
		}
	};

	const handleCustomDateSelect = () => {
		setTempStartDate(dateRange[0] || moment());
		setTempEndDate(dateRange[1] || moment());
		setShowModal(true);
		setShowStartDatePicker(false);
		setShowEndDatePicker(false);
	};

	const handleStartDateChange = (event, selectedDate) => {
		if (selectedDate) {
			const newStartDate = moment(selectedDate);
			setTempStartDate(newStartDate);

			// If new start date is after current end date, update end date to be same as start date
			if (newStartDate.isAfter(tempEndDate)) {
				setTempEndDate(newStartDate);
			}

			// Update validation status
			setIsValidRange(newStartDate.isSameOrBefore(tempEndDate));
		}
	};

	const handleEndDateChange = (event, selectedDate) => {
		if (selectedDate) {
			const newEndDate = moment(selectedDate);

			// If new end date is before current start date, show alert and don't update
			if (newEndDate.isBefore(tempStartDate)) {
				Alert.alert(
					"Ngày không hợp lệ",
					"Ngày kết thúc không thể trước ngày bắt đầu. Vui lòng chọn ngày khác.",
					[{ text: "OK" }]
				);
				setIsValidRange(false);
				return;
			}

			setTempEndDate(newEndDate);
			setIsValidRange(true);
		}
	};

	const applyCustomDateRange = () => {
		if (tempStartDate && tempEndDate && onSetRange) {
			// Ensure start date is not after end date
			const start = moment(tempStartDate).startOf('day');
			const end = moment(tempEndDate).endOf('day');

			if (start.isAfter(end)) {
				// Swap dates if start is after end
				onSetRange([end, start]);
			} else {
				onSetRange([start, end]);
			}
		}
	};

	const items = [
		{ label: 'Hôm qua', value: [moment().subtract(1, 'days'), moment().subtract(1, 'days')] },
		{ label: 'Hôm nay', value: [moment(), moment()] },
		{ label: 'Tuần trước', value: [moment().startOf('week').subtract(7,'days'), moment().endOf('week').subtract(7, 'days')] },
		{ label: 'Tuần này', value: [moment().startOf('week'), moment().endOf('week')] },
		{ label: 'Tháng trước', value: [moment().subtract(1,'months').startOf('month'), moment().subtract(1,'months').endOf('month')] },
		{ label: 'Tháng này', value: [moment().startOf('month'), moment().endOf('month')]},
		{ label: 'Năm trước', value: [moment().subtract(1,'years').startOf('year'), moment().subtract(1,'years').endOf('year')]},
		{ label: 'Năm nay', value: [moment().startOf('year'), moment().endOf('year')]},
		{ label: 'Chọn ngày cụ thể...', value: 'custom' },
	];

	return (
		<View>
			{/* Date Range Display Button */}
			<TouchableOpacity
				style={tw`border border-gray-100 rounded p-2 flex-row items-center justify-between`}
				onPress={handleCustomDateSelect}
			>
				<Text style={tw`text-gray-700 text-sm`}>
					{getCurrentLabel()}
				</Text>
				<Icon name="calendar-range" size={20} style={tw`text-gray-500`} />
			</TouchableOpacity>

			{/* Date Range Selection Modal */}
			<Modal
				visible={showModal}
				transparent={true}
				animationType="slide"
			>
				<View style={tw`flex-1 bg-black bg-opacity-50 justify-center items-center`}>
					<View style={tw`bg-white rounded-lg p-4 m-4 w-11/12 max-h-[500px]`}>
						<Text style={tw`text-lg font-semibold mb-4 text-center`}>
							Chọn khoảng thời gian
						</Text>

						<ScrollView showsVerticalScrollIndicator={false}>
							{/* Quick Select Options */}
							<View style={tw`mb-4`}>
								<Text style={tw`text-sm font-medium text-gray-600 mb-2`}>Chọn nhanh:</Text>
								<View style={tw`flex-row flex-wrap`}>
									{items.slice(0, -1).map((item, index) => (
										<TouchableOpacity
											key={index}
											style={tw`bg-gray-100 px-3 py-2 rounded-md mr-2 mb-2`}
											onPress={() => handleQuickSelect(item.value)}
										>
											<Text style={tw`text-sm text-gray-700`}>{item.label}</Text>
										</TouchableOpacity>
									))}
								</View>
							</View>

							<View style={tw`border-t border-gray-200 my-3`} />

							{/* Custom Date Range Selection */}
							<View style={tw`mb-4`}>
								<Text style={tw`text-sm font-medium text-gray-600 mb-3`}>Chọn ngày cụ thể:</Text>

								{/* Date Range Row */}
								<View style={tw`flex-row justify-between`}>
									{/* Start Date */}
									<View style={tw`flex-1 mr-2`}>
										<Text style={tw`text-xs text-gray-500 mb-1`}>Từ ngày:</Text>
										<DateTimePicker
											value={tempStartDate.toDate()}
											mode="date"
											display="default"
											onChange={handleStartDateChange}
											style={tw`w-full`}
										/>
									</View>

									{/* End Date */}
									<View style={tw`flex-1 ml-2`}>
										<Text style={tw`text-xs text-gray-500 mb-1`}>Đến ngày:</Text>
										<DateTimePicker
											value={tempEndDate.toDate()}
											mode="date"
											display="default"
											onChange={handleEndDateChange}
											style={tw`w-full`}
										/>
									</View>
								</View>

								{/* Validation Message */}
								{!isValidRange && (
									<View style={tw`mt-2 p-2 bg-red-50 border border-red-200 rounded`}>
										<Text style={tw`text-xs text-red-600 text-center`}>
											Ngày kết thúc không thể trước ngày bắt đầu
										</Text>
									</View>
								)}
							</View>
						</ScrollView>

						{/* Action Buttons - Fixed at bottom */}
						<View style={tw`flex-row justify-between mt-4 pt-3 border-t border-gray-200`}>
							<TouchableOpacity
								style={tw`bg-gray-300 px-4 py-2 rounded`}
								onPress={() => {
									setShowModal(false);
									setShowStartDatePicker(false);
									setShowEndDatePicker(false);
								}}
							>
								<Text style={tw`text-gray-700`}>Hủy</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={tw`px-4 py-2 rounded ${isValidRange ? 'bg-blue-500' : 'bg-gray-300'}`}
								onPress={() => {
									if (isValidRange) {
										applyCustomDateRange();
										setShowModal(false);
										setShowStartDatePicker(false);
										setShowEndDatePicker(false);
									}
								}}
								disabled={!isValidRange}
							>
								<Text style={tw`${isValidRange ? 'text-white' : 'text-gray-500'}`}>Áp dụng</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
}

export default DateRangeSelect;
