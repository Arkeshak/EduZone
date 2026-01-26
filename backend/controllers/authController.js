const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, School, Teacher, Principal, Donor } = require('../models');
const sendEmail = require('../utils/sendEmail');

// Generate JWT
const generateToken = (user, profile) => {
    return jwt.sign({
        id: user.id,
        role: user.role,
        name: user.name,
        schoolId: profile ? profile.schoolId : null // Get schoolId from profile
    }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a Donor
const registerDonor = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ where: { email } });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationTokenExpire = new Date(Date.now() + 10 * 60 * 1000);

        const user = await User.create({
            name, email, password: hashedPassword, role: 'donor',
            isVerified: false, verificationToken: verificationCode, verificationTokenExpire
        });

        // Create Profile
        await Donor.create({ userId: user.id, organizationName: name });

        const message = `Your verification code is: ${verificationCode}`;
        try {
            await sendEmail({ email: user.email, subject: 'EduZone Email Verification', message });
            res.status(201).json({ message: 'Registration successful! Verification code sent.' });
        } catch (emailError) {
            await user.destroy(); // Rollback
            res.status(500).json({ message: 'Failed to send email.' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Donor Email (Same logic, mostly)
const verifyEmail = async (req, res) => {
    const { email, code } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ message: 'Invalid email' });
        if (user.isVerified) return res.status(200).json({ message: 'Already verified' });
        if (user.verificationToken !== code || user.verificationTokenExpire < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired code' });
        }

        user.isVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpire = null;
        await user.save();

        const profile = await Donor.findOne({ where: { userId: user.id } });
        res.status(200).json({ message: 'Verified!', token: generateToken(user, profile) });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin Create Staff
const adminCreateUser = async (req, res) => {
    const { name, email, role, schoolId, subjects } = req.body;

    if (req.user.role !== 'zeo') return res.status(403).json({ message: 'Not authorized' });

    try {
        if (await User.findOne({ where: { email } })) return res.status(400).json({ message: 'User exists' });

        // Logic check for principal
        if (role === 'principal') {
            const existingPrincipal = await Principal.findOne({ where: { schoolId } });
            if (existingPrincipal) return res.status(400).json({ message: 'School already has a principal.' });
        }

        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const user = await User.create({
            name, email, password: hashedPassword, role, isVerified: true
        });

        // Create Profile based on role
        if (role === 'teacher') {
            await Teacher.create({ userId: user.id, schoolId, subjects: subjects || [] });
        } else if (role === 'principal') {
            await Principal.create({ userId: user.id, schoolId });
        }

        // Email logic (simplified for brevity, keep original logging/sending)
        try {
            await sendEmail({
                email: user.email,
                subject: 'EduZone Staff Account',
                message: `Role: ${role}\nTemp Password: ${tempPassword}\nLogin: http://localhost:5173/login`
            });
        } catch (e) {
            console.error("Email failed", e);
        }

        res.status(201).json({ message: 'User created', email: user.email, tempPassword });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login User
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (user && (await bcrypt.compare(password, user.password))) {
            if (!user.isVerified) return res.status(401).json({ message: 'Email not verified.' });

            // Fetch Profile based on role
            let profile = null;
            let schoolName = null;

            if (user.role === 'teacher') {
                profile = await Teacher.findOne({ where: { userId: user.id }, include: [{ model: School, as: 'schoolData' }] });
                schoolName = profile?.schoolData?.name;
            } else if (user.role === 'principal') {
                profile = await Principal.findOne({ where: { userId: user.id }, include: [{ model: School, as: 'schoolData' }] });
                schoolName = profile?.schoolData?.name;
            } else if (user.role === 'donor') {
                profile = await Donor.findOne({ where: { userId: user.id } });
            }

            res.json({
                id: user.id, // User ID
                profileId: profile?.id, // Profile ID (Useful for FKs)
                name: user.name,
                email: user.email,
                role: user.role,
                school: schoolName, // For frontend display
                schoolId: profile?.schoolId, // For logic
                token: generateToken(user, profile)
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
    // Keep existing deletion logic (Cascade will handle profile deletion)
    try {
        if (req.user.role !== 'zeo') return res.status(403).json({ message: 'Not authorized' });
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'zeo') return res.status(400).json({ message: 'Cannot delete ZEO' });
        await user.destroy();
        res.json({ message: 'User removed' });
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
    deleteUser
};
