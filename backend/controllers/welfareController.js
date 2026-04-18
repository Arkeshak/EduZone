const { WelfareRequest, User, Teacher, Student, School, Notification, WelfareApproval, Donation, sequelize } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// ✅ Strict State Machine Validation
const VALID_TRANSITIONS = {
    'SUBMITTED': ['PRINCIPAL_APPROVED', 'REJECTED'],
    'PRINCIPAL_APPROVED': ['ZEO_APPROVED', 'PUBLISHED', 'REJECTED'],
    'ZEO_APPROVED': ['PUBLISHED', 'REJECTED'],
    'PUBLISHED': ['PARTIALLY_FUNDED', 'FULLY_FUNDED', 'REJECTED'],
    'PARTIALLY_FUNDED': ['FULLY_FUNDED', 'REJECTED'],
    'FULLY_FUNDED': ['TRANSFERRED', 'REJECTED'],
    'TRANSFERRED': [],  // Terminal state
    'REJECTED': []      // Terminal state
};

const validateStatusTransition = (currentStatus, newStatus, userRole) => {
    const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
        return {
            valid: false,
            error: `Cannot transition from ${currentStatus} to ${newStatus}`
        };
    }

    // Role-based restrictions
    if (userRole === 'PRINCIPAL' && !['PRINCIPAL_APPROVED', 'REJECTED'].includes(newStatus)) {
        return {
            valid: false,
            error: `Principal can only approve or reject at SUBMITTED stage`
        };
    }

    if (userRole === 'ZEO' && !['ZEO_APPROVED', 'PUBLISHED', 'REJECTED', 'PARTIALLY_FUNDED', 'FULLY_FUNDED', 'TRANSFERRED'].includes(newStatus)) {
        return {
            valid: false,
            error: `Invalid ZEO action`
        };
    }

    return { valid: true };
};



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
        // ✅ DESTRUCTURE INPUTS FROM req.body (Fix for ReferenceErrors)
        let { studentName, fullName, grade, section, category, description, amountRequired, cost, priority } = req.body;

        // ✅ Standardize name if literal 'fullName' is missing from payload
        if (!fullName) fullName = studentName;
        
        console.log(`[WelfareAPI] Creating request for student: ${fullName}, Grade: ${grade}, Amount: ${amountRequired || cost}`);
        if (!amountRequired && cost) {
            console.warn(`[WelfareAPI] Fallback to legacy 'cost' field detected: ${cost}`);
            amountRequired = cost;
        }

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
 *          Includes pagination logic with DoS protection.
 */
