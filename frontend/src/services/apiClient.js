import axios from 'axios';
import { getToken, getRefreshToken, setToken, setRefreshToken, removeToken, isTokenExpiring } from '../utils/tokenHelper';

/**
 * API CLIENT WITH ADVANCED TOKEN MANAGEMENT
 * 
 * File Purpose: Central Axios instance with advanced JWT token handling
 * Used for: All HTTP requests from frontend to backend API
 * 
 * Features:
 * - Automatic JWT token injection in request headers
 * - Proactive token refresh (before expiration)
 * - Reactive token refresh (on 401 Unauthorized)
 * - Concurrent request queueing during token refresh
 * - Automatic redirect to login on token failure
 * - Fallback to login for missing refresh tokens
 * 
 * Token Management Strategy:
 * - Primary token (JWT): Short-lived (1-2 hours)
 * - Refresh token: Long-lived (7-30 days)
 * - Proactive refresh: Refresh token 5 minutes before expiration
 * - Reactive refresh: Attempt refresh when 401 received
 * - Request queueing: Queue requests during refresh to avoid conflicts
 */

/**
 * API CLIENT INSTANCE CREATION
 * 
 * Purpose: Create configured Axios instance for all API calls
 * baseURL: API base URL from VITE_API_URL environment variable
 * Fallback: http://localhost:5000/api for local development
 * headers: Default request headers (JSON content type)
 */
const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * TOKEN REFRESH QUEUE MANAGEMENT
 * 
 * Purpose: Handle concurrent requests during token refresh
 * Problem: Multiple requests can trigger refresh simultaneously
 * Solution: Queue requests and process after refresh completes
 * 
 * Variables:
 * - isRefreshing: Flag indicating refresh in progress
 * - failedQueue: Array of pending requests waiting for new token
 * 
 * This prevents multiple refresh calls for same token
 */
let isRefreshing = false;
let failedQueue = [];

/**
 * PROCESS QUEUE FUNCTION
 * 
 * Purpose: Process queued requests after token refresh
 * Called with either: error (refresh failed) or token (refresh succeeded)
 * 
 * If error: All queued requests rejected with error
 * If token: All queued requests resolved and retried with new token
 * 
 * @param {Error} error - Error that occurred during refresh (if any)
 * @param {string} token - New JWT token (if refresh succeeded)
 */
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

/**
 * REQUEST INTERCEPTOR: Attach Token + Proactive Refresh
 * 
 * Purpose: 
 * 1. Attach JWT token to every request
 * 2. Proactively refresh token before expiration
 * 3. Handle concurrent refresh scenarios
 * 
 * Process:
 * 1. Get stored JWT token and refresh token
 * 2. Check if JWT token is expiring within 5 minutes
 * 3. If expiring and refresh token available, attempt refresh now
 * 4. Attach token to Authorization header
 * 5. Continue with request
 * 
 * Benefits of proactive refresh:
 * - Prevents 401 errors during user activity
 * - Better user experience (no interruption)
 * - Token always valid when needed
 */
