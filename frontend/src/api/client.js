import axios from 'axios';
import { getToken, removeToken } from '../utils/tokenHelper';

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

// Response Interceptor: Handle 401 (Auth Error)
client.interceptors.response.use(
    (response) => response,
    (error) => {
        // Prevent redirect loop if already on login or if the error comes from login endpoint
        const isLoginRequest = error.config && error.config.url && error.config.url.includes('/auth/login');

        if (error.response && error.response.status === 401 && !isLoginRequest) {
            removeToken();
            // Only redirect if not already there
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default client;
