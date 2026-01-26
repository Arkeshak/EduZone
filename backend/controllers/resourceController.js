const { Resource, Teacher, School } = require('../models');

// @desc    Upload a new resource (Teacher)
// @route   POST /api/resources
// @access  Private (Teacher)
const uploadResource = async (req, res) => {
    try {
        const { title, description, grade, subject, fileUrl } = req.body;

        // Fetch Teacher Profile to get School ID
        const teacherProfile = await Teacher.findOne({ where: { userId: req.user.id } });

        if (!teacherProfile) {
            return res.status(400).json({ message: 'Teacher profile not found.' });
        }

        const resource = await Resource.create({
            title,
            description,
            grade,
            subject,
            fileUrl,
            teacherId: teacherProfile.id,
            schoolId: teacherProfile.schoolId,
            status: 'Pending'
        });

        res.status(201).json(resource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all resources for ZEO approval
// @route   GET /api/resources/pending
// @access  Private (ZEO)
const getPendingResources = async (req, res) => {
    try {
        const resources = await Resource.findAll({
            where: { status: 'Pending' },
            order: [['createdAt', 'DESC']]
        });
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve or Reject Resource (ZEO)
// @route   PUT /api/resources/:id/status
// @access  Private (ZEO)
const updateResourceStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'Approved' or 'Rejected'
        const resource = await Resource.findByPk(req.params.id);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        resource.status = status;
        await resource.save();

        res.json({ message: `Resource ${status}`, resource });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Public Resources (Approved only)
// @route   GET /api/resources/public
// @access  Public
const getPublicResources = async (req, res) => {
    try {
        const { subject, grade, search } = req.query;
        let whereClause = { status: 'Approved' };

        if (subject && subject !== 'All') {
            whereClause.subject = subject;
        }
        if (grade && grade !== 'All') {
            whereClause.grade = grade;
        }

        // Basic search implementation
        if (search) {
            const { Op } = require('sequelize');
            whereClause.title = { [Op.like]: `%${search}%` };
        }

        const resources = await Resource.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });

        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    uploadResource,
    getPendingResources,
    updateResourceStatus,
    getPublicResources
};
