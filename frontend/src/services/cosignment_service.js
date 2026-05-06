import api from "../request/api";
import URL from "../request/url";

export const listConsignment = (page, applyDate, dueDate, sortMoney, sortDate) => api.get(URL.CONSIGNMENT.CRUD, {
    params: {
        page, applyDate, dueDate, sortMoney, sortDate
    }
})

export const detailConsignment = (id) => api.get(URL.CONSIGNMENT.CRUD + `/${id}`)

export const addConsignment = (data) => api.post(URL.CONSIGNMENT.CRUD, data)

export const updateConsignment = ({ id, ...data }) => api.put(URL.CONSIGNMENT.CRUD + `/${id}`, data)

export const deleteConsignment = (id) => api.delete(URL.CONSIGNMENT.CRUD + `/${id}`)

export const expiringSoon = (days = 7) => api.get(URL.CONSIGNMENT.EXPIRING, { params: { days } })