client.interceptors.request.use(
    async (config) => {
        let token = getToken();
        const refreshToken = getRefreshToken();

        /**
         * PROACTIVE TOKEN REFRESH
         * 
         * Check if token is expiring within 5 minutes
         * isTokenExpiring(token, 5) = expires in next 5 minutes?
         * 
         * Conditions:
         * - Token exists
         * - Token expiring soon
         * - Refresh token exists
         * - Not already refreshing (prevents duplicate calls)
         * 
         * If true: Attempt to refresh token now before it expires
         */
        if (token && isTokenExpiring(token, 5)) {
            if (refreshToken && !isRefreshing) {
                try {
                    isRefreshing = true;

                    // Build refresh URL (environment variable or fallback)
                    const refreshUrl = import.meta.env.VITE_API_URL
                        ? `${import.meta.env.VITE_API_URL}/auth/refresh`
                        : 'http://localhost:5000/api/auth/refresh';

                    // Send refresh token to backend
                    const { data } = await axios.post(refreshUrl, { refreshToken });

                    // Validate new token received
                    if (data.token) {
                        setToken(data.token);
                        token = data.token;  // Use new token for current request
                    }
                } catch (err) {
                    console.error('Proactive token refresh failed:', err);
                    // Continue with old token - will handle in response interceptor if needed
                } finally {
                    isRefreshing = false;
                }
            }
        }

        // Attach token to Authorization header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR: Handle 401 Unauthorized + Automatic Refresh
 * 
 * Purpose:
 * 1. Detect 401 Unauthorized responses
 * 2. Attempt to refresh token using refresh token
 * 3. Retry original request with new token
 * 4. Handle refresh failures by redirecting to login
 * 5. Queue concurrent requests during refresh
 * 
 * Scenarios handled:
 * - 401 on regular request: Attempt refresh
 * - 401 on login request: Don't attempt refresh (already auth endpoint)
 * - 401 on refresh request: Don't attempt double refresh
 * - Multiple concurrent 401s: Queue requests, refresh once
 * - Refresh success: Retry all queued requests
 * - Refresh failure: Redirect to login
 */
client.interceptors.response.use(
    (response) => {
        // Automatically unwrap standard paginated API responses across the app
        // This ensures destructuring like `const { data } = await client.get(...)` returns the array directly
        // and prevents `TypeError: data.filter is not a function` in frontend components.
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
            response.data = response.data.data;
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        const isLoginRequest = originalRequest.url && originalRequest.url.includes('/auth/login');
        const isRefreshRequest = originalRequest.url && originalRequest.url.includes('/auth/refresh');

        /**
         * DETECT UNAUTHORIZED ERROR ON RETRYABLE REQUEST
         * 
         * Conditions to attempt refresh:
         * - Response status is 401 Unauthorized
         * - Not a login request (shouldn't refresh auth)
         * - Not a refresh request (wouldn't help)
         * - First attempt (no _retry flag)
         */
        if (error.response && error.response.status === 401 && !isLoginRequest && !isRefreshRequest && !originalRequest._retry) {

            /**
             * HANDLE CONCURRENT REFRESH REQUESTS
             * 
             * If refresh already in progress:
             * - Don't start another refresh
             * - Queue current request
             * - Retry when first refresh completes
             * 
             * This prevents multiple simultaneous refresh calls
             * which could cause issues on backend
             */
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

            /**
             * MARK REQUEST FOR RETRY
             * 
             * _retry flag: Mark that refresh has been attempted
             * Prevents infinite retry loops if refresh fails
             */
            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = getRefreshToken();

            /**
             * ATTEMPT TOKEN REFRESH
             * 
             * If refresh token exists:
             * - Send to backend's /auth/refresh endpoint
             * - Backend validates and returns new token
             * - Store new token
             * - Update authorization headers
             * - Process queued requests
             * - Retry original request
             * 
             * If refresh fails or no refresh token:
             * - Clear stored tokens
             * - Redirect to login
             * - User must authenticate again
             */
            if (refreshToken) {
                try {
                    const refreshUrl = import.meta.env.VITE_API_URL
                        ? `${import.meta.env.VITE_API_URL}/auth/refresh`
                        : 'http://localhost:5000/api/auth/refresh';

                    // Send refresh request
                    const { data } = await axios.post(refreshUrl, { refreshToken });

                    // Validate response has new token
                    if (data.token) {
                        // Store new token
                        setToken(data.token);

                        // Store new refresh token if provided
                        if (data.refreshToken) {
                            setRefreshToken(data.refreshToken);
                        }

                        // Update default and current request headers
                        client.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                        originalRequest.headers['Authorization'] = `Bearer ${data.token}`;

                        // Process queued requests with new token
                        processQueue(null, data.token);

                        // Retry original request with new token
                        return client(originalRequest);
                    } else {
                        throw new Error('No token in refresh response');
                    }
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                    processQueue(refreshError, null);

                    // Clear stored tokens
                    removeToken();

                    // Redirect to login if not already there
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }

                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            } else {
                // No refresh token available
                // User session is invalid - must login again
                removeToken();

                // Redirect to login if not already there
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }

                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

/**
 * EXPORT CONFIGURED API CLIENT
 * 
 * Usage in other files:
 * import client from '@/services/apiClient';
 * 
 * Examples:
 * - client.get('/users')
 * - client.post('/donations', { amount: 1000 })
 * - client.put('/profile', { name: 'John' })
 * - client.delete('/users/1')
 * 
 * All requests automatically include:
 * - Authorization header with Bearer token
 * - Content-Type: application/json
 * - Proactive token refresh
 * - Error handling with automatic refresh on 401
 * - Request queueing during refresh
 * - Redirect to login on token failure
 */
export default client;
