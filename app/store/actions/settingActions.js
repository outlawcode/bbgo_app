import * as types from './types';

export const GetSettings = () => ({
    type: types.GET_SETTINGS,
});

export const GetSettingsSuccess = data => ({
    type: types.GET_SETTINGS_SUCCESS,
    payload: {
        data
    }
});

export const GetSettingsFailed = error => ({
    type: types.GET_SETTINGS_FAILED,
    payload: {
        error
    }
});

export const GetProductCategories = () => ({
    type: types.GET_PRODUCT_CATEGORIES,
});

export const GetProductCategoriesSuccess = data => ({
    type: types.GET_PRODUCT_CATEGORIES_SUCCESS,
    payload: {
        data
    }
});

export const GetProductCategoriesFailed = error => ({
    type: types.GET_PRODUCT_CATEGORIES_FAILED,
    payload: {
        error
    }
});


export const GetFoodCategories = () => ({
    type: types.GET_FOOD_CATEGORIES,
});

export const GetFoodCategoriesSuccess = data => ({
    type: types.GET_FOOD_CATEGORIES_SUCCESS,
    payload: {
        data
    }
});

export const GetFoodCategoriesFailed = error => ({
    type: types.GET_FOOD_CATEGORIES_FAILED,
    payload: {
        error
    }
});

export const SetMap = data => ({
    type: types.SET_MAP,
    payload: {
        data
    }
});
