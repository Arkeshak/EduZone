const { Circular, User } = require('../models');

// @desc    Publish Circular (ZEO Only)
// @route   POST /api/circulars
// @access  Private (ZEO)
const publishCircular = async (req, res) => {
    try {
        const { title, content, targetAudience } = req.body;

        // Ensure user is ZEO
        if (req.user.role !== 'zeo') {
            return res.status(403).json({ message: 'Only ZEO can publish circulars.' });
        }

        const circular = await Circular.create({
            title,
            content,
            targetAudience, // 'all', 'principals', 'teachers'
            authorId: req.user.id
        });

        res.status(201).json(circular);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Circulars (For Principal/Teacher)
// @route   GET /api/circulars
// @access  Private
const getCirculars = async (req, res) => {
    try {
        const { role } = req.user;
        let whereClause = {};

        // Filtering logic
        // ZEO sees all created by them? Or all.
        // Principal sees 'all' or 'principals'
        // Teacher sees 'all' or 'teachers'

        if (role === 'zeo') {
            // See all
        } else if (role === 'principal') {
            whereClause = {
                targetAudience: ['all', 'principals']
            };
        } else if (role === 'teacher') {
            whereClause = {
                targetAudience: ['all', 'teachers']
            };
        }

        // Just fetching all for simplicity if ZEO, filtered for others
        const circulars = await Circular.findAll({
            where: role === 'zeo' ? {} : { targetAudience: ['all', role === 'principal' ? 'principals' : 'teachers'] },
            order: [['createdAt', 'DESC']]
        });

        res.json(circulars);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    publishCircular,
    getCirculars
};
