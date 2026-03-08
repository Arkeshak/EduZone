const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { User, Principal, Teacher, Donor } = require('../models');

const logAuth = (msg) => {
    const logPath = path.join(__dirname, '../auth_debug.log');
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`);
};

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const userModel = await User.findByPk(decoded.id, {
                attributes: { exclude: ['passwordHash'] }
            });

            if (!userModel) {
                console.error(`[PROTECT] User not found for ID ${decoded.id}`);
                return res.status(401).json({ message: 'User not found in DB' });
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
            console.error("[PROTECT] ERROR:", error.message);
            return res.status(401).json({ message: 'Authentication failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'No authorization token provided' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            logAuth(`DENIED: req.user missing`);
            return res.status(403).json({ message: "FORBIDDEN: User session missing" });
        }

        if (!req.user.role) {
            logAuth(`DENIED: Role missing for user ${req.user.id}`);
            return res.status(403).json({ message: "FORBIDDEN: User role not found" });
        }

        const userRole = req.user.role.trim().toUpperCase();
        const allowedRoles = roles.map(r => r.trim().toUpperCase());

        logAuth(`ID:${req.user.id} Role:"${userRole}" vs Allowed:${JSON.stringify(allowedRoles)}`);

        if (!allowedRoles.includes(userRole)) {
            logAuth(`DENIED: "${userRole}" not in ${JSON.stringify(allowedRoles)}`);
            return res.status(403).json({
                message: `FORBIDDEN: Role ${userRole} is not authorized. Requires: ${allowedRoles.join('/')}`
            });
        }
        return next();
    };
};

module.exports = { protect, authorize };
