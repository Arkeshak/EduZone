const express = require('express');
const router = express.Router();
const { createDonation, getDonations, getStats, verifyDonation } = require('../controllers/donationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, upload.single('receipt'), createDonation);
router.get('/', protect, getDonations);
router.get('/stats', getStats);
router.patch('/:id/verify', protect, authorize('zeo'), verifyDonation);


module.exports = router;
