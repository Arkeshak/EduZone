const WelfareRequest = require('../models/WelfareRequest');
const User = require('../models/User');

// @desc    Create new welfare request
// @route   POST /api/welfare
// @access  Private (Teacher)
const createRequest = async (req, res) => {
    try {
        const { studentName, grade, description, requirements, priority, category, cost, evidenceUrl } = req.body;

        const request = await WelfareRequest.create({
            teacherId: req.user.id,
            school: req.user.school, // Auto-assign school from teacher
            studentName,
            grade,
            description,
            requirements,
            priority,
            category,
            priority,
            category,
            cost,
            evidenceUrl
        });

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get requests
// @route   GET /api/welfare
// @access  Private
const getRequests = async (req, res) => {
    try {
        let requests;

        if (req.user.role === 'zeo') {
            // ZEO sees all requests
            requests = await WelfareRequest.findAll({ include: { model: User, as: 'teacher', attributes: ['name', 'email'] } });
        } else if (req.user.role === 'principal') {
            // Principal sees requests from their school
            requests = await WelfareRequest.findAll({
                where: { school: req.user.school },
                include: { model: User, as: 'teacher', attributes: ['name', 'email'] }
            });
        } else if (req.user.role === 'teacher') {
            // Teacher sees their own requests
            requests = await WelfareRequest.findAll({ where: { teacherId: req.user.id } });
        } else {
            // Donors see approved requests (mock logic for now, or all pending public ones)
            requests = await WelfareRequest.findAll({
                where: { status: 'Approved by ZEO' } // Only final approved shown to public
            });
        }

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update request status
// @route   PATCH /api/welfare/:id/status
// @access  Private (Principal/ZEO)
const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const request = await WelfareRequest.findByPk(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Role validation
        if (req.user.role === 'principal' && request.school !== req.user.school) {
            return res.status(403).json({ message: 'Not authorized for this school' });
        }

        // Audit: Track who approved it
        if (status === 'Approved by Principal') {
            request.approvedByPrincipalId = req.user.id;
        } else if (status === 'Approved by ZEO') {
            request.approvedByZEOId = req.user.id;
        }

        request.status = status;
        await request.save();

        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createRequest,
    getRequests,
    updateStatus
};
