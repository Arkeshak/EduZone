/**
 * SCHOOL ROUTES
 * 
 * File Purpose: Defines school/institution management endpoints
 * Used for: Managing school info, teachers, principals, and organizational structure
 * 
 * Key endpoints:
 * - GET /school - List all schools
 * - POST /school - Create new school (ZEO only)
 * - GET /school/:id - Get school details
 * - PUT /school/:id - Update school info (principal/ZEO)
 * - DELETE /school/:id - Delete school (ZEO only)
 * 
 * Data managed: School name, address, principal, teachers, students, contact info
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getSchools, getSchoolUsers, getMySchool, updateMySchool } = require('../controllers/schoolController');
const { validate, validationRules } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

router.get('/', validationRules.pagination(), validate, asyncHandler(getSchools));
router.get('/users', validationRules.pagination(), validate, asyncHandler(getSchoolUsers));
router.get('/my-school', protect, asyncHandler(getMySchool));
router.put('/my-school', protect, validationRules.schoolUpdate(), validate, asyncHandler(updateMySchool));

module.exports = router;
