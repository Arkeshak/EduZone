/**
 * Input Sanitization Utility
 * Provides XSS protection through input sanitization
 */

const xss = require('xss');

/**
 * Sanitize all input types (body, query, params)
 */
const sanitizeInput = (req, res, next) => {
    try {
        // Sanitize body
        if (req.body && typeof req.body === 'object') {
            req.body = sanitizeObject(req.body);
        }

        // Sanitize query parameters
        if (req.query && typeof req.query === 'object') {
            Object.keys(req.query).forEach(key => {
                if (typeof req.query[key] === 'string') {
                    req.query[key] = xss(req.query[key], {
                        whiteList: {},
                        stripIgnoredTag: true,
                        stripLeadingAndTrailingWhitespace: true
                    });
                }
            });
        }

        // Sanitize URL parameters
        if (req.params && typeof req.params === 'object') {
            Object.keys(req.params).forEach(key => {
                if (typeof req.params[key] === 'string') {
                    req.params[key] = xss(req.params[key], {
                        whiteList: {},
                        stripIgnoredTag: true
                    });
                }
            });
        }

        next();
    } catch (err) {
        console.error('Sanitization error:', err);
        res.status(400).json({ message: 'Invalid input format' });
    }
};

/**
 * Recursively sanitize object properties
 */
const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized = Array.isArray(obj) ? [...obj] : { ...obj };

    Object.keys(sanitized).forEach(key => {
        if (typeof sanitized[key] === 'string') {
            // Sanitize strings with strict XSS rules
            sanitized[key] = xss(sanitized[key], {
                whiteList: {},  // No HTML allowed
                stripIgnoredTag: true,
                stripLeadingAndTrailingWhitespace: false
            });
        } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
            // Recursively sanitize nested objects
            sanitized[key] = sanitizeObject(sanitized[key]);
        }
    });

    return sanitized;
};

/**
 * Sanitize a single string value
 */
const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return xss(str, {
        whiteList: {},
        stripIgnoredTag: true
    });
};

module.exports = {
    sanitizeInput,
    sanitizeObject,
    sanitizeString
};
