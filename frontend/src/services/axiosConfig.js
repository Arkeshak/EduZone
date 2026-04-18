import axios from 'axios';
import { getToken, removeToken } from '@/utils/tokenHelper';

/**
 * AXIOS CONFIGURATION AND INTERCEPTORS
 * 
 * File Purpose: Configure Axios instance with authentication and error handling
 * Used for: All HTTP requests from frontend to backend API
 * 
 * Features:
 * - Base URL configuration from environment
 * - Automatic JWT token injection in request headers
 * - Automatic 401 Unauthorized handling (redirect to login)
 * - Network error handling
 * - Response error standardization
 * 
 * Interceptors:
 * - Request: Adds Bearer token to Authorization header
 * - Response: Handles errors, token expiration, network issues
 */

// API_BASE_URL CONFIGURATION
// Environment variable: VITE_API_BASE_URL
// Fallback: http://localhost:5000/api for local development
// Change this if backend runs on different port/URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * AXIOS INSTANCE CREATION
 * 
 * Purpose: Create configured Axios instance for all API calls
 * baseURL: API base URL from environment or fallback
 * headers: Default request headers
 * - Content-Type: application/json (sends data as JSON)
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * REQUEST INTERCEPTOR
 * 
 * Purpose: Add JWT authentication token to every request
 * Triggered: Before every API request
 * 
 * Process:
 * 1. Get stored JWT token from localStorage (via getToken())
 * 2. If token exists, add to request headers
 * 3. Header format: "Authorization: Bearer <token>"
 * 4. Pass modified config forward
 * 
 * This ensures all requests are authenticated without manual token handling
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Get JWT token from localStorage
    const token = getToken();

    // If token exists, add to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // If error occurs during request setup, reject with error
    return Promise.reject(error);
  }
);

/**
 * RESPONSE INTERCEPTOR
 * 
 * Purpose: Handle API responses and errors consistently
 * Triggered: After every API response
 * 
 * Handles 3 scenarios:
 * 1. error.response: Server responded with error status (4xx, 5xx)
 * 2. error.request: Request made but no response received (network issue)
 * 3. other errors: Error during request setup
 * 
 * Special handling for 401 Unauthorized:
 * - Removes stored token from localStorage
 * - Redirects user to login page
 * - User must authenticate again
 */
axiosInstance.interceptors.response.use(
  // Success response - pass through unchanged
  (response) => {
    return response;
  },

  // Error response handler
  (error) => {
    // CASE 1: Server responded with error status
    if (error.response) {
      /**
       * 401 UNAUTHORIZED HANDLING
       * 
       * Reasons for 401:
       * - Token expired
       * - Token invalid
       * - Token not provided
       * - User session invalidated on backend
       * 
       * Action:
       * - Remove token from storage
       * - Redirect to login page
       * - User must login again
       */
      if (error.response.status === 401) {
        removeToken();
        window.location.href = '/login';
      }

      // Extract error message from server response or use generic message
      const errorMessage = error.response.data?.message || 'An error occurred';
      return Promise.reject(new Error(errorMessage));
    }

    // CASE 2: Request made but no response received (Network issue)
    else if (error.request) {
      // Network error - backend unreachable
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    // CASE 3: Other errors (e.g., error setting up request)
    else {
      return Promise.reject(error);
    }
  }
);

/**
 * EXPORT CONFIGURED INSTANCE
 * 
 * Usage in other files:
 * import axiosInstance from '@/services/axiosConfig';
 * 
 * Examples:
 * - axiosInstance.get('/users')
 * - axiosInstance.post('/auth/login', { email, password })
 * - axiosInstance.put('/users/1', { name: 'John' })
 * - axiosInstance.delete('/users/1')
 * 
 * All requests automatically include:
 * - Authorization header with Bearer token
 * - Content-Type: application/json
 * - Error handling with 401 redirect
 */
export default axiosInstance;
