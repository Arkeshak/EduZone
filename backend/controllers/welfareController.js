const { WelfareRequest, User, Teacher, Student, School, Notification, WelfareApproval, sequelize } = require('../models');
const fs = require('fs');
const path = require('path');



/**
 * @desc    Create a new welfare request (Teacher)
 * @route   POST /api/welfare
 * @access  Private (Teacher)
 * @details Looks up teacher profile, finds or creates the student record within the school,
 *          and initializes a new WelfareRequest with status 'SUBMITTED'. Uses DB transactions.
 */
const createRequest = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        let { fullName, studentName, grade, description, priority, category, amountRequired, cost, section } = req.body;

        // Frontend compatibility mappings
        if (!fullName) fullName = studentName;
        if (!amountRequired) amountRequired = cost;

        // Find Teacher Profile
        const teacher = await Teacher.findOne({ where: { userId: req.user.id }, transaction });
        if (!teacher) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Teacher profile not found' });
        }

        // Check if student exists in this school
        let student = await Student.findOne({
            where: {
                fullName: fullName,
                schoolId: teacher.schoolId
            },
            transaction
        });

        // If not, create new student
        if (!student) {
            student = await Student.create({
                fullName: fullName,
                grade: grade,
                section: section,
                schoolId: teacher.schoolId
            }, { transaction });
        } else {
            // Optional: Update grade/section if changed
            student.grade = grade;
            if (section) student.section = section;
            await student.save({ transaction });
        }

        const request = await WelfareRequest.create({
            teacherId: teacher.id,
            schoolId: teacher.schoolId,
            studentId: student.id,
            description,
            priority: priority ? priority.toUpperCase() : 'MEDIUM',
            category,
            amountRequired,
            status: 'SUBMITTED'
        }, { transaction });

        await transaction.commit();
        res.status(201).json(request);
    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get welfare requests based on user role
 * @route   GET /api/welfare
 * @access  Private
 * @details Dynamically scopes data: ZEO sees all (filterable), Principals see their school, 
 *          Teachers see their own creations, Donors/Public see verified/published listings. 
 *          Includes pagination logic.
 */
const getRequests = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10);
        const limit = parseInt(req.query.limit, 10) || 100;
        const offset = page ? (page - 1) * limit : 0;

        let result;
        const includeOptions = [
            {
                model: Teacher,
                as: 'teacher',
                include: [{ model: User, as: 'user', attributes: ['fullName', 'email'] }]
            },
            { model: Student, as: 'student', attributes: ['fullName', 'grade'] },
            { model: School, as: 'school', attributes: ['id', 'name'] }
        ];

        let queryOptions = {
            include: includeOptions,
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        };

        const upperRole = (req.user?.role || '').toUpperCase();

        if (upperRole === 'ZEO') {
            const { schoolId } = req.query;
            if (schoolId) queryOptions.where = { schoolId };
            result = await WelfareRequest.findAndCountAll(queryOptions);
        } else if (upperRole === 'PRINCIPAL') {

            queryOptions.where = { schoolId: req.user.schoolId };
            result = await WelfareRequest.findAndCountAll(queryOptions);
        } else if (upperRole === 'TEACHER') {
            const teacherProfile = await Teacher.findOne({ where: { userId: req.user.id } });
            if (!teacherProfile) {
                result = { rows: [], count: 0 };
            } else {
                queryOptions.where = { teacherId: teacherProfile.id };
                result = await WelfareRequest.findAndCountAll(queryOptions);
            }
        } else {
            // Public or Donor view
            queryOptions.where = { status: ['PUBLISHED', 'PARTIALLY_FUNDED', 'FULLY_FUNDED', 'TRANSFERRED'] };
            result = await WelfareRequest.findAndCountAll(queryOptions);
        }

        // Format for frontend
        const formatRequest = (r) => {
            const json = r.toJSON ? r.toJSON() : r;
            if (json.teacher && json.teacher.user) {
                json.teacher.name = json.teacher.user.fullName;
                json.teacher.email = json.teacher.user.email;
            }
            if (json.student) {
                const sName = json.student.fullName || 'Unknown Student';
                json.studentName = sName;
                json.student = {
                    ...json.student,
                    name: sName,
                    fullName: sName,
                    currentGrade: json.student.grade
                };
                json.grade = json.student.grade;
            } else {
                json.studentName = 'Unknown';
                json.student = { name: 'Unknown' };
            }
            // Mappings for frontend compatibility
            json.referenceId = json.referenceCode;
            json.cost = json.amountRequired;
            json.schoolData = json.school;
            return json;
        };

        const formatted = result.rows.map(formatRequest);

        if (page) {
            res.status(200).json({
                data: formatted,
                total: result.count,
                page,
                totalPages: Math.ceil(result.count / limit)
            });
        } else {
            res.status(200).json(formatted);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Update welfare request status (Approval Flow)
 * @route   PATCH /api/welfare/:id/status
 * @access  Private (Principal / ZEO)
 * @details Handles the state machine for approvals (e.g., SUBMITTED -> PRINCIPAL_APPROVED -> ZEO_APPROVED -> PUBLISHED).
 *          Generates official reference codes upon ZEO publishing. Audits decisions and spawns Notifications.
 */
const updateStatus = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { status, remarks } = req.body;
        const request = await WelfareRequest.findByPk(req.params.id, { transaction });

        if (!request) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Request not found' });
        }

        let notificationMessage = null;
        const upperStatus = status.toUpperCase();

        // 1. Principal logic
        if (req.user.role === 'PRINCIPAL') {
            if (request.schoolId !== req.user.schoolId) {
                await transaction.rollback();
                return res.status(403).json({ message: 'Not authorized' });
            }

            if (upperStatus === 'PRINCIPAL_APPROVED') {
                request.status = 'PRINCIPAL_APPROVED';
                notificationMessage = `Your request has been approved by the Principal.`;
            } else if (upperStatus === 'REJECTED') {
                request.status = 'REJECTED';
                notificationMessage = `Your request was Rejected by Principal. Reason: ${remarks}`;
            } else {
                await transaction.rollback();
                return res.status(400).json({ message: 'Invalid status for Principal' });
            }
        }

        // 2. ZEO logic
        else if (req.user.role === 'ZEO') {
            if (upperStatus === 'ZEO_APPROVED' || upperStatus === 'PUBLISHED') {
                request.status = upperStatus;

                // If moving to Published or ZEO_Approved, generate reference code
                if (!request.referenceCode) {
                    const year = new Date().getFullYear();
                    const count = await WelfareRequest.count({ where: { referenceCode: { [require('sequelize').Op.ne]: null } }, transaction });
                    request.referenceCode = `ZEO-REQ-${year}-${String(count + 1).padStart(4, '0')}`;
                }
                notificationMessage = `Your request is now ${upperStatus.replace('_', ' ')}.`;
            } else if (upperStatus === 'REJECTED') {
                request.status = 'REJECTED';
                notificationMessage = `Your request was Rejected by ZEO. Reason: ${remarks}`;
            } else {
                request.status = upperStatus;
            }
        } else {
            await transaction.rollback();
            return res.status(403).json({ message: 'Not authorized' });
        }

        await request.save({ transaction });

        // Create Audit Record
        await WelfareApproval.create({
            welfareRequestId: request.id,
            approvedBy: req.user.id,
            role: req.user.role,
            decision: upperStatus === 'REJECTED' ? 'REJECTED' : 'APPROVED',
            remarks: remarks
        }, { transaction });

        // Notifications
        const teacher = await Teacher.findByPk(request.teacherId, { transaction });
        if (teacher && notificationMessage) {
            await Notification.create({
                userId: teacher.userId,
                message: notificationMessage,
                title: 'Status Update'
            }, { transaction });
        }

        await transaction.commit();
        res.status(200).json(request);
    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get Published Requests
 * @route   GET /api/welfare/published
 * @access  Public
 * @details Retrieves requests that are visible to donors (PUBLISHED, PARTIALLY_FUNDED, etc). 
 *          Strips sensitive internal data from the response. Supports pagination.
 */
