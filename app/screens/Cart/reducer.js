import * as constant from './constant';
import createReducer from '../../lib/createReducer';
import {showMessage} from 'react-native-flash-message';

const initialState = {
    items: [],
}

export const CartReducer = createReducer(initialState, {
    [constant.ADD_TO_CART] (state, action) {
        showMessage({
            message: 'Đã thêm sản phẩm vào giỏ hàng',
            type: 'success',
            icon: 'success',
            duration: 3000,
        });
        const index = state.items.findIndex(item => Number(item.productPrice) === Number(action.payload.Item.productPrice));
        if (index !== -1) {
            let currentItem = state.items[index];
            let newItem = {
                productPrice: currentItem.productPrice,
                productId: currentItem.productId,
                quantity: Number(currentItem.quantity) + Number(action.payload.Item.quantity),
                shopId: currentItem.shopId,
            }
            const newList = [
                ...state.items.slice(0, index),
                newItem,
                ...state.items.slice(index + 1),
            ];
            return {
                ...state,
                items: newList
            }
        } else {
            return {
                ...state,
                items: [action.payload.Item, ...state.items]
            }
        }
    },

    [constant.UPDATE_CART] (state, action) {
        showMessage({
            message: 'Đã cập nhật giỏ hàng',
            type: 'success',
            icon: 'success',
            duration: 3000,
        });
        const index = state.items.findIndex(item => Number(item.productPrice) === Number(action.payload.Item.productPrice));
        if (index !== -1) {
            const newList = [
                ...state.items.slice(0, index),
                action.payload.Item,
                ...state.items.slice(index + 1),
            ];
            return {
                ...state,
                items: newList
            }
        } else {
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
        showMessage({
            message: 'Đã xoá khỏi giỏ hàng',
            type: 'info',
            icon: 'info',
            duration: 3000,
        });
        const newList = state.items.filter((item) => String(item.productPrice) !== String(action.payload.checkCartId));
        return {
            ...state,
            items: newList,
        }
    },
})
