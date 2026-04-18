/**
 * AUTHENTICATION ROUTES
 * 
 * File Purpose: Defines all authentication-related API endpoints
 * Used for: User registration, login, password reset, token refresh, account verification
 * 
 * Key endpoints:
 * - POST /auth/register/donor - Register a new donor account
 * - POST /auth/login - Login with email/password
 * - POST /auth/verify - Verify email with verification code
 * - POST /auth/refresh - Get new access token using refresh token
 * - POST /auth/logout - Logout and invalidate tokens
 * - POST /auth/forgotpassword - Request password reset email
 * - PUT /auth/resetpassword/:token - Set new password with reset token
 * 
 * Security: All routes use express-validator for input validation
 *           Rate limiting prevents brute force attacks (10 requests per 15 mins)
 *           async handler wraps all handlers for centralized error handling
 */

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { registerDonor, verifyEmail, adminCreateUser, loginUser, getMe, deleteUser, forgotPassword, resetPassword, refreshTokenEndpoint, logoutUser, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate, validationRules } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 auth requests per `window`
    message: { message: "Too many login attempts from this IP, please try again after 15 minutes" }
});

// ✅ Integrated with validation and error handling
router.post('/register/donor', authLimiter, validationRules.donorRegistration(), validate, asyncHandler(registerDonor));
router.post('/verify', authLimiter, validationRules.emailVerification(), validate, asyncHandler(verifyEmail));
router.post('/admin/create-user', protect, validationRules.userCreation(), validate, asyncHandler(adminCreateUser));
router.post('/login', authLimiter, validationRules.login(), validate, asyncHandler(loginUser));
router.get('/me', protect, asyncHandler(getMe));
router.delete('/users/:id', protect, asyncHandler(deleteUser));
router.post('/forgotpassword', authLimiter, validationRules.forgotPassword(), validate, asyncHandler(forgotPassword));
router.put('/resetpassword/:resetToken', authLimiter, validationRules.passwordReset(), validate, asyncHandler(resetPassword));
router.put('/change-password', protect, validationRules.changePassword(), validate, asyncHandler(require('../controllers/authController').changePassword));
router.post('/activate-account', authLimiter, validationRules.accountActivation(), validate, asyncHandler(require('../controllers/authController').activateAccount));
router.post('/refresh', validationRules.tokenRefresh(), validate, asyncHandler(refreshTokenEndpoint));
router.post('/logout', protect, asyncHandler(logoutUser));
router.put('/profile', protect, validationRules.profileUpdate(), validate, asyncHandler(updateProfile));

module.exports = router;
