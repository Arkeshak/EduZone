const { MonthlyReport, School } = require('../models');

// @desc    Submit Monthly Report (Principal)
// @route   POST /api/reports
// @access  Private (PRINCIPAL)
const submitReport = async (req, res) => {
    try {
        const { reportMonth, avgAttendance, staffAttendance, dropoutCount, remarks } = req.body;

        if (req.user.role !== 'PRINCIPAL') {
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
        if (req.user.role !== 'ZEO') {
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
                month: json.reportMonth,
                averageAttendance: json.avgAttendance,
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
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    submitReport,
    getReports,
    getMySchoolReports
};
