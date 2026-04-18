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
const { publishCircular, getCirculars } = require('../controllers/circularController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, publishCircular);
router.get('/', protect, getCirculars);

module.exports = router;
