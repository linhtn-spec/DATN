import { ACTION_ORDER } from "./action";
import { updateLocalStorage } from "../../utils/updateLocalStorage";

const initialOrderState = {
    currentOrder: localStorage.getItem('currentOrder') ? JSON.parse(localStorage.getItem('currentOrder'))?.currentOrder : {},
    // Other properties of your cart state, if any
};

export const orderReducer = (state = initialOrderState, action) => {
    let newState;
    switch (action.type) {
        case ACTION_ORDER.ADD_ORDER: {
            newState = { ...state, currentOrder: action.payload };
            updateLocalStorage(newState, "currentOrder");
            return newState;
        }
        case ACTION_ORDER.REMOVE_ORDER: {
            newState = { ...state, currentOrder: {} };
            updateLocalStorage(newState, "currentOrder");
            return newState;
        }
        default:
            return state
    }
}