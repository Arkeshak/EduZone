const express = require('express');
const router = express.Router();
const { uploadResource, getPendingResources, updateResourceStatus, getPublicResources } = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');

// Public Route
router.get('/public', getPublicResources);

// Protected Routes
router.post('/', protect, uploadResource); // Teacher upload
router.get('/pending', protect, getPendingResources); // ZEO view pending
router.put('/:id/status', protect, updateResourceStatus); // ZEO approve/reject

module.exports = router;
