/**
 * AUTHENTICATION & AUTHORIZATION MIDDLEWARE
 * 
 * File Purpose: Verifies JWT tokens and enforces role-based access control
 * Used for: Protecting routes, validating identity, checking permissions
 * 
 * Key functions:
 * - protect() - Middleware that verifies JWT token is valid
 *              Extracts user from token, loads user profile and school ID
 *              Returns 401 if token missing/invalid/expired
 * - authorize(...roles) - Middleware that checks if user has required role
 *                         Used as authorize('TEACHER', 'PRINCIPAL') to restrict endpoints
 *                         Returns 403 if user role not in allowed list
 * 
 * Token types: ACCESS tokens (15min) verified here, REFRESH tokens (7days) blocked
 * User profiles: Teachers/Principals have schoolId attached, Donors have profileId
 */

const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { User, Principal, Teacher, Donor } = require('../models');

// Get JWT secrets from environment
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;

if (!ACCESS_TOKEN_SECRET) {
    throw new Error('JWT_ACCESS_SECRET environment variable is required');
}

const logAuth = (msg) => {
    const logPath = path.join(__dirname, '../auth_debug.log');
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`);
};

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // ✅ Verify with ACCESS token secret
            const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

            // ✅ Verify it's an access token (not a refresh token)
            if (decoded.type !== 'access') {
                console.error('[PROTECT] Invalid token type:', decoded.type);
                return res.status(401).json({ success: false, message: 'Invalid token type' });
            }

            const userModel = await User.findByPk(decoded.id, {
                attributes: { exclude: ['passwordHash', 'refreshToken'] }
            });

            if (!userModel) {
                console.error(`[PROTECT] User not found for ID ${decoded.id}`);
                return res.status(401).json({ success: false, message: 'User not found in DB' });
            }

            req.user = userModel.get({ plain: true });

            // Attach profile info
            const rawRole = req.user.role || '';
            const upperRole = rawRole.trim().toUpperCase();

            if (upperRole === 'PRINCIPAL') {
                const profile = await Principal.findOne({ where: { userId: req.user.id } });
                if (profile) {
                    req.user.schoolId = profile.schoolId;
                    req.user.profileId = profile.id;
                }
            } else if (upperRole === 'TEACHER') {
                const profile = await Teacher.findOne({ where: { userId: req.user.id } });
                if (profile) {
                    req.user.schoolId = profile.schoolId;
                    req.user.profileId = profile.id;
                }
            } else if (upperRole === 'DONOR') {
                const profile = await Donor.findOne({ where: { userId: req.user.id } });
                if (profile) req.user.profileId = profile.id;
            }

            return next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ success: false, message: 'Token expired' });
            } else if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ success: false, message: 'Invalid token' });
            }

            console.error("[PROTECT] ERROR:", error.message);
            return res.status(401).json({ success: false, message: 'Authentication failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'No authorization token provided' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            logAuth(`DENIED: req.user missing`);
            return res.status(403).json({ success: false, message: "FORBIDDEN: User session missing" });
        }

        if (!req.user.role) {
            logAuth(`DENIED: Role missing for user ${req.user.id}`);
            return res.status(403).json({ success: false, message: "FORBIDDEN: User role not found" });
        }

        const userRole = req.user.role.trim().toUpperCase();
        const allowedRoles = roles.map(r => r.trim().toUpperCase());

        logAuth(`ID:${req.user.id} Role:"${userRole}" vs Allowed:${JSON.stringify(allowedRoles)}`);

        if (!allowedRoles.includes(userRole)) {
            logAuth(`DENIED: "${userRole}" not in ${JSON.stringify(allowedRoles)}`);
            return res.status(403).json({
                success: false,
                message: `FORBIDDEN: Role ${userRole} is not authorized. Requires: ${allowedRoles.join('/')}`
            });
        }
        return next();
    };
};

module.exports = { protect, authorize };
