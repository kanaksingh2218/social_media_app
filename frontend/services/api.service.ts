import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    withCredentials: true,
});

// Cache for preventing duplicate requests
const pendingRequests = new Map<string, Promise<any>>();

// Request interceptor
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        console.log('🔑 API Request:', config.method?.toUpperCase(), config.url);

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Create unique request key for deduplication
        const requestKey = `${config.method}-${config.url}-${JSON.stringify(config.params || {})}`;

        // Check if identical request is already pending
        if (pendingRequests.has(requestKey)) {
            console.log('⚠️ Duplicate request detected, using existing:', requestKey);
            // Cancel this request and use the pending one
            const controller = new AbortController();
            config.signal = controller.signal;
            controller.abort();
        } else {
            // Mark this request as pending
            (config as any).__requestKey = requestKey;
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

    // Clear from pending requests
    const requestKey = (response.config as any).__requestKey;
    if (requestKey) {
        pendingRequests.delete(requestKey);
    }

    return response;
}, (error) => {
    // Clear from pending requests on error
    if (error.config) {
        const requestKey = (error.config as any).__requestKey;
        if (requestKey) {
            pendingRequests.delete(requestKey);
        }
    }

    // Don't log aborted requests (from deduplication)
    if (error.code === 'ERR_CANCELED') {
        return Promise.reject(error);
    }

    if (!error.response) {
        console.error('❌ Network Error (No response):', error.message);
        console.error('Likely causes: Backend is down, CORS failure, or URL mismatch.');
    } else {
        // Distinguish between Client Errors (4xx) and Server Errors (5xx)
        if (error.response.status >= 400 && error.response.status < 500) {
            console.warn(`⚠️ API Client Error (${error.response.status}):`, error.config?.url);
            console.warn('Message:', error.response?.data?.message || error.message);
        } else {
            console.error('❌ API Server Error:', error.response?.status, error.config?.url);
            console.error('Error message:', error.response?.data?.message || error.message);
        }
    }

    if (error.response?.status === 429) {
        console.warn('⚠️ Rate limit hit. Please wait before making more requests.');
    }

    if (error.response?.status === 401) {
        // Clear token and redirect to login
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Only redirect if not already on auth page to avoid loops
            if (!window.location.pathname.startsWith('/auth') && !window.location.pathname.startsWith('/login')) {
                window.location.href = '/login';
            }
        }
    }

    return Promise.reject(error);
});

export default api;
