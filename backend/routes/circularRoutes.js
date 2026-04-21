/**
 * CIRCULAR ROUTES
 * 
 * File Purpose: Manages official announcements/circulars from ZEOs to schools
 * Used for: Broadcasting notices, updates, policy changes to stakeholders
 * 
 * Key endpoints:
 * - POST /circular - Create circular (ZEO/admin only)
 * - GET /circular - List circulars (with pagination)
 * - GET /circular/:id - Get circular details
 * - PUT /circular/:id - Update circular (creator only)
 * - DELETE /circular/:id - Delete circular (ZEO only)
 * 
 * Features: File attachments, recipient tracking, acknowledgment system
 */

const express = require('express');
const router = express.Router();
const { publishCircular, getCirculars, updateCircular } = require('../controllers/circularController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, upload.single('attachment'), publishCircular);
router.get('/', protect, getCirculars);
router.put('/:id', protect, upload.single('attachment'), updateCircular);

module.exports = router;
