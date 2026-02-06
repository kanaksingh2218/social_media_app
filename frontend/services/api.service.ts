import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    withCredentials: true,
});

// Request interceptor
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        console.log('🔑 API Request:', config.method?.toUpperCase(), config.url);
        console.log('🔑 Token from localStorage:', token ? 'PRESENT' : 'MISSING');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use((response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
}, (error) => {
    console.error('❌ API Error:', error.response?.status, error.config?.url);
    console.error('Error message:', error.response?.data?.message || error.message);
    return Promise.reject(error);
});

export default api;
