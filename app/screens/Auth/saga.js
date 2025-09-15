import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "app/services/client";
import apiConfig from "app/config/api-config";
import {all, call, put, takeLatest} from 'redux-saga/effects';
import {
	GetMeFailed,
	GetMeSuccess,
	memberLoginFailed,
	memberLoginSuccess,
	memberLogoutFailed,
	memberLogoutSuccess,
	updateAccountSuccess,
	updateAccountFailed,
	memberRegisterSuccess,
	memberRegisterFailed
} from "app/screens/Auth/action";
import axios from "axios";

async function storeToken(token) {
	try {
		await AsyncStorage.setItem('sme_user_token', token)
	} catch (e) {
		console.log(e);
	}
}

async function removeToken() {
	try {
		await AsyncStorage.removeItem('sme_user_token')
	} catch (e) {
		console.log(e);
	}
}

async function getMe(payload) {
	return await axios.get(
		`${apiConfig.BASE_URL}/auth/customer/me`,
		{headers: {Authorization: `Bearer ${payload}`}}
	)
}

function* getMeData(action) {
	try {
		const response = yield call(getMe, action.payload);
		const {data} = response;
		yield put(GetMeSuccess(data));
	} catch (e) {
		yield put(GetMeFailed(e.response))
	}
}

export const memberLoginCall = payload =>
	axios
		.post(`${apiConfig.BASE_URL}/auth/customer/login`, {
			username: payload.data.username,
			password: payload.data.password,
		})
		.then(response => ({response}))
		.catch(error => ({error}))

function* Login(action) {
	try {
		const {response, error} = yield call(memberLoginCall, action.payload);

		if (response) {
			yield call(storeToken, response.data.accessToken);
			const userData = yield call(getMe, response.data.accessToken);
			yield put(memberLoginSuccess(userData.data.data));
			action.payload.data.navigation.navigate(action.payload.data.backScreen)
		} else {
			yield put(memberLoginFailed(error.response.data));

			// Gọi callback onError nếu được cung cấp
			if (action.payload.data.onError && typeof action.payload.data.onError === 'function') {
				action.payload.data.onError(error.response.data);
			}
		}
	} catch (e) {
		const errorData = { message: e.message || 'Đã xảy ra lỗi khi đăng nhập' };
		yield put(memberLoginFailed(errorData));

		// Gọi callback onError nếu được cung cấp
		if (action.payload.data.onError && typeof action.payload.data.onError === 'function') {
			action.payload.data.onError(errorData);
		}
	}
}

// Register saga - Fixed
export const memberRegisterCall = payload =>
	axios
		.post(`${apiConfig.BASE_URL}/member/register`, payload)
		.then(response => ({response}))
		.catch(error => ({error}))

function* Register(action) {
	try {
		// Tách riêng các callback và navigation ra khỏi data để gửi API
		const { onSuccess, onError, navigation, ...apiData } = action.payload.data;

		const {response, error} = yield call(memberRegisterCall, apiData);

		if (response) {
			// Sử dụng action creator thay vì string literal
			yield put(memberRegisterSuccess(response.data));

			// Gọi callback onSuccess nếu được cung cấp
			if (onSuccess && typeof onSuccess === 'function') {
				onSuccess(response.data);
			}
		} else {
			// Sử dụng action creator thay vì string literal
			yield put(memberRegisterFailed(error.response.data));

			// Gọi callback onError nếu được cung cấp
			if (onError && typeof onError === 'function') {
				onError(error.response.data);
			}
		}
	} catch (e) {
		const errorData = { message: e.message || 'Đã xảy ra lỗi khi đăng ký' };
		yield put(memberRegisterFailed(errorData));

		// Gọi callback onError nếu được cung cấp
		const { onError } = action.payload.data || {};
		if (onError && typeof onError === 'function') {
			onError(errorData);
		}
	}
}

// Forgot Password saga
export const forgotPasswordCall = payload =>
	axios
		.post(`${apiConfig.BASE_URL}/member/forgot`, { email: payload.data.email })
		.then(response => ({response}))
		.catch(error => ({error}))

