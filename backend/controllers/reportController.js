const { MonthlyReport, Principal, School } = require('../models');

// @desc    Submit Monthly Report (Principal)
// @route   POST /api/reports
// @access  Private (Principal)
const submitReport = async (req, res) => {
    try {
        const { month, averageAttendance, staffAttendance, dropoutCount, remarks } = req.body;

        // Check if report already exists for this month and school
        // For simplicity, we just create it using the User's info directly

        const report = await MonthlyReport.create({
            month,
            averageAttendance,
            staffAttendance,
            dropoutCount,
            remarks,
            authorId: req.user.id, // Changed from principalId to generic authorId or userId depending on model
            schoolName: req.user.school // Storing name directly for now as we don't have a robust School ID system active
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
        if (req.user.role !== 'zeo') {
            return res.status(403).json({ message: 'Not authorized.' });
        }

        const reports = await MonthlyReport.findAll({
            include: [{ model: School, as: 'school', attributes: ['name'] }],
            order: [['createdAt', 'DESC']]
        });

        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    submitReport,
    getReports
};
