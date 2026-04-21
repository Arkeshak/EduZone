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
    // Handle Multer file upload errors (e.g. file too large, wrong type)
    if (err.name === 'MulterError') {
        const messages = {
            LIMIT_FILE_SIZE: 'File is too large. Maximum allowed size is 20MB.',
            LIMIT_FILE_COUNT: 'Too many files uploaded.',
            LIMIT_UNEXPECTED_FILE: 'Unexpected file field.'
        };
        return res.status(400).json({
            success: false,
            message: messages[err.code] || `Upload error: ${err.message}`
        });
    }
    const { NODE_ENV } = require('../config/constants');

    const fs = require('fs');
    const logMsg = `[${new Date().toISOString()}] ${req.method} ${req.path} - ${err.message}\nStack: ${err.stack}\n\n`;
    try {
        fs.appendFileSync('global_error.log', logMsg);
    } catch (fsErr) {
        console.error('Failed to write to log file:', fsErr);
    }

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
