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
const { 
    submitReport, 
    getReports, 
    getMySchoolReports, 
    getZeoAnalytics,
    updateReport 
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('PRINCIPAL'), submitReport);
router.get('/', protect, getReports);
router.get('/my-school', protect, authorize('PRINCIPAL'), getMySchoolReports);
router.get('/analytics', protect, authorize('ZEO'), getZeoAnalytics);
router.put('/:id', protect, authorize('PRINCIPAL'), updateReport);

module.exports = router;
