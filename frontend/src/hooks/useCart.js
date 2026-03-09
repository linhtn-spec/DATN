import { useContext } from "react";
import { CartContext } from "../store/cart";
import { ACTION_CART } from "../store/cart/action";

/**
 * Custom hook to access and modify the shopping cart.
 *
 * @returns {{
 *   cart: Array,
 *   addToCart: (item: object) => void,
 *   removeCart: () => void,
 *   deleteItem: (id: string|number) => void,
 *   updateCart: (items: Array) => void
 * }}
 *
 * @example
 * const { cart, addToCart } = useCart();
 */
export const useCart = () => {
    const { state, dispatch } = useContext(CartContext);

    const addToCart = (item) => {
        dispatch({ type: ACTION_CART.ADD_CART, payload: item });
    };

    const removeCart = () => {
        dispatch({ type: ACTION_CART.REMOVE_CART });
    };

    const deleteItem = (id) => {
        dispatch({ type: ACTION_CART.DELETE_ITEM, payload: id });
    };

    const updateCart = (items) => {
        dispatch({ type: ACTION_CART.UPDATE_CART, payload: items });
    };

    return {
        cart: state?.currentCart ?? [],
        addToCart,
        removeCart,
        deleteItem,
        updateCart,
    };
};
