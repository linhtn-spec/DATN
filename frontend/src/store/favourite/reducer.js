import { updateLocalStorage } from "../../utils/updateLocalStorage";
import { ACTION_FAVOURITE } from "./action";

const initialFavouriteState = {
    favourite: localStorage.getItem('favourite') ? JSON.parse(localStorage.getItem('favourite')).favourite : [],
};
export const favouriteReducer = (state = initialFavouriteState, action) => {
    let newState;
    switch (action.type) {
        case ACTION_FAVOURITE.ADD_FAVOURITE: {
            const existingItem = state.favourite.find(item => item.id === action.payload.id);
            if (existingItem) {
                console.log("existed");
                return state;
            } else {
                console.log(" not existed");

                newState = {
                    ...state,
                    favourite: [...state.favourite, action.payload]
                };
            }
            updateLocalStorage(newState, "favourite");
            return newState;
        }
        case ACTION_FAVOURITE.FETCH_FAVOURITE: {
            newState = { ...state, favourite: action.payload }
            updateLocalStorage(newState, "favourite")
            return newState
        }
        case ACTION_FAVOURITE.DELETE_ITEM: {
            console.log(1234);
            const filter = state.favourite.filter(item => item.id !== action.payload);
            newState = { ...state, favourite: filter }
            updateLocalStorage(newState, "favourite")
            return newState
        }
        case ACTION_FAVOURITE.REMOVE_FAVOURITE: {
            newState = { ...state, favourite: [] }
            updateLocalStorage(newState, "favourite")
            return newState
        }
        default:
            return state
    }
}