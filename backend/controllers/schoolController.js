const School = require('../models/School');
const User = require('../models/User');

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
                role: ['principal', 'teacher']
            }
        });

        // Manually Attach School Name (since we store SchoolId/Name differently sometimes)
        // Ideally we used Associations, but for now let's map it if needed or just return users
        // The frontend expects user.schoolData or just user.school (string)
        // Our User model has 'school' (string) and 'schoolId' (integer).

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSchools,
    getSchoolUsers
};
