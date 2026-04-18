/**
 * FUND TRANSFER ROUTES
 * 
 * File Purpose: Manages fund transfer from donations to beneficiary schools/students
 * Used for: Tracking fund transfers, managing transfer schedules, verifying receipts
 * 
 * Key endpoints:
 * - POST /transfer - Initiate fund transfer
 * - GET /transfer - List transfers (paginated)
 * - GET /transfer/:id - Get transfer details
 * - PATCH /transfer/:id/status - Update transfer status
 * 
 * Workflow: Donation funds → Approved for transfer by ZEO → Bank transfer executed → Confirmed receipt
 * Security: Only ZEO can initiate transfers, audit trail maintained
 */

const express = require('express');
const router = express.Router();
const { initiateTransfer, getTransfers } = require('../controllers/transferController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, authorize('zeo'), upload.single('proof'), initiateTransfer);
router.get('/', protect, authorize('zeo', 'principal'), getTransfers);

module.exports = router;
