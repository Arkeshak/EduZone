import axios from 'axios';
import { getToken, getRefreshToken, setToken, setRefreshToken, removeToken } from '../utils/tokenHelper';

const client = axios.create({
    baseURL: 'http://localhost:5000/api', // Point to Backend
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
                    const { data } = await axios.post('http://localhost:5000/api/auth/refresh', {
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
