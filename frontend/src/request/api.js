import axios from "axios";
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || `http://localhost:5000/api/`
});
api.defaults.withCredentials = true
export default api;
