import api from "../request/api";
import URL from "../request/url";

export const listAdjustments = (page = 1, reason = '', sortDate = '') =>
    api.get(URL.STOCK_ADJUSTMENT.CRUD, { params: { page, reason, sortDate } });

export const createAdjustment = (data) => api.post(URL.STOCK_ADJUSTMENT.CRUD, data);

export const detailAdjustment = (id) => api.get(URL.STOCK_ADJUSTMENT.CRUD + `/${id}`);
