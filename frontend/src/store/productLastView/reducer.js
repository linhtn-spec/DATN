import { updateLocalStorage } from "../../utils/updateLocalStorage";
import { ACTION_PRODUCT_LASTVIEW } from "./action";

const initialLastViewProductState = {
    lastViewProduct: localStorage.getItem('lastViewProduct') ? JSON.parse(localStorage.getItem('lastViewProduct')) : [],
    // Other properties of your cart state, if any
};


export const productLastViewReducer = (state = initialLastViewProductState, action) => {
    let newState;
    switch (action.type) {
        case ACTION_PRODUCT_LASTVIEW.ADD_PRODUCT: {
            const lastViewProduct = state.lastViewProduct || [];
            const existingProductIndex = lastViewProduct.findIndex(item => item.id === action.payload.id);
            if (existingProductIndex === -1) {
                newState = {
                    ...state,
                    lastViewProduct: [...lastViewProduct, action.payload]
                };
            } else {
                const filteredProducts = lastViewProduct.filter(item => item.id !== action.payload.id);

                newState = {
                    ...state,
                    lastViewProduct: [...filteredProducts, action.payload]
                };

            }

            updateLocalStorage(newState, "lastViewProduct");
            return newState;
        }
        default:
            return state
    }
}
