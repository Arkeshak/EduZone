import axios from 'axios';
import { getToken, getRefreshToken, setToken, setRefreshToken, removeToken } from '../utils/tokenHelper';

/**
 * API Client (Axios Instance)
 * @desc Baseline Axios configuration for communicating with the Node.js backend.
 *       Includes a request interceptor to automatically attach JWT Bearer tokens,
 *       and a response interceptor to handle 401 Unauthorized errors by automatically
 *       attempting to refresh the token using the refresh token stored in cookies/storage.
 */
const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // Point to Backend or ENV
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
client.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Setup for handling concurrent token refreshes
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Response Interceptor: Handle 401 (Auth Error) and Automatic Refresh
client.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const isLoginRequest = originalRequest.url && originalRequest.url.includes('/auth/login');
        const isRefreshRequest = originalRequest.url && originalRequest.url.includes('/auth/refresh');

        if (error.response && error.response.status === 401 && !isLoginRequest && !isRefreshRequest && !originalRequest._retry) {

            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return client(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = getRefreshToken();
            if (refreshToken) {
                try {
                    const refreshUrl = import.meta.env.VITE_API_URL
                        ? `${import.meta.env.VITE_API_URL}/auth/refresh`
                        : 'http://localhost:5000/api/auth/refresh';

                    const { data } = await axios.post(refreshUrl, {
                        refreshToken
                    });

                    setToken(data.token);
                    if (data.refreshToken) setRefreshToken(data.refreshToken);

                    client.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                    originalRequest.headers['Authorization'] = `Bearer ${data.token}`;

                    processQueue(null, data.token);
                    return client(originalRequest);
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    removeToken();
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            } else {
                // No refresh token available
                removeToken();
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default client;
