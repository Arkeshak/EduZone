/**
 * RESOURCE CONTROLLER
 * 
 * File Purpose: Manages educational resource sharing and distribution
 * Used for: Teachers uploading materials, students downloading, resource discovery
 * 
 * Key functions:
 * - uploadResource() - Teacher uploads file (PDF, doc, video, etc.)
 * - getPublicResources() - Search/filter available resources
 * - getMyResources() - Teacher views uploaded files
 * - updateResource() - Teacher edits resource metadata
 * - deleteResource() - Teacher removes resource
 * 
 * Data: Title, description, subject, grade level, file URL, visibility
 */

const { Resource, Teacher, School, Subject, User } = require('../models');

// @desc    Upload a new resource (Teacher)
// @route   POST /api/resources
// @access  Private (Teacher)
const uploadResource = async (req, res) => {
    try {
        let { title, description, grade, subjectId, subject } = req.body;
        const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

        if (!fileUrl) {
            return res.status(400).json({ message: 'File upload is required.' });
        }

        const teacherProfile = await Teacher.findOne({ where: { userId: req.user.id } });
        if (!teacherProfile) {
            return res.status(400).json({ message: 'Teacher profile not found.' });
        }

        // Resolve subjectId if only subject name is provided
        if (!subjectId && subject) {
            const [subjectObj] = await Subject.findOrCreate({
                where: { name: subject }
            });
            subjectId = subjectObj.id;
        }

        if (!subjectId) {
            return res.status(400).json({ message: 'Subject is required.' });
        }

        const resource = await Resource.create({
            title,
            description,
            grade,
            subjectId,
            fileUrl,
            teacherId: teacherProfile.id,
            schoolId: teacherProfile.schoolId,
            status: 'PUBLISHED'
        });

        res.status(201).json({
            success: true,
            data: resource
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Public Resources
const getPublicResources = async (req, res) => {
    try {
        const { subjectId, subject, grade, search } = req.query;
        let whereClause = { status: 'PUBLISHED' };

        if (subjectId) whereClause.subjectId = subjectId;
        
        if (subject) {
            const subjectRecord = await Subject.findOne({ where: { name: subject } });
            if (subjectRecord) {
                whereClause.subjectId = subjectRecord.id;
            } else {
                return res.json([]);
            }
        }

        if (grade && grade !== 'All') whereClause.grade = grade;

        if (search) {
            const { Op } = require('sequelize');
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        const resources = await Resource.findAll({
            where: whereClause,
            include: [
                { model: Subject, as: 'subject', attributes: ['name'] },
                {
                    model: Teacher,
                    as: 'teacher',
                    include: [{ model: User, as: 'user', attributes: ['fullName'] }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        const formatted = resources.map(r => {
            const json = r.toJSON();
            if (json.subject) {
                json.subject = json.subject.name;
            }
            if (json.teacher && json.teacher.user) {
                json.teacherName = json.teacher.user.fullName;
            }
            return json;
        });

        res.status(200).json({
            success: true,
            data: formatted
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get resources uploaded by teacher
const getMyResources = async (req, res) => {

    try {


        const teacherProfile = await Teacher.findOne({ where: { userId: req.user.id } });
        if (!teacherProfile) {

            return res.status(404).json({ message: 'Teacher profile not found' });
        }



        const resources = await Resource.findAll({
            where: { teacherId: teacherProfile.id },
            include: [
                { model: Subject, as: 'subject', attributes: ['name'] },
                {
                    model: Teacher,
                    as: 'teacher',
                    include: [{ model: User, as: 'user', attributes: ['fullName'] }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });



        const formatted = resources.map(r => {
            const json = r.toJSON();
            if (json.subject) {
                json.subject = json.subject.name;
            }
            if (json.teacher && json.teacher.user) {
                json.teacherName = json.teacher.user.fullName;
            }
            return json;
        });

        res.status(200).json({
            success: true,
            data: formatted
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update a resource
const updateResource = async (req, res) => {
    try {
        let { title, description, grade, subjectId, subject } = req.body;
        const resource = await Resource.findByPk(req.params.id);

        if (!resource) return res.status(404).json({ message: 'Resource not found' });

        const teacherProfile = await Teacher.findOne({ where: { userId: req.user.id } });
        if (!teacherProfile || resource.teacherId !== teacherProfile.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Resolve subjectId if only subject name is provided
        if (!subjectId && subject) {
            const [subjectObj] = await Subject.findOrCreate({
                where: { name: subject }
            });
            subjectId = subjectObj.id;
        }

        const updateData = {
            title: title || resource.title,
            description: description || resource.description,
            grade: grade || resource.grade,
            subjectId: subjectId || resource.subjectId
        };

        if (req.file) {
            updateData.fileUrl = `/uploads/${req.file.filename}`;
        }

        await resource.update(updateData);

        // Fetch again with includes to return formatted data
        const updated = await Resource.findByPk(resource.id, {
            include: [
                { model: Subject, as: 'subject', attributes: ['name'] },
                { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: ['fullName'] }] }
            ]
        });

        const json = updated.toJSON();
        if (json.subject) json.subject = json.subject.name;
        if (json.teacher && json.teacher.user) json.teacherName = json.teacher.user.fullName;

        res.status(200).json({ 
            success: true, 
            message: 'Resource updated', 
            resource: json 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a resource
const deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findByPk(req.params.id);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });

        const teacherProfile = await Teacher.findOne({ where: { userId: req.user.id } });
        if (!teacherProfile || resource.teacherId !== teacherProfile.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await resource.destroy();
        res.status(200).json({ success: true, message: 'Resource deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    uploadResource,
    getPublicResources,
    getMyResources,
    updateResource,
    deleteResource
};
