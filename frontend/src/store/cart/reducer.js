import { updateLocalStorage } from "../../utils/updateLocalStorage";
import { ACTION_CART } from "./action";
import { syncCart, updateCartItem, removeCartItem, clearCart, removeManyCartItems } from "../../services/cart_service";

const initialCartState = {
    currentCart: JSON.parse(localStorage.getItem("cart"))?.currentCart ?? [],
};

const getItemId = (item) => item?.id || item?._id;

const getMaxQty = (qty) => {
    if (qty == null) return 0;
    if (typeof qty === 'object') return Number(qty.inTrade ?? 0);
    return Number(qty);
};

export const cartReducer = (state = initialCartState, action) => {
    switch (action.type) {
        case ACTION_CART.ADD_CART: {
            const currentCart = state.currentCart ?? [];
            const actionId = getItemId(action.payload);
            const existing = currentCart.find((item) => getItemId(item) === actionId);

            let updatedCart;
            if (existing) {
                updatedCart = currentCart.map((item) => {
                    if (getItemId(item) !== actionId) return item;
                    const total = Number(action.payload.quantityBuy) + Number(existing.quantityBuy);
                    const maxQty = getMaxQty(item.quantity);
                    return { ...item, quantityBuy: maxQty > 0 ? Math.min(total, maxQty) : total };
                });
            } else {
                updatedCart = [...currentCart, action.payload];
            }

            const newState = { ...state, currentCart: updatedCart };
            updateLocalStorage(newState, "cart");
            
            // Sync with backend if logged in
            const user = JSON.parse(localStorage.getItem("user"))?.currentUser;
            if (user) {
                updateCartItem(actionId, action.payload.quantityBuy).catch(e => console.error("Failed to sync cart", e));
            }

            return newState;
        }

        case ACTION_CART.REMOVE_CART: {
            const newState = { ...state, currentCart: [] };
            updateLocalStorage(newState, "cart");
            
            const user = JSON.parse(localStorage.getItem("user"))?.currentUser;
            if (user) {
                clearCart().catch(e => console.error("Failed to clear cart", e));
            }
            return newState;
        }

        case ACTION_CART.CLEAR_CART_LOCAL: {
            const newState = { ...state, currentCart: [] };
            updateLocalStorage(newState, "cart");
            return newState;
        }

        case ACTION_CART.DELETE_ITEM: {
            const filtered = state.currentCart?.filter((item) => getItemId(item) !== action.payload);
            const newState = { ...state, currentCart: filtered };
            updateLocalStorage(newState, "cart");
            
            const user = JSON.parse(localStorage.getItem("user"))?.currentUser;
            if (user) {
                removeCartItem(action.payload).catch(e => console.error("Failed to remove item", e));
            }
            return newState;
        }

        case ACTION_CART.SET_CART: {
            const newState = { ...state, currentCart: action.payload };
            updateLocalStorage(newState, "cart");
            return newState;
        }

        case ACTION_CART.UPDATE_CART: {
            const updates = action.payload;
            const updated = state.currentCart.map((item) => {
                const match = updates.find((p) => getItemId(p) === getItemId(item));
                return match ? { ...item, quantityBuy: Number(match.quantityBuy) } : item;
            });
            const newState = { ...state, currentCart: updated };
            updateLocalStorage(newState, "cart");
            return newState;
        }

        case ACTION_CART.PLUS_ITEM: {
            // payload: { id }  — maxQty comes from the item itself in the store
            const targetId = action.payload.id;
            const updated = state.currentCart.map((item) => {
                if (getItemId(item) !== targetId) return item;
                const current = Number(item.quantityBuy ?? 1);
                const max = getMaxQty(item.quantity);
                if (max > 0 && current >= max) return item;   // at stock limit
                return { ...item, quantityBuy: current + 1 };
            });
            const newState = { ...state, currentCart: updated };
            updateLocalStorage(newState, "cart");
            
            const user = JSON.parse(localStorage.getItem("user"))?.currentUser;
            if (user) {
               const changedItem = updated.find((item) => getItemId(item) === targetId);
               if(changedItem) updateCartItem(targetId, changedItem.quantityBuy).catch(e => console.error(e));
            }

            return newState;
        }

        case ACTION_CART.MINUS_ITEM: {
            // payload: { id }
            const targetId = action.payload.id;
            const updated = state.currentCart.map((item) => {
                if (getItemId(item) !== targetId) return item;
                const current = Number(item.quantityBuy ?? 1);
                if (current <= 1) return item;
                return { ...item, quantityBuy: current - 1 };
            });
            const newState = { ...state, currentCart: updated };
            updateLocalStorage(newState, "cart");
            
            const user = JSON.parse(localStorage.getItem("user"))?.currentUser;
            if (user) {
               const changedItem = updated.find((item) => getItemId(item) === targetId);
               if(changedItem) updateCartItem(targetId, changedItem.quantityBuy).catch(e => console.error(e));
            }

            return newState;
        }

        case ACTION_CART.CHANGE_QUANTITY: {
            // payload: { id, quantityBuy }
            const { id: targetId, quantityBuy } = action.payload;
            const updated = state.currentCart.map((item) => {
                if (getItemId(item) !== targetId) return item;
                const max = getMaxQty(item.quantity);
                let finalQty = Number(quantityBuy);
                if (isNaN(finalQty) || finalQty < 1) finalQty = 1;
                if (max > 0 && finalQty > max) finalQty = max;
                return { ...item, quantityBuy: finalQty };
            });
            const newState = { ...state, currentCart: updated };
            updateLocalStorage(newState, "cart");
            
            const user = JSON.parse(localStorage.getItem("user"))?.currentUser;
            if (user) {
               const changedItem = updated.find((item) => getItemId(item) === targetId);
               if(changedItem) updateCartItem(targetId, changedItem.quantityBuy).catch(e => console.error(e));
            }

            return newState;
        }

        case ACTION_CART.REMOVE_CHECKED_OUT_ITEMS: {
            // payload: string[] — array of productIds that were just checked out
            const ids = action.payload;
            const filtered = state.currentCart.filter(
                (item) => !ids.includes(getItemId(item))
            );
            const newState = { ...state, currentCart: filtered };
            updateLocalStorage(newState, "cart");

            const user = JSON.parse(localStorage.getItem("user"))?.currentUser;
            if (user) {
                removeManyCartItems(ids).catch(e => console.error("Failed to batch-remove cart items", e));
            }
            return newState;
        }

        default:
            return state;
    }
};