function* ForgotPassword(action) {
	try {
		const {response, error} = yield call(forgotPasswordCall, action.payload);

		if (response) {
			yield put({ type: 'FORGOT_PASSWORD_SUCCESS', payload: { data: response.data } });

			if (action.payload.data.navigation) {
				action.payload.data.navigation.navigate('ResetPassword', {
					email: action.payload.data.email
				});
			}

			// Gọi callback onSuccess nếu được cung cấp
			if (action.payload.data.onSuccess && typeof action.payload.data.onSuccess === 'function') {
				action.payload.data.onSuccess(response.data);
			}
		} else {
			yield put({ type: 'FORGOT_PASSWORD_FAILED', payload: { error: error.response.data } });

			// Gọi callback onError nếu được cung cấp
			if (action.payload.data.onError && typeof action.payload.data.onError === 'function') {
				action.payload.data.onError(error.response.data);
			}
		}
	} catch (e) {
		const errorData = { message: e.message || 'Đã xảy ra lỗi khi yêu cầu đặt lại mật khẩu' };
		yield put({ type: 'FORGOT_PASSWORD_FAILED', payload: { error: errorData } });

		// Gọi callback onError nếu được cung cấp
		if (action.payload.data.onError && typeof action.payload.data.onError === 'function') {
			action.payload.data.onError(errorData);
		}
	}
}

// Reset Password saga
export const resetPasswordCall = payload =>
	axios
		.post(`${apiConfig.BASE_URL}/member/reset`, {
			email: payload.data.email,
			resetCode: payload.data.resetCode,
			password: payload.data.password,
			passwordAgain: payload.data.passwordAgain
		})
		.then(response => ({response}))
		.catch(error => ({error}))

function* ResetPassword(action) {
	try {
		const {response, error} = yield call(resetPasswordCall, action.payload);

		if (response) {
			yield put({ type: 'RESET_PASSWORD_SUCCESS', payload: { data: response.data } });

			if (action.payload.data.navigation) {
				action.payload.data.navigation.navigate('Login', {
					values: {
						email: action.payload.data.email,
						password: action.payload.data.password
					}
				});
			}

			// Gọi callback onSuccess nếu được cung cấp
			if (action.payload.data.onSuccess && typeof action.payload.data.onSuccess === 'function') {
				action.payload.data.onSuccess(response.data);
			}
		} else {
			yield put({ type: 'RESET_PASSWORD_FAILED', payload: { error: error.response.data } });

			// Gọi callback onError nếu được cung cấp
			if (action.payload.data.onError && typeof action.payload.data.onError === 'function') {
				action.payload.data.onError(error.response.data);
			}
		}
	} catch (e) {
		const errorData = { message: e.message || 'Đã xảy ra lỗi khi đặt lại mật khẩu' };
		yield put({ type: 'RESET_PASSWORD_FAILED', payload: { error: errorData } });

		// Gọi callback onError nếu được cung cấp
		if (action.payload.data.onError && typeof action.payload.data.onError === 'function') {
			action.payload.data.onError(errorData);
		}
	}
}

function* Logout(action) {
	try {
		yield call(removeToken);
		yield put(memberLogoutSuccess({message: 'Đã đăng xuất tài khoản!'}))
		action.payload.navigation.navigate('Home')
	} catch (e) {
		yield put(memberLogoutFailed({message: 'Lỗi'}));

		// Gọi callback onError nếu được cung cấp
		if (action.payload.onError && typeof action.payload.onError === 'function') {
			action.payload.onError({ message: 'Lỗi khi đăng xuất' });
		}
	}
}

// update account
async function updateAccountCall (payload){
	const Token = await AsyncStorage.getItem('sme_user_token');
	return axios.put(
		`${apiConfig.BASE_URL}/user/me`,
		payload.body,
		{headers: {Authorization: `Bearer ${Token}`}}
	).then(response => ({response})).catch(error => ({error}));
}

function* updateAccount(action) {
	try {
		const {response, error} = yield call(updateAccountCall, action.payload);

		if (response) {
			yield put(updateAccountSuccess(response.data));

			// Gọi callback onSuccess nếu được cung cấp
			if (action.payload.onSuccess && typeof action.payload.onSuccess === 'function') {
				action.payload.onSuccess(response.data);
			}
		} else {
			yield put(updateAccountFailed(error.response.data));

			// Gọi callback onError nếu được cung cấp
			if (action.payload.onError && typeof action.payload.onError === 'function') {
				action.payload.onError(error.response.data);
			}
		}
	} catch (e) {
		const errorData = { message: e.message || 'Đã xảy ra lỗi khi cập nhật tài khoản' };
		yield put(updateAccountFailed(errorData));

		// Gọi callback onError nếu được cung cấp
		if (action.payload.onError && typeof action.payload.onError === 'function') {
			action.payload.onError(errorData);
		}
	}
}

export function* AuthSagas() {
	yield all([
		takeLatest('LOGIN', Login),
		takeLatest('REGISTER', Register),
		takeLatest('FORGOT_PASSWORD', ForgotPassword),
		takeLatest('RESET_PASSWORD', ResetPassword),
		takeLatest('GET_ME', getMeData),
		takeLatest('LOGOUT', Logout),
		takeLatest('UPDATE_ACCOUNT', updateAccount),
	])
}
