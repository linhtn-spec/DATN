import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/",
});

api.defaults.withCredentials = true;

// Response interceptor: centralized error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Let individual callers handle errors; just re-throw consistently
        return Promise.reject(error);
    }
);

export default api;