const getPublishedRequests = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10);
        const limit = parseInt(req.query.limit, 10) || 100;
        const offset = page ? (page - 1) * limit : 0;

        const result = await WelfareRequest.findAndCountAll({
            where: {
                status: ['PUBLISHED', 'PARTIALLY_FUNDED', 'FULLY_FUNDED', 'TRANSFERRED']
            },
            include: [
                { model: School, as: 'school', attributes: ['id', 'name', 'division'] },
                { model: Student, as: 'student', attributes: ['grade'] },
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        const publicData = result.rows.map(r => ({
            id: r.id,
            referenceId: r.referenceCode,
            schoolName: r.school?.name,
            division: r.school?.division,
            grade: r.student?.grade,
            category: r.category,
            description: r.description,
            cost: r.amountRequired,
            status: r.status,
            createdAt: r.createdAt
        }));

        if (page) {
            res.status(200).json({
                data: publicData,
                total: result.count,
                page,
                totalPages: Math.ceil(result.count / limit)
            });
        } else {
            res.status(200).json(publicData);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update welfare request details
// @route   PUT /api/welfare/:id
// @access  Private (Teacher)
const updateRequest = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { description, priority, category, amountRequired, cost } = req.body;

        const teacher = await Teacher.findOne({ where: { userId: req.user.id }, transaction });
        if (!teacher) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Teacher profile not found' });
        }

        const request = await WelfareRequest.findByPk(req.params.id, { transaction });

        if (!request) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.teacherId !== teacher.id) {
            await transaction.rollback();
            return res.status(403).json({ message: 'Not authorized to edit this request' });
        }

        if (request.status !== 'SUBMITTED') {
            await transaction.rollback();
            return res.status(400).json({ message: 'Can only edit requests in SUBMITTED status' });
        }

        if (description) request.description = description;
        if (priority) request.priority = priority.toUpperCase();
        if (category) request.category = category;
        if (amountRequired || cost) request.amountRequired = amountRequired || cost;

        await request.save({ transaction });
        await transaction.commit();

        res.status(200).json({ message: 'Request updated successfully', request });
    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a welfare request
// @route   DELETE /api/welfare/:id
// @access  Private (Teacher)
const deleteRequest = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const teacher = await Teacher.findOne({ where: { userId: req.user.id }, transaction });
        if (!teacher) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Teacher profile not found' });
        }

        const request = await WelfareRequest.findByPk(req.params.id, { transaction });

        if (!request) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.teacherId !== teacher.id) {
            await transaction.rollback();
            return res.status(403).json({ message: 'Not authorized to delete this request' });
        }

        if (request.status !== 'SUBMITTED') {
            await transaction.rollback();
            return res.status(400).json({ message: 'Can only delete requests in SUBMITTED status' });
        }

        await request.destroy({ transaction });
        await transaction.commit();

        res.status(200).json({ message: 'Request deleted successfully' });
    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createRequest,
    getRequests,
    updateStatus,
    getPublishedRequests,
    updateRequest,
    deleteRequest
};
