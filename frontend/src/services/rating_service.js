import api from "../request/api";
import URL from "../request/url";

export const addRating = (data) => api.post(URL.RATING.CRUD, data)

export const updateRating = ({ id, ...data }) => api.put(URL.RATING.CRUD + `/${id}`, data)

export const paginateRating = (page, name, sortStar, sortDate, isActive) => api.get(URL.RATING.CRUD, {
    params: {
        page, name, sortStar, sortDate, isActive
    }
})

export const detailRating = (id) => api.get(URL.RATING.CRUD + `/${id}`)

export const ratingToProduct = (id, page, name, sortStar, sortDate, isActive, currentUserId) => api.get(URL.RATING.PRODUCT + `/${id}`, {
    params: {
        page, name, sortStar, sortDate, isActive, currentUserId
    }
})
export const ratingToUser = (id, page) => api.get(URL.RATING.USER + "/" + id, {
    params: { page }
})
