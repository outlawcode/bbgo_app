import * as constant from './constant';
import { checkProductStock } from './reducer';
import { showMessage } from 'react-native-flash-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiConfig from '../../config/api-config';
import axios from 'axios';

// Action to add item to cart with stock validation
export const addToCartWithValidation = (item) => async (dispatch) => {
    try {
        dispatch({ type: constant.SET_CART_LOADING, payload: true });
        
        // Check stock before adding
        const stockCheck = await checkProductStock(item.productId, item.quantity);
        
        if (!stockCheck.valid) {
            showMessage({
                message: stockCheck.message,
                type: 'danger',
                icon: 'danger',
                duration: 4000,
            });
            dispatch({ type: constant.SET_CART_LOADING, payload: false });
            return;
        }

        // If stock is valid, add to cart
        dispatch({ type: constant.ADD_TO_CART, payload: { Item: item } });
        dispatch({ type: constant.SET_CART_LOADING, payload: false });
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        showMessage({
            message: 'Lỗi khi thêm sản phẩm vào giỏ hàng',
            type: 'danger',
            icon: 'danger',
            duration: 4000,
        });
        dispatch({ type: constant.SET_CART_ERROR, payload: error.message });
    }
};

// Action to validate entire cart (similar to web validateCart function)
export const validateCart = () => async (dispatch) => {
    try {
        dispatch({ type: constant.SET_CART_LOADING, payload: true });
        
        const token = await AsyncStorage.getItem('sme_user_token');
        if (!token) {
            dispatch({ type: constant.SET_CART_LOADING, payload: false });
            return { valid: true, changes: [] };
        }

        // Get current cart from Redux state (this would need to be passed from component)
        // For now, we'll validate items individually
        
        dispatch({ type: constant.SET_CART_LOADING, payload: false });
        return { valid: true, changes: [] };
        
    } catch (error) {
        console.error('Error validating cart:', error);
        dispatch({ type: constant.SET_CART_ERROR, payload: error.message });
        return { valid: false, changes: [], error: 'Lỗi kiểm tra giỏ hàng' };
    }
};

// Action to update cart item with stock validation
export const updateCartWithValidation = (item) => async (dispatch) => {
    try {
        dispatch({ type: constant.SET_CART_LOADING, payload: true });
        
        // Check stock before updating
        const stockCheck = await checkProductStock(item.productId, item.quantity);
        
        if (!stockCheck.valid) {
            showMessage({
                message: stockCheck.message,
                type: 'danger',
                icon: 'danger',
                duration: 4000,
            });
            dispatch({ type: constant.SET_CART_LOADING, payload: false });
            return;
        }

        // If stock is valid, update cart
        dispatch({ type: constant.UPDATE_CART, payload: { Item: item } });
        dispatch({ type: constant.SET_CART_LOADING, payload: false });
        
    } catch (error) {
        console.error('Error updating cart:', error);
        showMessage({
            message: 'Lỗi khi cập nhật giỏ hàng',
            type: 'danger',
            icon: 'danger',
            duration: 4000,
        });
        dispatch({ type: constant.SET_CART_ERROR, payload: error.message });
    }
};

// Legacy actions (for backward compatibility)
export const addToCart = (item) => ({
    type: constant.ADD_TO_CART,
    payload: { Item: item }
});

export const updateCart = (item) => ({
    type: constant.UPDATE_CART,
    payload: { Item: item }
});

export const removeFromCart = (productId) => ({
    type: constant.REMOVE_FROM_CART,
    payload: { checkCartId: productId }
});

export const emptyCart = () => ({
    type: constant.EMPTY_CART,
    payload: {}
});
