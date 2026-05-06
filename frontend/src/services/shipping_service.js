import URL from "../request/url"
import api from "../request/api";

export const listShippingConfig = async () => {
    const url = "shipping-config";
    try {
        const rs = await api.get(url);
        return rs;
    } catch (error) {
        return error.response;
    }
};

export const updateShippingConfig = async (id, data) => {
    const url = `shipping-config/${id}`;
    try {
        const rs = await api.put(url, data);
        return rs;
    } catch (error) {
        return error.response;
    }
};
