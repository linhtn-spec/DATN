import axios from 'axios';
import { getUrlConfig } from '../config/url';

export const getTaxConfig = () => {
    return axios.get(`${getUrlConfig()}/tax-config`);
};

export const updateTaxConfig = (id, data) => {
    return axios.put(`${getUrlConfig()}/tax-config/${id}`, data, {
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials: true
    });
};
