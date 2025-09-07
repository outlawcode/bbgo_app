import * as constants from '../actions/types';
import createReducer from 'app/lib/createReducer';

const inititalState = {
    options: [],
    fetching: false,
    success: false,
    error: null,
    map: null,
};

export const SettingsReducer = createReducer(inititalState, {
    [constants.GET_SETTINGS](state, action) {
        return {
            ...state,
            fetching: true
        }
    },
    [constants.GET_SETTINGS_SUCCESS](state, action) {
        const {data} = action.payload;
        return {
            ...state,
            fetching: false,
            options: data
        }
    },
    [constants.GET_SETTINGS_FAILED](state, action) {
        const {error} = action.payload;
        return {
            ...state,
            fetching: false,
            error,
        }
    },
    [constants.GET_PRODUCT_CATEGORIES](state, action) {
        return {
            ...state,
            fetching: true
        }
    },
    [constants.GET_PRODUCT_CATEGORIES_SUCCESS](state, action) {
        const {data} = action.payload;
        return {
            ...state,
            fetching: false,
            productCategories: data
        }
    },
    [constants.GET_PRODUCT_CATEGORIES_FAILED](state, action) {
        const {error} = action.payload;
        return {
            ...state,
            fetching: false,
            error,
        }
    },
    [constants.GET_FOOD_CATEGORIES](state, action) {
        return {
            ...state,
            fetching: true
        }
    },
    [constants.GET_FOOD_CATEGORIES_SUCCESS](state, action) {
        const {data} = action.payload;
        return {
            ...state,
            fetching: false,
            foodCategories: data
        }
    },
    [constants.GET_FOOD_CATEGORIES_FAILED](state, action) {
        const {error} = action.payload;
        return {
            ...state,
            fetching: false,
            error,
        }
    },
    [constants.SET_MAP](state, action) {
        const {data} = action.payload;
        console.log('mapdata', data);
        return {
            ...state,
            map: data,
        }
    },
    [constants.GET_MAP](state, action) {
        return {
            ...state,
            map: state.map,
        }
    },
});
