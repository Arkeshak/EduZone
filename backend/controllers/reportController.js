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

        // Prevent submission for future months
        const selectedDate = new Date(reportMonth);
        const currentDate = new Date();
        currentDate.setDate(1);
        currentDate.setHours(0, 0, 0, 0);

        if (selectedDate > currentDate) {
            return res.status(400).json({ message: 'Cannot submit a report for a future month.' });
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

        res.status(201).json({
            success: true,
            data: report
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get All Reports (ZEO)
// @route   GET /api/reports
// @access  Private (ZEO)
const getReports = async (req, res) => {
    try {
        if (req.user.role?.toUpperCase() !== 'ZEO') {
            return res.status(403).json({ success: false, message: 'Not authorized.' });
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

        res.status(200).json({
            success: true,
            data: formattedReports
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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

        res.status(200).json({
            success: true,
            data: formattedReports
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getZeoAnalytics = async (req, res) => {
    try {
        const { WelfareRequest, Donation } = require('../models');
        const { Op } = require('sequelize');

        // Helper to get array of past 6 month names
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const past6Months = [];
        const date = new Date();
        date.setDate(1); // Set to 1st to avoid end-of-month bugs
        for (let i = 5; i >= 0; i--) {
            const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
            past6Months.push({
                name: monthNames[d.getMonth()],
                yearMonth: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            });
        }

        const sixMonthsAgo = new Date(date.getFullYear(), date.getMonth() - 5, 1);

        // 1. Fetch Welfare Requests
        const welfareRequests = await WelfareRequest.findAll({
            where: { createdAt: { [Op.gte]: sixMonthsAgo } },
            attributes: ['id', 'status', 'createdAt']
        });

        // 2. Fetch Donations - CHANGED: use 'VERIFIED' status as found in DB
        const donations = await Donation.findAll({
            where: { 
                createdAt: { [Op.gte]: sixMonthsAgo },
                status: 'VERIFIED'
            },
            attributes: ['id', 'amount', 'createdAt']
        });

        // Loop and populate chart data
        const requestsDataMap = {};
        const donationDataMap = {};
        
        past6Months.forEach(m => {
            requestsDataMap[m.yearMonth] = { name: m.name, approved: 0, rejected: 0, pending: 0 };
            donationDataMap[m.yearMonth] = { name: m.name, amount: 0 };
        });

        welfareRequests.forEach(req => {
            const d = new Date(req.createdAt);
            const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (requestsDataMap[ym]) {
                const s = req.status;
                if (s === 'REJECTED') {
                    requestsDataMap[ym].rejected += 1;
                } else if (s === 'SUBMITTED') {
                    requestsDataMap[ym].pending += 1;
                } else {
                    requestsDataMap[ym].approved += 1;
                }
            }
        });

        donations.forEach(don => {
            const d = new Date(don.createdAt);
            const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (donationDataMap[ym]) {
                donationDataMap[ym].amount += Number(don.amount) || 0;
            }
        });

        const requestsData = Object.values(requestsDataMap);
        const donationData = Object.values(donationDataMap);

        // 3. School Performance Summary
        const latestReports = await MonthlyReport.findAll({
            include: [{ model: School, as: 'school', attributes: ['name'] }],
            order: [['reportMonth', 'DESC']]
        });
        
        const schoolMap = {};
        latestReports.forEach(r => {
            if (!schoolMap[r.schoolId] && r.school) {
                schoolMap[r.schoolId] = {
                    name: r.school.name,
                    passRate: Number(r.staffAttendance || 0),
                    attendance: Number(r.avgAttendance || 0)
                };
            }
        });

        const schoolPerformanceData = Object.values(schoolMap).slice(0, 5);

        res.status(200).json({
            success: true,
            data: {
                requestsData,
                donationData,
                schoolPerformanceData
            }
        });
    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Monthly Report (Principal)
// @route   PUT /api/reports/:id
// @access  Private (PRINCIPAL)
const updateReport = async (req, res) => {
    try {
        const { id } = req.params;
        let { 
            avgAttendance, averageAttendance, 
            staffAttendance, dropoutCount, remarks 
        } = req.body;

        // Map frontend names to backend names if necessary
        if (avgAttendance === undefined && averageAttendance !== undefined) avgAttendance = averageAttendance;

        const report = await MonthlyReport.findByPk(id);

        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found.' });
        }

        // Verify ownership
        if (report.schoolId !== req.user.schoolId) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this report.' });
        }

        // Update fields
        if (avgAttendance !== undefined) report.avgAttendance = avgAttendance;
        if (staffAttendance !== undefined) report.staffAttendance = staffAttendance;
        if (dropoutCount !== undefined) report.dropoutCount = dropoutCount;
        if (remarks !== undefined) report.remarks = remarks;

        await report.save();

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    submitReport,
    getReports,
    getMySchoolReports,
    getZeoAnalytics,
    updateReport
};
