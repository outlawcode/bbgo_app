import * as constant from './constant';
import createReducer from '../../lib/createReducer';
import {showMessage} from 'react-native-flash-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiConfig from '../../config/api-config';
import axios from 'axios';

const initialState = {
    items: [],
    loading: false,
    error: null,
}

// Helper function to check product stock
export const checkProductStock = async (productId, quantity) => {
    try {
        const token = await AsyncStorage.getItem('sme_user_token');
        if (!token) {
            return { valid: false, message: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng' };
        }

        const response = await axios.post(`${apiConfig.baseUrl}/member/order/validate-cart`, {
            orderItems: [{ productId, quantity }]
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const { validItems, outOfStockItems, adjustedItems, removedItems } = response.data;
        
        if (outOfStockItems.length > 0) {
            return { 
                valid: false, 
                message: 'Sản phẩm đã hết hàng',
                stockStatus: 'OUT_OF_STOCK',
                availableStock: 0
            };
        }

        if (adjustedItems.length > 0) {
            const adjustedItem = adjustedItems[0];
            return { 
                valid: false, 
                message: `Chỉ còn ${adjustedItem.availableStock} sản phẩm trong kho`,
                stockStatus: 'INSUFFICIENT_STOCK',
                availableStock: adjustedItem.availableStock,
                maxQuantity: adjustedItem.availableStock
            };
        }

        if (removedItems.length > 0) {
            return { valid: false, message: 'Sản phẩm không tồn tại hoặc đã bị xóa' };
        }

        if (validItems.length > 0) {
            return { 
                valid: true, 
                message: 'Sản phẩm có sẵn',
                stockStatus: 'IN_STOCK'
            };
        }

        return { valid: false, message: 'Không thể kiểm tra tồn kho' };
    } catch (error) {
        console.error('Error checking stock:', error);
        if (error.response && error.response.data && error.response.data.message) {
            return { valid: false, message: error.response.data.message };
        }
        return { valid: false, message: 'Lỗi kiểm tra tồn kho' };
    }
};

export const CartReducer = createReducer(initialState, {
    [constant.ADD_TO_CART] (state, action) {
        // Use productId for matching instead of productPrice (like web)
        const index = state.items.findIndex(item => Number(item.productId) === Number(action.payload.Item.productId));
        
        if (index !== -1) {
            // Item exists, update quantity
            let currentItem = state.items[index];
            let newItem = {
                ...currentItem,
                quantity: Number(currentItem.quantity) + Number(action.payload.Item.quantity),
            }
            const newList = [
                ...state.items.slice(0, index),
                newItem,
                ...state.items.slice(index + 1),
            ];
            
            showMessage({
                message: 'Đã cập nhật số lượng sản phẩm trong giỏ hàng',
                type: 'success',
                icon: 'success',
                duration: 3000,
            });
            
            return {
                ...state,
                items: newList
            }
        } else {
            // New item
            showMessage({
                message: 'Đã thêm sản phẩm vào giỏ hàng',
                type: 'success',
                icon: 'success',
                duration: 3000,
            });
            
            return {
                ...state,
                items: [action.payload.Item, ...state.items]
            }
        }
    },

    [constant.UPDATE_CART] (state, action) {
        // Use productId for matching instead of productPrice (like web)
        const index = state.items.findIndex(item => Number(item.productId) === Number(action.payload.Item.productId));
        
        if (index !== -1) {
            const newList = [
                ...state.items.slice(0, index),
                action.payload.Item,
                ...state.items.slice(index + 1),
            ];
            
            showMessage({
                message: 'Đã cập nhật số lượng sản phẩm',
                type: 'success',
                icon: 'success',
                duration: 3000,
            });
            
            return {
                ...state,
                items: newList
            }
        } else {
            // If item not found, add as new item
            showMessage({
                message: 'Đã thêm sản phẩm vào giỏ hàng',
                type: 'success',
                icon: 'success',
                duration: 3000,
            });
            
            return {
                ...state,
                items: [action.payload.Item, ...state.items]
            }
        }
    },

    [constant.EMPTY_CART] (state, action) {
        showMessage({
            message: 'Đã làm trống giỏ hàng',
            type: 'info',
            icon: 'info',
            duration: 3000,
        });
        return {
            ...state,
            items: []
        }
    },

    [constant.REMOVE_FROM_CART] (state, action) {
        // Use productId for matching instead of productPrice (like web)
        // Support both productId and legacy productPrice matching for backward compatibility
        const newList = state.items.filter((item) => 
            Number(item.productId) !== Number(action.payload.checkCartId) && 
            String(item.productPrice) !== String(action.payload.checkCartId)
        );
        
        showMessage({
            message: 'Đã xóa sản phẩm khỏi giỏ hàng',
            type: 'success',
            icon: 'success',
            duration: 3000,
        });
        
        return {
            ...state,
            items: newList,
        }
    },

})

// checkProductStock is already exported above, no need to export again
