import api from "../request/api";

export const getCart = async () => {
    return await api.get("/cart");
};

export const syncCart = async (products) => {
    return await api.post("/cart/sync", { products });
};

export const updateCartItem = async (productId, quantity) => {
    return await api.put("/cart", { productId, quantity });
};

export const removeCartItem = async (productId) => {
    return await api.delete(`/cart/${productId}`);
};

export const clearCart = async () => {
    return await api.delete("/cart");
};

export const removeManyCartItems = async (productIds) => {
    return await api.delete("/cart/many", { data: { productIds } });
};
