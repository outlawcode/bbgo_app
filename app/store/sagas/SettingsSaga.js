import axios from 'axios';
import {all, call, put, takeLatest} from 'redux-saga/effects';
import {
    GetFoodCategoriesFailed,
    GetFoodCategoriesSuccess,
    GetProductCategoriesFailed,
    GetProductCategoriesSuccess,
    GetSettingsFailed,
    GetSettingsSuccess,
} from "../actions/settingActions";
import { apiClient } from "app/services/client";

async function fetchSettingsCall() {
    return apiClient.get('/setting')
}

function* FetchSettings(action) {
    try {
        const response = yield call(fetchSettingsCall, action.payload);
        const {data} = response;
        yield put(GetSettingsSuccess(data));
    } catch (e) {
        yield put(GetSettingsFailed(e));
    }
}
async function fetchingProductCategoriesCall() {
    return apiClient.get('/product-category',)
}

function* FetchProductCategories(action) {
    try {
        const response = yield call(fetchingProductCategoriesCall, action.payload);
        const {data} = response;
        yield put(GetProductCategoriesSuccess(data));
    } catch (e) {
        yield put(GetProductCategoriesFailed(e));
    }
}
async function fetchingFoodCategoriesCall() {
    return apiClient.get('/product-category',
        {
            params: {
                type: 'service'
            }
        })
}

function* FetchFoodCategories(action) {
    try {
        const response = yield call(fetchingFoodCategoriesCall, action.payload);
        const {data} = response;
        yield put(GetFoodCategoriesSuccess(data));
    } catch (e) {
        yield put(GetFoodCategoriesFailed(e));
    }
}



export function* settingsSagas() {
    yield all([
        takeLatest('GET_SETTINGS', FetchSettings),
        takeLatest('GET_PRODUCT_CATEGORIES', FetchProductCategories),
        takeLatest('GET_FOOD_CATEGORIES', FetchFoodCategories),
    ])
}
