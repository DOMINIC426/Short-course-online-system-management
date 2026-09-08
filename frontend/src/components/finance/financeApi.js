// src/components/finance/financeApi.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api/v1';

// Create isolated axios instance configured for our backend routing parameters
const financeApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});


financeApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default financeApi;
