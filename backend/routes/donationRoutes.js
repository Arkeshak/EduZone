const express = require('express');
const router = express.Router();
const { createDonation, getDonations, getStats } = require('../controllers/donationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createDonation); // Assuming logged in donors for now
router.get('/', protect, getDonations);
router.get('/stats', getStats);

module.exports = router;
