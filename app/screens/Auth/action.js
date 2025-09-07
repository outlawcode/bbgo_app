import * as constants from './constant';

export const memberLogin = (data) => ({
	type: constants.LOGIN,
	payload: {
		data
	}
})

export const memberLoginSuccess = (data) => ({
	type: constants.LOGIN_SUCCESS,
	payload: {
		data
	}
})

export const memberLoginFailed = (error) => ({
	type: constants.LOGIN_FAILED,
	payload: {
		error,
	},
});

export const memberRegister = (data) => ({
	type: constants.REGISTER,
	payload: {
		data,
	},
});

export const memberRegisterSuccess = data => ({
	type: constants.REGISTER_SUCCESS,
	payload: {
		data,
	},
});

export const memberRegisterFailed = error => ({
	type: constants.REGISTER_FAILED,
	payload: {
		error,
	},
});

export const memberLogout = (navigation, onError) => ({
	type: constants.LOGOUT,
	payload: {
		navigation,
		onError
	}
});

export const memberLogoutSuccess = data => ({
	type: constants.LOGOUT_SUCCESS,
	payload: {
		data
	},
});

export const memberLogoutFailed = error => ({
	type: constants.LOGOUT_FAILED,
	payload: {
		error
	},
});


export const GetMe = (token) => ({
	type: constants.GET_ME,
	payload: {
		token
	},
});

export const GetMeSuccess = data => ({
	type: constants.GET_ME_SUCCESS,
	payload: {
		data
	},
});

export const GetMeFailed = error => ({
	type: constants.GET_ME_FAILED,
	payload: {
		error
	},
});

export const LoadDataAction = user => ({
	type: constants.USER_DATA,
	user,
});

export const updateAccount = (body, onSuccess, onError) => ({
	type: constants.UPDATE_ACCOUNT,
	payload: {
		body,
		onSuccess,
		onError
	},
});

export const updateAccountSuccess = data => ({
	type: constants.UPDATE_ACCOUNT_SUCCESS,
	payload: {
		data,
	},
});

export const updateAccountFailed = error => ({
	type: constants.UPDATE_ACCOUNT_FAILED,
	payload: {
		error,
	},
});

// Thêm mới cho quên mật khẩu
export const forgotPassword = (data) => ({
	type: constants.FORGOT_PASSWORD,
	payload: {
		data
	},
});

export const forgotPasswordSuccess = data => ({
	type: constants.FORGOT_PASSWORD_SUCCESS,
	payload: {
		data,
	},
});

export const forgotPasswordFailed = error => ({
	type: constants.FORGOT_PASSWORD_FAILED,
	payload: {
		error,
	},
});

// Thêm mới cho đặt lại mật khẩu
export const resetPassword = (data) => ({
	type: constants.RESET_PASSWORD,
	payload: {
		data
	},
});

export const resetPasswordSuccess = data => ({
	type: constants.RESET_PASSWORD_SUCCESS,
	payload: {
		data,
	},
});

export const resetPasswordFailed = error => ({
	type: constants.RESET_PASSWORD_FAILED,
	payload: {
		error,
	},
});
