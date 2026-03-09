import { updateLocalStorage } from "../../utils/updateLocalStorage";
import { ACTION_USER } from "./action";

const initialUserState = {
    currentUser: JSON.parse(localStorage.getItem("user"))?.currentUser ?? null,
};

export const userReducer = (state = initialUserState, action) => {
    switch (action.type) {
        case ACTION_USER.LOGIN: {
            const newState = { ...state, currentUser: action.payload };
            updateLocalStorage(newState, "user");
            return newState;
        }
        case ACTION_USER.LOGOUT: {
            const newState = { ...state, currentUser: null };
            updateLocalStorage(newState, "user");
            return newState;
        }
        default:
            return state;
    }
};