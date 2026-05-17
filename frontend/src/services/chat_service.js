import URL from "../request/url"
import api from "../request/api";

export const list_room = () => api.get(URL.CHAT.CRUD)

export const detail_room = (id, markRead = false) => api.get(URL.CHAT.CRUD + `/${id}?markRead=${markRead}`)

export const send_message = (message) => api.post(URL.CHAT.CRUD, message)


