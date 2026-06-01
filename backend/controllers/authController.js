/**
 * AUTHENTICATION CONTROLLER
 * 
 * File Purpose: Handles all authentication logic
 * Used for: User registration, login, password reset, email verification, token refresh
 * 
 * Key functions:
 * - registerDonor() - Create donor account with email verification
 * - loginUser() - Authenticate user and issue JWT tokens
 * - verifyEmail() - Verify account with 6-digit code
 * - refreshTokenEndpoint() - Issue new access token using refresh token
 * - forgotPassword() - Send password reset email
 * - resetPassword() - Set new password with reset token
 * - changePassword() - Change password for logged-in user
 * 
 * Security: Passwords hashed with bcrypt, JWTs signed with secrets, email verification required
 */

const crypto = require('crypto'); 
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcryptjs'); 
const { User, School, Teacher, Principal, Donor, PasswordReset } = require('../models'); 
const sendEmail = require('../utils/sendEmail'); 
const { JWT_ACCESS_EXPIRY, JWT_REFRESH_EXPIRY, JWT_ISSUER, JWT_AUDIENCE, PASSWORD_RESET_MIN_RESPONSE_TIME_MS } = require('../config/constants'); 

// ✅ Get JWT secrets from environment (required for token signing)
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
    throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET environment variables are required');
}

// Generate JWT Access Token (short-lived, minimal claims)
const generateAccessToken = (user) => {
    return jwt.sign({
        type: 'access',
        id: user.id,
        role: user.role,
        fullName: user.fullName || user.name,
        profilePicture: user.profilePicture
    }, ACCESS_TOKEN_SECRET, {
        expiresIn: JWT_ACCESS_EXPIRY,
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE
    });
};

// Generate Refresh Token (longer-lived)
const generateRefreshToken = (user) => {
    return jwt.sign({
        type: 'refresh',
        id: user.id
    }, REFRESH_TOKEN_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRY,
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE
    });
};

// Password Validation Helper
const validatePassword = (password) => {
    if (!password) return "Password is required.";
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    if (password.length < minLength) return "Password must be at least 8 characters long.";
    if (!hasUpperCase) return "Password must contain at least one uppercase letter.";
    if (!hasLowerCase) return "Password must contain at least one lowercase letter.";
    if (!hasNumber) return "Password must contain at least one number.";
    if (!hasSpecialChar) return "Password must contain at least one special character (!@#$%^&*).";

    return null;
};

/**
 * @desc    Register a new Donor
 * @route   POST /api/auth/donor/register
 * @access  Public
 * @details Validates password strength, creates a User record with ROLE='DONOR', 
 *          associates a Donor profile, generates a 6-digit verification code, 
 *          and sends an activation email.
 */
const registerDonor = async (req, res) => {
    const { name, email, password, phone, address, organizationName } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    // Validate Password
    const passwordError = validatePassword(password);
    if (passwordError) {
        return res.status(400).json({ success: false, message: passwordError });
    }

    const { sequelize } = require('../models');
    const transaction = await sequelize.transaction();

    try {
        const userExists = await User.findOne(
            { where: { email: cleanEmail } },
            { transaction }
        );
        if (userExists) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate 6-digit Verification Code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 Minutes

        const user = await User.create({
            fullName: name,
            email: cleanEmail,
            passwordHash: hashedPassword,
            role: 'DONOR',
            isVerified: false,
            activationToken: verificationCode,
            activationExpires: verificationExpires
        }, { transaction });

        // Create Profile
        await Donor.create({
            userId: user.id,
            organizationName: organizationName || name
        }, { transaction });

        // ✅ Send email BEFORE committing transaction
        let emailSent = false;
        try {
            const { EMAIL_TIMEOUT, EMAIL_RETRY_ENABLED, EMAIL_RETRY_DELAY_MS } = require('../config/constants');

            await sendEmail({
                email: user.email,
                subject: 'Verify Your EduZone Donor Account',
                message: `Your verification code is: ${verificationCode}`,
                html: `
                    <h2>Welcome to EduZone!</h2>
                    <p>Your verification code is: <strong>${verificationCode}</strong></p>
                    <p>This code expires in 15 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                `
            });
            emailSent = true;
        } catch (err) {
            console.error("Email send failed:", err.message);

            // ✅ Retry logic if enabled
            if (process.env.EMAIL_RETRY_ENABLED === 'true') {
                try {
                    console.log('Retrying email send...');
                    await new Promise(r => setTimeout(r, 2000));
                    await sendEmail({
                        email: user.email,
                        subject: 'Verify Your EduZone Donor Account',
                        message: `Your verification code is: ${verificationCode}`
                    });
                    emailSent = true;
                } catch (retryErr) {
                    console.error("Email retry failed:", retryErr.message);
                }
            }
        }

        if (!emailSent) {
            // ❌ Email failed - rollback entire transaction
            await transaction.rollback();

            return res.status(503).json({
                success: false,
                message: 'Email service temporarily unavailable. Please try again later.',
                code: 'EMAIL_SERVICE_ERROR',
                retryAfter: 300
            });
        }

        // ✅ Only commit if email succeeded
        await transaction.commit();

        res.status(201).json({
            success: true,
            message: 'Registration successful! Verification code sent to your email.',
            user: {
                id: user.id,
                name: user.fullName,
                role: user.role,
                email: cleanEmail
            },
            verificationCodeExpiry: 15
        });

    } catch (error) {
        if (transaction) await transaction.rollback();

        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.',
            code: 'REGISTRATION_ERROR'
        });
    }
};

