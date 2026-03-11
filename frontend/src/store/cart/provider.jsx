import { useReducer, useEffect, useContext, createContext } from "react"
import { cartReducer } from "./reducer.js"
import { currentCart } from "./state.js"
import { UserContext } from "../user";
import { getCart, syncCart } from "../../services/cart_service";
import { ACTION_CART } from "./action";

export const CartContext = createContext({
    state: null,
    dispatch: () => undefined
})

const storedState = JSON.parse(localStorage.getItem('cart')) ? JSON.parse(localStorage.getItem('cart')) : currentCart;

export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, storedState)
    const { state: userState } = useContext(UserContext);

    useEffect(() => {
        const fetchAndSyncCart = async () => {
            if (userState?.currentUser) {
                try {
                    const localCart = JSON.parse(localStorage.getItem('cart'))?.currentCart || [];
                    let res;
                    if (localCart.length > 0) {
                        res = await syncCart(localCart.map(item => ({ productId: item.id || item._id, quantity: item.quantityBuy })));
                    } else {
                        res = await getCart();
                    }
                    
                    if (res && res.data && res.data.products) {
                        const mappedCart = res.data.products.map(p => ({
                            ...p.productId,
                            quantityBuy: p.quantity,
                            id: p.productId?._id
                        })).filter(p => p.id); // Filter out null products if any got deleted

                        dispatch({ type: ACTION_CART.SET_CART, payload: mappedCart });
                    }
                } catch (error) {
                    console.error("Cart sync/fetch error", error);
                }
            }
        };
        fetchAndSyncCart();
    }, [userState?.currentUser]);

    return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>
}
