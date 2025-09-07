import React from "react";
import { View } from "react-native";
import RNPickerSelect from 'react-native-picker-select';
import moment from "moment";

function DateRangeSelect(props) {
	/*ranges={{
		'Hôm qua': [moment().subtract(1, 'days'), moment()],
			'Hôm nay': [moment(), moment().add(1, 'days')],
			'Tuần trước': [moment().startOf('week').subtract(7,'days'), moment().endOf('week').subtract(7, 'days')],
			'Tuần này': [moment().startOf('week'), moment().endOf('week')],
			'Tháng trước': [moment().subtract(1,'months').startOf('month'), moment().subtract(1,'months').endOf('month')],
			'Tháng này': [moment().startOf('month'), moment().endOf('month')],
			'Năm trước': [moment().subtract(1,'years').startOf('year'), moment().subtract(1,'years').endOf('year')],
			'Năm nay': [moment().startOf('year'), moment().endOf('year')],
	}}*/
	return (
		<View>
			<RNPickerSelect
				onValueChange={(value) => console.log(value)}
				items={[
					{ label: 'Hôm qua', value: [moment().subtract(1, 'days'), moment()] },
					{ label: 'Hôm nay', value: [moment(), moment().add(1, 'days')] },
					{ label: 'Tuần trước', value: [moment().startOf('week').subtract(7,'days'), moment().endOf('week').subtract(7, 'days')] },
					{ label: 'Tuần này', value: [moment().startOf('week'), moment().endOf('week')] },
					{ label: 'Tháng trước', value: [moment().subtract(1,'months').startOf('month'), moment().subtract(1,'months').endOf('month')] },
					{ label: 'Tháng này', value: [moment().startOf('month'), moment().endOf('month')]},
					{ label: 'Năm trước', value: [moment().subtract(1,'years').startOf('year'), moment().subtract(1,'years').endOf('year')]},
					{ label: 'Năm nay', value: [moment().startOf('year'), moment().endOf('year')]},
					{ label: 'Tất cả', value: [moment().startOf('year'), moment().endOf('year')]},
				]}
			/>
		</View>
	);
}

export default DateRangeSelect;
