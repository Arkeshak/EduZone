/**
 * APPLICATION CONSTANTS & CONFIGURATION
 * 
 * File Purpose: Centralized configuration for all application settings
 * Used for: Authentication, CORS, rate limiting, pagination, security, database
 * 
 * Key configurations:
 * - JWT tokens: 15m access, 7d refresh
 * - Rate limits: 100 requests/15min general, 10 auth requests/15min
 * - Pagination: 50 default, max 500 per page
 * - Email verification: 15 minutes expiry
 * - Password reset: 30 minutes expiry
 * - Security: Helmet, CORS, CSP headers enabled
 * 
 * All values read from .env file with sensible defaults
 * Prevents hardcoded magic numbers throughout codebase
 */

/**
 * Application Constants & Configuration
 * Centralized environment-based configuration to eliminate hardcoded values
 */

module.exports = {
    // URLs
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:5000',

    // CORS configuration
    ALLOWED_ORIGINS: (() => {
        const origins = (process.env.CORS_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
        if (origins.length === 0) {
            return [
                'http://localhost:5173',
                'http://localhost:5174',
                'http://localhost:5175',
                'http://localhost:3000',
                'http://127.0.0.1:5173',
                'http://127.0.0.1:5174',
                'http://127.0.0.1:5175',
                'http://127.0.0.1:3000'
            ];
        }
        return origins;
    })(),

    // API Configuration
    API_VERSION: 'v1',
    API_PREFIX: '/api',

    // Authentication
    JWT_ACCESS_EXPIRY: '15m',
    JWT_REFRESH_EXPIRY: '7d',
    JWT_ISSUER: 'eduzone-api',
    JWT_AUDIENCE: 'eduzone-frontend',

    // Password Reset
    PASSWORD_RESET_EXPIRY_MINUTES: 30,
    PASSWORD_RESET_MIN_RESPONSE_TIME_MS: 500,

    // Email Verification
    EMAIL_VERIFICATION_EXPIRY_MINUTES: 15,
    EMAIL_TIMEOUT_MS: parseInt(process.env.EMAIL_TIMEOUT || '10000', 10),
    EMAIL_RETRY_ENABLED: process.env.EMAIL_RETRY_ENABLED === 'true',
    EMAIL_RETRY_DELAY_MS: 2000,

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,  // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: 100,
    AUTH_RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
    AUTH_RATE_LIMIT_MAX_REQUESTS: 10,
    PASSWORD_RESET_RATE_LIMIT_WINDOW_MS: 60 * 60 * 1000,  // 1 hour
    PASSWORD_RESET_RATE_LIMIT_MAX_REQUESTS: 3,

    // Pagination
    DEFAULT_PAGE_LIMIT: 50,
    MIN_PAGE_LIMIT: 10,
    MAX_PAGE_LIMIT: 500,
    MAX_PAGE_NUMBER: 100000,

    // File Upload
    MAX_FILE_SIZE_MB: 50,
    MAX_JSON_PAYLOAD_MB: 10,

    // Database
    DB_NAME: process.env.DB_NAME || 'eduzone',
    DB_USER: process.env.DB_USER || 'root',
    DB_PASS: process.env.DB_PASS || '',
    DB_HOST: process.env.DB_HOST || '127.0.0.1',
    DB_PORT: parseInt(process.env.DB_PORT || '3306', 10),
    DB_DIALECT: process.env.DB_DIALECT || 'mysql',

    // Security Headers
    SECURITY_HEADERS_ENABLED: process.env.SECURITY_HEADERS_ENABLED !== 'false',
    CSP_ENABLED: process.env.CSP_ENABLED !== 'false',
    HSTS_MAX_AGE: 31536000,  // 1 year

    // Environment
    NODE_ENV: process.env.NODE_ENV || 'development',
    IS_PRODUCTION: (process.env.NODE_ENV || 'development') === 'production',

    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};
