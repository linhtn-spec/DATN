import api from "../request/api";
import URL from "../request/url";

export const listSale = (page, applyDate, dueDate, isActive, sortDate) => api.get(URL.SALE.CRUD, {
    params: {
        page, applyDate, dueDate, isActive, sortDate
    }
})

export const detailSale = (id) => api.get(URL.SALE.CRUD + `/${id}`)

export const addSale = (data) => api.post(URL.SALE.CRUD, data)

export const updateSale = ({ id, ...data }) => api.put(URL.SALE.CRUD + `/${id}`, data)

export const deleteSale = (id) => api.delete(URL.SALE.CRUD + `/${id}`)

export const latestSale = () => api.get(URL.SALE.LASTEST)
