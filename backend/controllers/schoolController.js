/**
 * SCHOOL CONTROLLER
 * 
 * File Purpose: Manages school-related operations
 * Used for: CRUD operations on schools, staff management, school queries
 * 
 * Key functions:
 * - getSchools() - Fetch all schools (public)
 * - getSchoolUsers() - Get all teachers and principals across schools (ZEO)
 * - getSchoolById() - Get specific school details
 * - createSchool() - Add new school (ZEO)
 * - updateSchool() - Update school info (principal/ZEO)
 * - deleteSchool() - Remove school (ZEO)
 * - getSchoolStats() - School statistics (welfare, donations, transfers)
 * 
 * Security: Public read operations, Create/Update/Delete require ZEO role
 */

const { School, User, Teacher, Principal, Subject } = require('../models');

// @desc    Get all schools
// @route   GET /api/schools
// @access  Public
const getSchools = async (req, res) => {
    try {
        const schools = await School.findAll();
        res.json(schools);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all school staff (Principals & Teachers)
// @route   GET /api/schools/users
// @access  Private (ZEO)
const getSchoolUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            where: {
                role: ['PRINCIPAL', 'TEACHER'] // New uppercase roles
            },
            include: [
                {
                    model: Teacher,
                    as: 'teacherProfile',
                    include: [
                        { model: School, as: 'school' },
                        { model: Subject, as: 'subjects' }
                    ]
                },
                {
                    model: Principal,
                    as: 'principalProfile',
                    include: [{ model: School, as: 'school' }]
                }
            ]
        });

        const mappedUsers = users.map(u => {
            const userJson = u.toJSON();
            const schoolData = userJson.teacherProfile?.school || userJson.principalProfile?.school;

            let subjectsList = [];
            if (userJson.teacherProfile && userJson.teacherProfile.subjects) {
                subjectsList = userJson.teacherProfile.subjects.map(s => s.name);
            }
            if (userJson.teacherProfile) {
                userJson.teacherProfile.subjects = subjectsList;
            }

            return { ...userJson, schoolData };
        });

        res.json(mappedUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Principal's School
const getMySchool = async (req, res) => {
    try {
        const principalProfile = await Principal.findOne({ where: { userId: req.user.id } });
        if (!principalProfile) return res.status(404).json({ message: 'Principal profile not found' });

        const school = await School.findByPk(principalProfile.schoolId);
        res.json(school);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Principal's School (Bank Details)
const updateMySchool = async (req, res) => {
    try {
        const principalProfile = await Principal.findOne({ where: { userId: req.user.id } });
        if (!principalProfile) return res.status(404).json({ message: 'Principal Not Found' });

        const school = await School.findByPk(principalProfile.schoolId);
        if (!school) return res.status(404).json({ message: 'School Not Found' });

        const { bankName, bankBranch, accountNumber, accountHolder } = req.body;

        if (bankName) school.bankName = bankName;
        if (bankBranch) school.bankBranch = bankBranch;
        if (accountNumber) school.accountNumber = accountNumber;
        if (accountHolder) school.accountHolder = accountHolder;

        await school.save();
        res.json({ message: 'School details updated', school });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSchools,
    getSchoolUsers,
    getMySchool,
    updateMySchool
};
