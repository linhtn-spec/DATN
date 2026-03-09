import { updateLocalStorage } from "../../utils/updateLocalStorage";
import { ACTION_CART } from "./action";

const initialCartState = {
    currentCart: JSON.parse(localStorage.getItem("cart"))?.currentCart ?? [],
};

export const cartReducer = (state = initialCartState, action) => {
    switch (action.type) {
        case ACTION_CART.ADD_CART: {
            const currentCart = state.currentCart ?? [];
            const existing = currentCart.find((item) => item.id === action.payload.id);

            let updatedCart;
            if (existing) {
                updatedCart = currentCart.map((item) => {
                    if (item.id !== action.payload.id) return item;
                    const total = action.payload.quantityBuy + existing.quantityBuy;
                    return { ...item, quantityBuy: Math.min(total, item.quantity) };
                });
            } else {
                updatedCart = [...currentCart, action.payload];
            }

            const newState = { ...state, currentCart: updatedCart };
            updateLocalStorage(newState, "cart");
            return newState;
        }

        case ACTION_CART.REMOVE_CART: {
            const newState = { ...state, currentCart: [] };
            updateLocalStorage(newState, "cart");
            return newState;
        }

        case ACTION_CART.DELETE_ITEM: {
            const filtered = state.currentCart?.filter((item) => item.id !== action.payload);
            const newState = { ...state, currentCart: filtered };
            updateLocalStorage(newState, "cart");
            return newState;
        }

        case ACTION_CART.UPDATE_CART: {
            const updates = action.payload;
            const updated = state.currentCart.map((item) => {
                const match = updates.find((p) => p.id === item.id);
                return match ? { ...item, quantityBuy: match.quantityBuy } : item;
            });
            const newState = { ...state, currentCart: updated };
            updateLocalStorage(newState, "cart");
            return newState;
        }

        default:
            return state;
    }
};