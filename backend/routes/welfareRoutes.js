/**
 * WELFARE REQUEST ROUTES
 * 
 * File Purpose: Defines all welfare request management endpoints
 * Used for: Creating student welfare requests, approving, publishing, tracking funds
 * 
 * Key endpoints:
 * - POST /welfare - Create new welfare request (teachers only)
 * - GET /welfare - Get welfare requests (paginated, role-based)
 * - GET /welfare/published - Get published requests (public, for donors)
 * - PATCH /welfare/:id/status - Update request status (principal/ZEO approval workflow)
 * - PUT /welfare/:id - Update existing request (teachers only)
 * - DELETE /welfare/:id - Delete request (teachers only)
 * 
 * Workflow: Teacher creates → Principal approves → ZEO approves → Published for donors → Funded → Transferred
 * Access control: Teachers can only manage own requests, principals/ZEO can approve, public can view published
 */

const express = require('express');
const router = express.Router();
const { createRequest, getRequests, updateStatus, getPublishedRequests, updateRequest, deleteRequest } = require('../controllers/welfareController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate, validationRules } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

// ✅ Integrated with validation and error handling
router.get('/published', validationRules.pagination(), validate, asyncHandler(getPublishedRequests)); // Public
router.post('/', protect, authorize('TEACHER'), validationRules.welfareRequest(), validate, asyncHandler(createRequest));
router.get('/', protect, validationRules.pagination(), validate, asyncHandler(getRequests));
router.patch('/:id/status', protect, authorize('PRINCIPAL', 'ZEO'), validationRules.welfareStatus(), validate, asyncHandler(updateStatus));
router.put('/:id', protect, authorize('TEACHER'), validationRules.welfareRequest(), validate, asyncHandler(updateRequest));
router.delete('/:id', protect, authorize('TEACHER'), asyncHandler(deleteRequest));

module.exports = router;