/**
 * @desc    Admin/ZEO Create Staff (Teacher or Principal)
 * @route   POST /api/auth/staff/register
 * @access  Private (ZEO only)
 * @details Creates a User record with no password, creates the associated role profile 
 *          (Teacher or Principal), links to a School, and sends an email with a 
 *          secure reset token link so the staff can set their own password.
 */
const adminCreateUser = async (req, res) => {
    const { name, email, role, schoolId, subjects } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const upperRole = role.toUpperCase();

    if (req.user.role !== 'ZEO') return res.status(403).json({ message: 'Not authorized' });

    try {
        if (await User.findOne({ where: { email: cleanEmail } })) return res.status(400).json({ message: 'User exists' });

        // Logic check for principal
        if (upperRole === 'PRINCIPAL') {
            const existingPrincipal = await Principal.findOne({ where: { schoolId } });
            if (existingPrincipal) return res.status(400).json({ message: 'School already has a principal.' });
        }

        // Generate Activation Token
        const activationToken = crypto.randomBytes(32).toString('hex');
        const activationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Hours

        const user = await User.create({
            fullName: name,
            email: cleanEmail,
            passwordHash: '', // No password yet
            role: upperRole,
            isVerified: false,
            activationToken,
            activationExpires
        });

        // Create Profile based on role
        if (upperRole === 'TEACHER') {
            const newTeacher = await Teacher.create({ userId: user.id, schoolId });

            // Handle Subjects
            if (subjects && subjects.trim() !== '') {
                const { Subject } = require('../models');
                const subjectList = subjects.split(',').map(s => s.trim());

                for (const subName of subjectList) {
                    if (subName) {
                        const [subject] = await Subject.findOrCreate({ where: { name: subName } });
                        await newTeacher.addSubjects(subject);
                    }
                }
            }
        } else if (upperRole === 'PRINCIPAL') {
            await Principal.create({ userId: user.id, schoolId });
        }

        const activationUrl = `${process.env.FRONTEND_URL}/activate-account/${activationToken}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Activate Your EduZone Account',
                message: `
                    <h1>Welcome to EduZone</h1>
                    <p>You have been registered as a <strong>${upperRole}</strong>.</p>
                    <p>Please click the link below to activate your account and set your password:</p>
                    <a href="${activationUrl}">${activationUrl}</a>
                    <p>This link expires in 24 hours.</p>
                `
            });
        } catch (e) {
            console.error("Email failed", e);
        }

        res.status(201).json({ message: 'User created. Activation email sent.', email: user.email });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Activate Account & Set Initial Password
 * @route   POST /api/auth/activate
 * @access  Public (Requires valid activation token)
 * @details Verifies the activation token (from email link), validates and hashes 
 *          the new password, and marks the user as verified and active.
 */
const activateAccount = async (req, res) => {
    const { token, password } = req.body;

    const passwordError = validatePassword(password);
    if (passwordError) {
        return res.status(400).json({ message: passwordError });
    }

    try {
        const user = await User.findOne({
            where: {
                activationToken: token,
                activationExpires: { [require('sequelize').Op.gt]: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired activation token' });
        }

        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(password, salt);
        user.isVerified = true;
        user.isActive = true;
        user.activationToken = null;
        user.activationExpires = null;
        await user.save();

        res.status(200).json({ message: 'Account activated successfully. You can now login.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Login User
 * @route   POST /api/auth/login
 * @access  Public
 * @details Authenticates user credentials, validates email verification status, 
 *          retrieves role-specific profile data (like school affiliation), 
 *          and returns short-lived JWT accessToken alongside a 7-day refreshToken.
 */
const loginUser = async (req, res) => {
    let { email, password } = req.body;
    email = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
        console.log(`[LOGIN_ATTEMPT] Email: ${email}`);
        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log(`[LOGIN_FAIL] User not found for email: ${email}`);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(cleanPassword, user.passwordHash);
        console.log(`[LOGIN_CHECK] User: ${user.id} Role: ${user.role} Match: ${isMatch}`);

        if (user && isMatch) {
            if (!user.isVerified) {
                console.log(`[LOGIN_FAIL] User ${user.email} not verified`);
                return res.status(401).json({ success: false, message: 'Email not verified.' });
            }

            // Generate tokens (minimal claims for security)
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            // Store refresh token in DB
            user.refreshToken = refreshToken;
            await user.save();

            // Fetch profile-specific data
            let profile = null;
            let schoolName = null;
            let schoolId = null;

            if (user.role === 'TEACHER') {
                profile = await Teacher.findOne({
                    where: { userId: user.id },
                    include: [{ model: School, as: 'school' }]
                });
                schoolName = profile?.school?.name;
                schoolId = profile?.schoolId;
            } else if (user.role === 'PRINCIPAL') {
                profile = await Principal.findOne({
                    where: { userId: user.id },
                    include: [{ model: School, as: 'school' }]
                });
                schoolName = profile?.school?.name;
                schoolId = profile?.schoolId;
            } else if (user.role === 'DONOR') {
                profile = await Donor.findOne({ where: { userId: user.id } });
            }

            res.status(200).json({
                success: true,
                id: user.id,
                profileId: profile?.id,
                name: user.fullName,
                email: user.email,
                role: user.role,
                school: schoolName,
                schoolId: schoolId,
                profilePicture: user.profilePicture,
                token: accessToken,
                refreshToken: refreshToken
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        // Get user with full details
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['passwordHash', 'refreshToken', 'activationToken'] }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Fetch role-specific profile
        let profile = null;
        let schoolInfo = null;

        if (user.role === 'TEACHER') {
            profile = await Teacher.findOne({
                where: { userId: user.id },
                include: [
                    { model: School, as: 'school', attributes: ['id', 'name', 'address', 'division'] },
                    { model: require('../models').Subject, as: 'subjects', attributes: ['id', 'name'] }
                ]
            });
            schoolInfo = profile?.school;
        } else if (user.role === 'PRINCIPAL') {
            profile = await Principal.findOne({
                where: { userId: user.id },
                include: [{ model: School, as: 'school', attributes: ['id', 'name', 'address', 'division'] }]
            });
            schoolInfo = profile?.school;
        } else if (user.role === 'DONOR') {
            profile = await Donor.findOne({ where: { userId: user.id } });
        } else if (user.role === 'ZEO') {
            // Synthesis a profile object for ZEO to maintain frontend compatibility
            profile = {
                contactNumber: user.phoneNumber,
                address: user.address
            };
        }

        res.status(200).json({
            success: true,
            ...user.toJSON(),
            profile,
            school: schoolInfo
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        if (req.user.role !== 'ZEO') return res.status(403).json({ message: 'Not authorized' });
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'ZEO') return res.status(400).json({ message: 'Cannot delete ZEO' });
        await user.destroy();
        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot Password
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const { PASSWORD_RESET_MIN_RESPONSE_TIME_MS, PASSWORD_RESET_EXPIRY_MINUTES, FRONTEND_URL } = require('../config/constants');

    const startTime = Date.now();

    try {
        const user = await User.findOne({ where: { email: cleanEmail } });

        if (user) {
            // Generate Token
            const resetToken = crypto.randomBytes(32).toString('hex');
            const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
            const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000);

            await PasswordReset.create({
                userId: user.id,
                tokenHash,
                expiresAt
            });

            const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;

            const message = `
                <h1>Password Reset Request</h1>
                <p>You are receiving this email because you requested a password reset for your EduZone account.</p>
                <p>Please click on the link below to reset your password:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>This link expires in ${PASSWORD_RESET_EXPIRY_MINUTES} minutes.</p>
            `;

            try {
                await sendEmail({ email: user.email, subject: 'EduZone Password Reset', message });
            } catch (err) {
                console.error("Email send error:", err);
            }
        }

        // ✅ Enforce minimum response time (constant-time response to prevent email enumeration)
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < PASSWORD_RESET_MIN_RESPONSE_TIME_MS) {
            await new Promise(r => setTimeout(r, PASSWORD_RESET_MIN_RESPONSE_TIME_MS - elapsedTime));
        }

        // ✅ Always return same response regardless of whether user exists
        res.status(200).json({
            success: true,
            message: 'If an account with that email exists, a reset link has been sent.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
};

// @desc    Reset Password
const resetPassword = async (req, res) => {
    const tokenHash = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
    const { password } = req.body;

    // Validate Password
    const passwordError = validatePassword(password);
    if (passwordError) {
        return res.status(400).json({ message: passwordError });
    }

    try {
        const resetRecord = await PasswordReset.findOne({
            where: {
                tokenHash,
                used: false,
                expiresAt: { [require('sequelize').Op.gt]: new Date() }
            }
        });

        if (!resetRecord) return res.status(400).json({ message: 'Invalid or expired token' });

        const user = await User.findByPk(resetRecord.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Set new password
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(password, salt);
        await user.save();

        // Mark token as used
        resetRecord.used = true;
        await resetRecord.save();

        res.status(200).json({ success: true, data: 'Password updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Change Password (Authenticated)
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Validate New Password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
        return res.status(400).json({ message: passwordError });
    }

    try {
        const user = await User.findByPk(req.user.id);

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Email
const verifyEmail = async (req, res) => {
    const { email, code } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    try {
        const user = await User.findOne({
            where: {
                email: cleanEmail,
                activationToken: code,
                activationExpires: { [require('sequelize').Op.gt]: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        user.isVerified = true;
        user.isActive = true;
        user.activationToken = null;
        user.activationExpires = null;
        await user.save();

        const token = generateAccessToken(user, null); // Generate access token for auto-login if needed
        const refreshToken = generateRefreshToken(user);

        user.refreshToken = refreshToken;
        await user.save();

        res.status(200).json({ success: true, message: 'Email verified successfully', token, refreshToken });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Refresh Access Token
 * @route   POST /api/auth/refresh
 * @access  Public (Requires valid refresh token in body)
 * @details Validates the refresh token against the DB, verifies token type, 
 *          and issues a new access token.
 */
const refreshTokenEndpoint = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).json({ success: false, message: 'Refresh token is required' });
    }

    try {
        // ✅ Verify with REFRESH token secret
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

        // ✅ Verify it's actually a refresh token
        if (decoded.type !== 'refresh') {
            return res.status(401).json({ success: false, message: 'Invalid token type' });
        }

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        // ✅ Verify token matches DB record (prevents reuse after logout)
        if (user.refreshToken !== refreshToken) {
            return res.status(401).json({ success: false, message: 'Refresh token has been revoked' });
        }

        // Generate new Access Token
        const newAccessToken = generateAccessToken(user);

        res.status(200).json({
            success: true,
            token: newAccessToken
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Refresh token expired' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        }

        res.status(500).json({ success: false, message: 'Token refresh failed' });
    }
};

// @desc    Logout User
const logoutUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (user) {
            user.refreshToken = null;
            await user.save();
        }
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Update User Profile
 * @route   PUT /api/auth/profile
 * @access  Private
 * @details Allows users to update their profile information. 
 *          For donors, updates both User and Donor models.
 */
const updateProfile = async (req, res) => {
    const { fullName, organizationName, contactNumber, address } = req.body;
    const { sequelize } = require('../models');
    const transaction = await sequelize.transaction();

    try {
        const user = await User.findByPk(req.user.id, { transaction });
        if (!user) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update User fields
        if (fullName) user.fullName = fullName;
        if (contactNumber !== undefined) user.phoneNumber = contactNumber;
        if (address !== undefined) user.address = address;
        await user.save({ transaction });

        // Update Role-specific profile
        if (user.role === 'DONOR') {
            const donor = await Donor.findOne({ where: { userId: user.id }, transaction });
            if (donor) {
                if (organizationName !== undefined) donor.organizationName = organizationName;
                if (contactNumber !== undefined) donor.contactNumber = contactNumber;
                await donor.save({ transaction });
            }
        } else if (user.role === 'PRINCIPAL') {
            const principal = await Principal.findOne({ where: { userId: user.id }, transaction });
            if (principal) {
                if (contactNumber !== undefined) principal.contactNumber = contactNumber;
                await principal.save({ transaction });
            }
        } else if (user.role === 'TEACHER') {
            const teacher = await Teacher.findOne({ where: { userId: user.id }, transaction });
            if (teacher) {
                if (contactNumber !== undefined) teacher.contactNumber = contactNumber;
                if (address !== undefined) teacher.address = address;
                await teacher.save({ transaction });
            }
        }

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                fullName: user.fullName,
                role: user.role
            }
        });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Update Teacher Subjects (ZEO only)
 * @route   PUT /api/auth/admin/teacher-subjects/:userId
 * @access  Private (ZEO)
 */
const updateTeacherSubjects = async (req, res) => {
    if (req.user.role !== 'ZEO') return res.status(403).json({ message: 'Not authorized' });

    const { subjects } = req.body; // comma-separated string e.g. "English,Mathematics"
    const { userId } = req.params;

    try {
        const { Teacher, Subject, TeacherSubject } = require('../models');
        const teacher = await Teacher.findOne({ where: { userId } });
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

        // Clear existing subjects
        await TeacherSubject.destroy({ where: { teacherId: teacher.id } });

        // Assign new subjects
        if (subjects && subjects.trim() !== '') {
            const subjectList = subjects.split(',').map(s => s.trim()).filter(Boolean);
            for (const subName of subjectList) {
                const [subject] = await Subject.findOrCreate({ where: { name: subName } });
                await TeacherSubject.create({ teacherId: teacher.id, subjectId: subject.id });
            }
        }

        res.status(200).json({ success: true, message: 'Subjects updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Upload Profile Picture
 * @route   POST /api/auth/profile/picture
 * @access  Private
 */
const uploadProfilePicture = async (req, res) => {
    try {
        console.log('[PROFILE_PICTURE_UPLOAD] Starting upload for user:', req.user?.id);
        
        if (!req.file) {
            console.error('[PROFILE_PICTURE_UPLOAD] No file received in request');
            return res.status(400).json({ success: false, message: 'No file uploaded.' });
        }
        
        console.log('[PROFILE_PICTURE_UPLOAD] File received:', req.file.filename);

        const user = await User.findByPk(req.user.id);
        if (!user) {
            console.error('[PROFILE_PICTURE_UPLOAD] User not found for ID:', req.user.id);
            return res.status(404).json({ message: 'User not found' });
        }

        const oldPicture = user.profilePicture;
        user.profilePicture = `/uploads/${req.file.filename}`;
        
        console.log('[PROFILE_PICTURE_UPLOAD] Saving user profile_picture to:', user.profilePicture);
        await user.save();
        console.log('[PROFILE_PICTURE_UPLOAD] Save successful');

        res.status(200).json({
            success: true,
            message: 'Profile picture updated',
            profilePicture: user.profilePicture
        });
    } catch (error) {
        console.error('[PROFILE_PICTURE_UPLOAD] EXCEPTION:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal Server Error during upload',
            error: error.message 
        });
    }
};

module.exports = {
    registerDonor,
    verifyEmail,
    adminCreateUser,
    loginUser,
    getMe,
    deleteUser,
    forgotPassword,
    resetPassword,
    changePassword,
    activateAccount,
    refreshTokenEndpoint,
    logoutUser,
    updateProfile,
    updateTeacherSubjects,
    uploadProfilePicture
};
