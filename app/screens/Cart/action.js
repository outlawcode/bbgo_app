import * as constants from './constant';

export const addToCart = (Item) => ({
    type: constants.ADD_TO_CART,
    payload: {
        Item
    },
});
export const updateCart = (Item) => ({
    type: constants.UPDATE_CART,
    payload: {
        Item
    },
});
export const removeFromCart = (checkCartId) => ({
    type: constants.REMOVE_FROM_CART,
    payload: {
        checkCartId
    },
});
export const emptyCart = () => ({
    type: constants.EMPTY_CART,
});
