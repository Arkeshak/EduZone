const express = require('express');
const router = express.Router();
const { registerDonor, verifyEmail, adminCreateUser, loginUser, getMe, deleteUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register/donor', registerDonor);
router.post('/verify', verifyEmail);
router.post('/admin/create-user', protect, adminCreateUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.delete('/users/:id', protect, deleteUser);

module.exports = router;