const getRequests = async (req, res) => {
    try {
        // ✅ Validate pagination parameters (prevent DoS)
        let page = parseInt(req.query.page, 10) || 1;
        let limit = parseInt(req.query.limit, 10) || 20;

        const MAX_LIMIT = 100;
        const MIN_PAGE = 1;

        if (limit > MAX_LIMIT) limit = MAX_LIMIT;
        if (limit < 1) limit = 20;
        if (page < MIN_PAGE) page = MIN_PAGE;

        const offset = (page - 1) * limit;

        let result;
        const includeOptions = [
            {
                model: Teacher,
                as: 'teacher',
                attributes: ['id', 'userId'],  // ✅ Minimize N+1 queries
                include: [{ model: User, as: 'user', attributes: ['fullName', 'email'] }]
            },
            { model: Student, as: 'student', attributes: ['fullName', 'grade'] },
            { 
                model: School, 
                as: 'school', 
                attributes: ['id', 'name', 'bankName', 'bankBranch', 'accountNumber', 'accountHolder'] 
            },
            { model: WelfareApproval, as: 'approvals', attributes: ['decision', 'remarks', 'createdAt'] },
            { 
                model: Donation, 
                as: 'donations', 
                attributes: ['amount'],
                where: { status: 'VERIFIED' },
                required: false // Don't exclude requests with 0 donations
            }
        ];

        let queryOptions = {
            include: includeOptions,
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            distinct: true  // Important for accurate count with includes
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
            const teacherProfile = await Teacher.findOne({ where: { userId: req.user.id }, attributes: ['id'] });
            if (!teacherProfile) {
                return res.status(200).json({
                    data: [],
                    total: 0,
                    page,
                    totalPages: 0
                });
            }
            queryOptions.where = { teacherId: teacherProfile.id };
            result = await WelfareRequest.findAndCountAll(queryOptions);
        } else {
            // Public or Donor view - only published
            queryOptions.where = {
                status: { [Op.in]: ['PUBLISHED', 'PARTIALLY_FUNDED', 'FULLY_FUNDED', 'TRANSFERRED'] }
            };
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
            // Mappings for frontend compatibility (Read-only)
            json.referenceId = json.referenceCode;
            json.amountRequired = parseFloat(json.amountRequired); // Ensure number
            json.cost = json.amountRequired; 
            if (json.school) {
                json.schoolData = {
                    ...json.school,
                    accountName: json.school.accountHolder,
                    bankName: json.school.bankName,
                    branch: json.school.bankBranch,
                    accountNumber: json.school.accountNumber
                };
            }
            return json;
        };

        const formatted = result.rows.map(formatRequest);

        res.status(200).json({
            success: true,
            data: formatted,
            total: result.count,
            page,
            totalPages: Math.ceil(result.count / limit)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Update welfare request status (Approval Flow)
 * @route   PATCH /api/welfare/:id/status
 * @access  Private (Principal / ZEO)
 * @details Handles the state machine for approvals (e.g., SUBMITTED -> PRINCIPAL_APPROVED -> ZEO_APPROVED -> PUBLISHED).
 *          Validates transitions strictly. Generates official reference codes upon ZEO publishing. Audits decisions.
 */
const updateStatus = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { status, remarks } = req.body;
        const request = await WelfareRequest.findByPk(req.params.id, { transaction });

        if (!request) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        const upperStatus = (status || '').toUpperCase();

        // ✅ Validate state machine transition
        const validation = validateStatusTransition(request.status, upperStatus, req.user.role);
        if (!validation.valid) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: validation.error });
        }

        // Role-based authorization checks
        if (req.user.role === 'PRINCIPAL') {
            if (request.schoolId !== req.user.schoolId) {
                await transaction.rollback();
                return res.status(403).json({ success: false, message: 'Not authorized to approve this request' });
            }
        } else if (req.user.role !== 'ZEO') {
            await transaction.rollback();
            return res.status(403).json({ success: false, message: 'Only Principal/ZEO can approve requests' });
        }

        // Update status
        request.status = upperStatus;

        // Generate reference code when publishing
        if ((upperStatus === 'PUBLISHED' || upperStatus === 'ZEO_APPROVED') && !request.referenceCode) {
            const year = new Date().getFullYear();
            const count = await WelfareRequest.count({
                where: { referenceCode: { [require('sequelize').Op.ne]: null } },
                transaction
            });
            request.referenceCode = `ZEO-REQ-${year}-${String(count + 1).padStart(4, '0')}`;
        }

        await request.save({ transaction });

        // Create Audit Record
        await WelfareApproval.create({
            welfareRequestId: request.id,
            approvedBy: req.user.id,
            role: req.user.role,
            decision: upperStatus === 'REJECTED' ? 'REJECTED' : 'APPROVED',
            remarks: remarks || null
        }, { transaction });

        // Send Notifications
        const teacher = await Teacher.findByPk(request.teacherId, {
            attributes: ['userId'],
            transaction
        });

        if (teacher) {
            let message = `Welfare request status updated to: ${upperStatus.replace(/_/g, ' ')}`;
            if (upperStatus === 'REJECTED') {
                message = `Your welfare request was rejected. ${remarks ? `Reason: ${remarks}` : ''}`;
            } else if (upperStatus === 'PRINCIPAL_APPROVED') {
                message = `Your request has been approved by the Principal and forwarded to ZEO.`;
            } else if (upperStatus === 'PUBLISHED') {
                message = `Your request has been approved and is now visible to donors.`;
            }

            await Notification.create({
                userId: teacher.userId,
                message,
                title: 'Welfare Request Status Update'
            }, { transaction });
        }

        await transaction.commit();

        res.status(200).json({
            success: true,
            data: request,
            message: `Status updated to ${upperStatus}`
        });
    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get Published Requests
 * @route   GET /api/welfare/published
 * @access  Public
 * @details Retrieves requests visible to donors (PUBLISHED, PARTIALLY_FUNDED, etc). 
 *          Strips sensitive data from response. Supports pagination with DoS protection.
 */
const getPublishedRequests = async (req, res) => {
    try {
        // ✅ Validate pagination parameters (prevent DoS)
        let page = parseInt(req.query.page, 10) || 1;
        let limit = parseInt(req.query.limit, 10) || 20;

        const MAX_LIMIT = 100;
        const MIN_PAGE = 1;

        if (limit > MAX_LIMIT) limit = MAX_LIMIT;
        if (limit < 1) limit = 20;
        if (page < MIN_PAGE) page = MIN_PAGE;

        const offset = (page - 1) * limit;

        const result = await WelfareRequest.findAndCountAll({
            where: {
                status: { [Op.in]: ['PUBLISHED', 'PARTIALLY_FUNDED'] }
            },
            include: [
                { model: School, as: 'school', attributes: ['id', 'name', 'division'] },
                { model: Student, as: 'student', attributes: ['grade'] },
                {
                    model: Donation,
                    as: 'donations',
                    attributes: ['amount'],
                    where: { status: { [Op.in]: ['VERIFIED', 'PENDING'] } },
                    required: false
                }
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            distinct: true
        });

        const publicData = result.rows
            .map(r => {
                const collected = (r.donations || []).reduce((sum, d) => sum + parseFloat(d.amount), 0);
                return {
                    id: r.id,
                    referenceId: r.referenceCode,
                    schoolName: r.school?.name,
                    division: r.school?.division,
                    grade: r.student?.grade,
                    category: r.category,
                    description: r.description,
                    cost: r.amountRequired,
                    collectedAmount: collected,
                    status: r.status,
                    createdAt: r.createdAt
                };
            })
            .filter(r => r.collectedAmount < r.cost); // Hide requests that are fully pledged

        if (page) {
            res.status(200).json({
                data: publicData,
                total: publicData.length, // Updating total to reflect filtered set
                page,
                totalPages: Math.ceil(publicData.length / limit)
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

        console.log(`[WelfareAPI] Updating request ID: ${req.params.id}, New Amount: ${amountRequired || cost}`);
        
        if (description) request.description = description;
        if (priority) request.priority = priority.toUpperCase();
        if (category) request.category = category;
        
        if (amountRequired !== undefined || cost !== undefined) {
            const finalAmount = amountRequired !== undefined ? amountRequired : cost;
            console.log(`[WelfareAPI] Setting amountRequired to: ${finalAmount}`);
            request.amountRequired = finalAmount;
        }

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
