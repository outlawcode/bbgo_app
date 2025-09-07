import * as constant from './constant';
import createReducer from '../../lib/createReducer';
import {showMessage} from 'react-native-flash-message';

const initialState = {
	user: null,
	fetching: false,
	forgotPasswordSuccess: false,
	resetPasswordSuccess: false
}

export const memberAuth = createReducer(initialState, {
	[constant.LOGIN] (state) {
		return {
			...state,
			fetching: true
		}
	},
	[constant.LOGIN_SUCCESS] (state, action) {
		showMessage({
			message: 'Đăng nhập tài khoản thành công',
			type: 'success',
			icon: 'success',
			duration: 3000,
		});
		return {
			...state,
			user: action.payload,
			fetching: false
		}
	},
	[constant.LOGIN_FAILED] (state, action) {
		const {error} = action.payload;
		showMessage({
			message: error.message,
			type: 'danger',
			icon: 'danger',
			duration: 3000,
		});
		return {
			...state,
			fetching: false,
			error,
		}
	},
	[constant.REGISTER] (state) {
		return {
			...state,
			fetching: true
		}
	},
	[constant.REGISTER_SUCCESS] (state) {
		showMessage({
			message: 'Tạo tài khoản thành công',
			type: 'success',
			icon: 'success',
			duration: 3000,
		});
		return {
			...state,
			fetching: false
		}
	},
	[constant.REGISTER_FAILED] (state, action) {
		const {error} = action.payload;
		showMessage({
			message: error.message,
			type: 'danger',
			icon: 'danger',
			duration: 3000,
		});
		return {
			...state,
			fetching: false,
			error,
		}
	},

	[constant.UPDATE_ACCOUNT] (state, action) {
		return {
			...state,
		}
	},
	[constant.UPDATE_ACCOUNT_SUCCESS] (state, action) {
		const {data} = action.payload;
		showMessage({
			message: 'Cập nhật thông tin thành công!',
			type: 'success',
			icon: 'success',
			duration: 3000,
		});
		return {
			...state,
			user: data,
		}
	},
	[constant.UPDATE_ACCOUNT_FAILED] (state, action) {
		const {error} = action.payload;
		showMessage({
			message: error.message,
			type: 'danger',
			icon: 'danger',
			duration: 3000,
		});
		return {
			...state,
			error,
		}
	},
	[constant.GET_ME] (state, action) {
		return {
			...state,
			fetching: true,
		}
	},
	[constant.GET_ME_SUCCESS] (state, action) {
		const {data} = action.payload
		return {
			...state,
			user: data,
			success: true,
			fetching: false,
		}
	},
	[constant.GET_ME_FAILED] (state, action) {
		const {error} = action.payload
		return {
			...state,
			error,
			success: false,
			fetching: false,
		}
	},
	[constant.LOGOUT] (state, action) {
		return {
			...state,
		}
	},
	[constant.LOGOUT_SUCCESS] (state, action) {
		showMessage({
			message: 'Đã thoát tài khoản',
			type: 'success',
			icon: 'success',
			duration: 3000,
		});
		return {
			...state,
			user: null,
		}
	},
	[constant.USER_DATA] (state, action) {
		return {
			...state,
			user: action.user,
		}
	},

	// Thêm mới cho quên mật khẩu
	[constant.FORGOT_PASSWORD] (state) {
		return {
			...state,
			fetching: true,
			forgotPasswordSuccess: false
		}
	},
	[constant.FORGOT_PASSWORD_SUCCESS] (state, action) {
		const {data} = action.payload;
		showMessage({
			message: data.message || 'Yêu cầu đặt lại mật khẩu thành công, vui lòng kiểm tra email',
			type: 'success',
			icon: 'success',
			duration: 3000,
		});
		return {
			...state,
			fetching: false,
			forgotPasswordSuccess: true
		}
	},
	[constant.FORGOT_PASSWORD_FAILED] (state, action) {
		const {error} = action.payload;
		showMessage({
			message: error.message,
			type: 'danger',
			icon: 'danger',
			duration: 3000,
		});
		return {
			...state,
			fetching: false,
			error,
			forgotPasswordSuccess: false
		}
	},

	// Thêm mới cho đặt lại mật khẩu
	[constant.RESET_PASSWORD] (state) {
		return {
			...state,
			fetching: true,
			resetPasswordSuccess: false
		}
	},
	[constant.RESET_PASSWORD_SUCCESS] (state, action) {
		const {data} = action.payload;
		showMessage({
			message: data.message || 'Đặt lại mật khẩu thành công',
			type: 'success',
			icon: 'success',
			duration: 3000,
		});
		return {
			...state,
			fetching: false,
			resetPasswordSuccess: true
		}
	},
	[constant.RESET_PASSWORD_FAILED] (state, action) {
		const {error} = action.payload;
		showMessage({
			message: error.message,
			type: 'danger',
			icon: 'danger',
			duration: 3000,
		});
		return {
			...state,
			fetching: false,
			error,
			resetPasswordSuccess: false
		}
	},
})
