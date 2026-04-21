/**
 * DONATION ROUTES
 * 
 * File Purpose: Defines all donation processing endpoints
 * Used for: Donors submitting donations, admin verifying donations, tracking funds
 * 
 * Key endpoints:
 * - POST /donation - Submit donation to welfare request
 * - GET /donation - Get donation history (paginated)
 * - PATCH /donation/:id/verify - Verify payment and mark donation as confirmed
 * - GET /donation/:id - Get donation details
 * 
 * Workflow: Donor submits amount → Payment verification (check bank/payment gateway) → Fund transfer
 * Security: All monetary transactions require verification before moving funds
 */

const express = require('express');
const router = express.Router();
const { createDonation, getDonations, getStats, verifyDonation } = require('../controllers/donationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate, validationRules } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, upload.single('receipt'), validationRules.donation(), validate, asyncHandler(createDonation));
router.get('/', protect, validationRules.pagination(), asyncHandler(getDonations));
router.get('/stats', asyncHandler(getStats));
router.patch('/:id/verify', protect, authorize('ZEO'), validationRules.donationVerification(), validate, asyncHandler(verifyDonation));

module.exports = router;
