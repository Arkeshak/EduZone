const express = require('express');
const router = express.Router();
const { createRequest, getRequests, updateStatus } = require('../controllers/welfareController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('teacher'), createRequest);
router.get('/', protect, getRequests);
router.patch('/:id/status', protect, authorize('principal', 'zeo'), updateStatus);

module.exports = router;
