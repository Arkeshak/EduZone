import axios from 'axios';
import { getToken, getRefreshToken, setToken, setRefreshToken, removeToken, isTokenExpiring } from '../utils/tokenHelper';

/**
 * CENTRAL API CLIENT
 * 
 * Purpose: A custom Axios instance that automatically handles 
 * authentication tokens and session refreshing.
 */
const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {},
});

// Helper to get the root URL (for images/downloads)
const getBaseUrl = () => {
    let url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    if (url && !url.startsWith('http')) url = `https://${url}`;
    return url.replace(/\/api\/?$/, '');
};

export const API_BASE_URL = getBaseUrl();

// Logic for handling multiple simultaneous requests during a token refresh
let isRefreshing = false;
let failedQueue = [];

// Retries or fails all queued requests after a refresh attempt
const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

/**
 * REQUEST INTERCEPTOR
 * Runs BEFORE every API request.
 */
client.interceptors.request.use(
    async (config) => {
        let token = getToken();
        const refreshToken = getRefreshToken();

        // PROACTIVE REFRESH: If token expires in < 5 mins, refresh it now.
        if (token && isTokenExpiring(token, 5)) {
            if (refreshToken && !isRefreshing) {
                try {
                    isRefreshing = true;
                    const refreshUrl = import.meta.env.VITE_API_URL
                        ? `${import.meta.env.VITE_API_URL}/auth/refresh`
                        : 'http://localhost:5000/api/auth/refresh';

                    const { data } = await axios.post(refreshUrl, { refreshToken });
                    if (data.token) {
                        setToken(data.token);
                        token = data.token; // Use the new token immediately
                    }
                } catch (err) {
                    console.error('Proactive token refresh failed:', err);
                } finally {
                    isRefreshing = false;
                }
            }
        }

        // Attach the latest token to the header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
 * Runs AFTER every API response.
 */
client.interceptors.response.use(
    (response) => {
        // AUTOMATIC UNWRAPPING: 
        // Backend returns { success: true, data: [...] }. 
        // This line makes 'response.data' point directly to the array.
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
            response.data = response.data.data;
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        const isLoginRequest = originalRequest.url && originalRequest.url.includes('/auth/login');
        const isRefreshRequest = originalRequest.url && originalRequest.url.includes('/auth/refresh');

        // REACTIVE REFRESH: If 401 (Unauthorized) occurs, try to refresh and retry
        if (error.response && error.response.status === 401 && !isLoginRequest && !isRefreshRequest && !originalRequest._retry) {

            // If another refresh is already happening, wait for it
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return client(originalRequest);
                }).catch(err => Promise.reject(err));
            }

            originalRequest._retry = true; // Mark to prevent infinite loops
            isRefreshing = true;

            const refreshToken = getRefreshToken();

            if (refreshToken) {
                try {
                    const refreshUrl = import.meta.env.VITE_API_URL
                        ? `${import.meta.env.VITE_API_URL}/auth/refresh`
                        : 'http://localhost:5000/api/auth/refresh';

                    const { data } = await axios.post(refreshUrl, { refreshToken });

                    if (data.token) {
                        setToken(data.token);
                        if (data.refreshToken) setRefreshToken(data.refreshToken);

                        client.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                        originalRequest.headers['Authorization'] = `Bearer ${data.token}`;

                        processQueue(null, data.token); // Success: retry the queue
                        return client(originalRequest); // Retry original
                    } else {
                        throw new Error('No token provided');
                    }
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                    processQueue(refreshError, null);
                    removeToken();
                    if (window.location.pathname !== '/login') window.location.href = '/login';
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            } else {
                removeToken(); // No refresh token = user must login
                if (window.location.pathname !== '/login') window.location.href = '/login';
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default client;
