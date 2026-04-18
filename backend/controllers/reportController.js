/**
 * REPORT CONTROLLER
 * 
 * File Purpose: Handles monthly school reports and analytics
 * Used for: Collecting school performance data, generating statistics and summaries
 * 
 * Key functions:
 * - submitReport() - Principal submits monthly school report (attendance, dropouts, etc.)
 * - getReports() - ZEO views all school reports
 * - getReportsByMonth() - Get reports for specific month
 * - getSchoolAnalytics() - School-specific statistics (welfare, donations)
 * 
 * Security: Principals can only submit for their school, ZEO can view all
 * Validation: No duplicate monthly reports allowed for same school/month
 */

const { MonthlyReport, School } = require('../models');

// @desc    Submit Monthly Report (Principal)
// @route   POST /api/reports
// @access  Private (PRINCIPAL)
const submitReport = async (req, res) => {
    try {
        let { 
            reportMonth, month, 
            avgAttendance, averageAttendance, 
            staffAttendance, dropoutCount, remarks 
        } = req.body;

        // Map frontend names to backend names if necessary
        if (!reportMonth && month) reportMonth = month;
        if (avgAttendance === undefined && averageAttendance !== undefined) avgAttendance = averageAttendance;

        // Ensure reportMonth is in YYYY-MM-DD format (if FE sends YYYY-MM)
        if (reportMonth && reportMonth.length === 7) {
            reportMonth = `${reportMonth}-01`;
        }

        if (req.user.role?.toUpperCase() !== 'PRINCIPAL') {
            return res.status(403).json({ message: 'Only Principals can submit reports.' });
        }

        const existingReport = await MonthlyReport.findOne({
            where: {
                reportMonth,
                schoolId: req.user.schoolId
            }
        });

        if (existingReport) {
            return res.status(400).json({ message: 'A report for this month already exists.' });
        }

        const report = await MonthlyReport.create({
            reportMonth,
            avgAttendance,
            staffAttendance,
            dropoutCount,
            remarks,
            schoolId: req.user.schoolId
        });

        res.status(201).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Reports (ZEO)
// @route   GET /api/reports
// @access  Private (ZEO)
const getReports = async (req, res) => {
    try {
        if (req.user.role?.toUpperCase() !== 'ZEO') {
            return res.status(403).json({ message: 'Not authorized.' });
        }

        const reports = await MonthlyReport.findAll({
            include: [{ model: School, as: 'school', attributes: ['name'] }],
            order: [['reportMonth', 'DESC']]
        });

        const formattedReports = reports.map(r => {
            const json = r.toJSON();
            return {
                ...json,
                month: json.reportMonth, // Map for FE
                averageAttendance: json.avgAttendance, // Map for FE
                schoolName: json.school?.name || 'Unknown School'
            };
        });

        res.json(formattedReports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get reports for own school (Principal)
const getMySchoolReports = async (req, res) => {
    try {
        const reports = await MonthlyReport.findAll({
            where: { schoolId: req.user.schoolId },
            order: [['reportMonth', 'DESC']]
        });

        const formattedReports = reports.map(r => {
            const json = r.toJSON();
            return {
                ...json,
                month: json.reportMonth, // Map for FE
                averageAttendance: json.avgAttendance // Map for FE
            };
        });

        res.json(formattedReports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    submitReport,
    getReports,
    getMySchoolReports
};
