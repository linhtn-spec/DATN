import api from "../request/api";

export const getTaxConfig = () => {
    return api.get("tax-config");
};

export const updateTaxConfig = (id, data) => {
    return api.put(`tax-config/${id}`, data);
};
