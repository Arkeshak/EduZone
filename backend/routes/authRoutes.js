const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { registerDonor, verifyEmail, adminCreateUser, loginUser, getMe, deleteUser, forgotPassword, resetPassword, refreshTokenEndpoint, logoutUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 auth requests per `window`
    message: { message: "Too many login attempts from this IP, please try again after 15 minutes" }
});

router.use(authLimiter);

router.post('/register/donor', registerDonor);
router.post('/verify', verifyEmail);
router.post('/admin/create-user', protect, adminCreateUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.delete('/users/:id', protect, deleteUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);
router.put('/change-password', protect, require('../controllers/authController').changePassword);
router.post('/activate-account', require('../controllers/authController').activateAccount);
router.post('/refresh', refreshTokenEndpoint);
router.post('/logout', protect, logoutUser);

module.exports = router;
