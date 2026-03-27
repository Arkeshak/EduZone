const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, School, Teacher, Principal, Donor, PasswordReset } = require('../models');
const sendEmail = require('../utils/sendEmail');

// Generate JWT Access Token
const generateAccessToken = (user, profile) => {
    return jwt.sign({
        id: user.id,
        role: user.role,
        name: user.fullName,
        email: user.email,
        profileId: profile ? profile.id : null,
        schoolId: (user.role === 'TEACHER' || user.role === 'PRINCIPAL') ? profile?.schoolId : null,
        school: (profile && profile.school) ? profile.school.name : null
    }, process.env.JWT_SECRET, {
        expiresIn: '15m', // Short-lived access token
    });
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
    return jwt.sign({
        id: user.id,
    }, process.env.JWT_SECRET, {
        expiresIn: '7d', // Longer-lived refresh token
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
        return res.status(400).json({ message: passwordError });
    }

    try {
        const userExists = await User.findOne({ where: { email: cleanEmail } });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

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
            activationToken: verificationCode, // Reuse activationToken for verification code
            activationExpires: verificationExpires
        });

        // Create Profile
        await Donor.create({
            userId: user.id,
            organizationName: organizationName || name
        });

        try {
            await sendEmail({
                email: user.email,
                subject: 'Verify Your EduZone Donor Account',
                message: `Your verification code is: ${verificationCode}`
            });
        } catch (e) {
            console.error("Email failed", e);
            // We still proceed, but user might need to resend. 
            // Ideally we handle this better but for now log it.
        }

        res.status(201).json({
            message: 'Registration successful! Please verify your email.',
            user: { id: user.id, name: user.fullName, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
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
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(cleanPassword, user.passwordHash);
        console.log(`[LOGIN_CHECK] User: ${user.id} Role: ${user.role} Match: ${isMatch}`);

        if (user && isMatch) {
            if (!user.isVerified) {
                console.log(`[LOGIN_FAIL] User ${user.email} not verified`);
                return res.status(401).json({ message: 'Email not verified.' });
            }

            // Fetch Profile based on role
            let profile = null;
            let schoolName = null;

            if (user.role === 'TEACHER') {
                profile = await Teacher.findOne({
                    where: { userId: user.id },
                    include: [{ model: School, as: 'school' }]
                });
                schoolName = profile?.school?.name;
            } else if (user.role === 'PRINCIPAL') {
                profile = await Principal.findOne({
                    where: { userId: user.id },
                    include: [{ model: School, as: 'school' }]
                });
                schoolName = profile?.school?.name;
            } else if (user.role === 'DONOR') {
                profile = await Donor.findOne({ where: { userId: user.id } });
            }

            const accessToken = generateAccessToken(user, profile);
            const refreshToken = generateRefreshToken(user);

            // Store refresh token in DB
            user.refreshToken = refreshToken;
            await user.save();

            res.json({
                id: user.id,
                profileId: profile?.id,
                name: user.fullName,
                email: user.email,
                role: user.role,
                school: schoolName,
                schoolId: (user.role === 'TEACHER' || user.role === 'PRINCIPAL') ? profile?.schoolId : null,
                token: accessToken,
                refreshToken: refreshToken
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMe = async (req, res) => {
    res.status(200).json(req.user);
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

    try {
        const user = await User.findOne({ where: { email: cleanEmail } });

        if (!user) {
            return res.status(200).json({ success: true, data: 'If an account with that email exists, a reset link has been sent.' });
        }

        // Generate Token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 Minutes

        await PasswordReset.create({
            userId: user.id,
            tokenHash,
            expiresAt
        });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        const message = `
            <h1>Password Reset Request</h1>
            <p>You are receiving this email because you requested a password reset for your EduZone account.</p>
            <p>Please click on the link below to reset your password:</p>
            <a href="${resetUrl}">${resetUrl}</a>
        `;

        try {
            await sendEmail({ email: user.email, subject: 'EduZone Password Reset', message });
            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (err) {
            console.error("Email send error:", err);
            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
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
 * @details Validates the refresh token against the DB, rotates the token for security, 
 *          re-loads user profile claims, and issues new access and refresh tokens.
 */
const refreshTokenEndpoint = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh Token required' });

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) return res.status(403).json({ message: 'Invalid refresh token' });

        // Ensure token matches what's in DB (prevents reuse after logout or another device login)
        if (user.refreshToken !== refreshToken) {
            return res.status(403).json({ message: 'Refresh token has been revoked' });
        }

        // Generate profile context based on role if needed for claims
        let profile = null;
        if (user.role === 'TEACHER') profile = await require('../models').Teacher.findOne({ where: { userId: user.id }, include: ['school'] });
        else if (user.role === 'PRINCIPAL') profile = await require('../models').Principal.findOne({ where: { userId: user.id }, include: ['school'] });
        else if (user.role === 'DONOR') profile = await require('../models').Donor.findOne({ where: { userId: user.id } });

        const newAccessToken = generateAccessToken(user, profile);
        const newRefreshToken = generateRefreshToken(user); // Rotate token

        user.refreshToken = newRefreshToken;
        await user.save();

        res.json({ token: newAccessToken, refreshToken: newRefreshToken });
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired refresh token' });
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
    logoutUser
};
