/**
 * REPORT ROUTES
 * 
 * File Purpose: Provides analytics and reporting endpoints
 * Used for: Generating monthly reports, dashboards, statistics
 * 
 * Key endpoints:
 * - GET /report/monthly - Get monthly summary (donations, transfers, welfare)
 * - GET /report/dashboard - Get dashboard statistics
 * - GET /report/school/:schoolId - School-specific report
 * - GET /report/export - Export data to CSV/PDF
 * 
 * Data provided: Fund flow, welfare coverage, donor statistics, school performance
 */

const express = require('express');
const router = express.Router();
const { submitReport, getReports, getMySchoolReports } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, submitReport);
router.get('/', protect, getReports);
router.get('/my-school', protect, getMySchoolReports);

module.exports = router;
