const express = require('express');
const router = express.Router();
const { createRequest, getRequests, updateStatus, getPublishedRequests, updateRequest, deleteRequest } = require('../controllers/welfareController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/published', getPublishedRequests); // Public
router.post('/', protect, authorize('teacher'), createRequest);
router.get('/', protect, getRequests);
router.patch('/:id/status', protect, authorize('principal', 'zeo'), updateStatus);
router.put('/:id', protect, authorize('teacher'), updateRequest);
router.delete('/:id', protect, authorize('teacher'), deleteRequest);

module.exports = router;
