/**
 * Async Request Handler Wrapper
 * Ensures async errors are caught and passed to error handler middleware
 */

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Express Error Handler Middleware
 * Centralized error handling for all routes
 */
const errorHandler = (err, req, res, next) => {
    const { NODE_ENV } = require('../config/constants');

    console.error('[ERROR]', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // Default error response
    const status = err.status || err.statusCode || 500;
    const message = NODE_ENV === 'production'
        ? (status === 500 ? 'Internal server error' : err.message)
        : err.message;

    res.status(status).json({
        success: false,
        message,
        ...(NODE_ENV !== 'production' && {
            stack: err.stack,
            details: err.details
        })
    });
};

module.exports = {
    asyncHandler,
    errorHandler
};
