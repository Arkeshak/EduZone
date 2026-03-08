const { Circular, CircularRecipient, User } = require('../models');

/**
 * @desc    Publish a new Circular
 * @route   POST /api/circulars
 * @access  Private (ZEO Only)
 * @details Allows the ZEO to broadcast official circulars to specific roles (e.g., Principals, Teachers).
 *          Creates the Circular record and associated CircularRecipient records.
 */
const publishCircular = async (req, res) => {
    try {
        const { title, message, status, recipients } = req.body; // recipients: ['PRINCIPAL', 'TEACHER']

        if (req.user.role !== 'ZEO') {
            return res.status(403).json({ message: 'Only ZEO can publish circulars.' });
        }

        const circular = await Circular.create({
            title,
            message,
            status: status || 'PUBLISHED',
            publishedBy: req.user.id,
            publishedAt: (status === 'PUBLISHED' || !status) ? new Date() : null
        });

        // Handle Recipients
        if (recipients && Array.isArray(recipients)) {
            for (const role of recipients) {
                await CircularRecipient.create({
                    circularId: circular.id,
                    role: role.toUpperCase()
                });
            }
        }

        res.status(201).json(circular);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get Circulars for User
 * @route   GET /api/circulars
 * @access  Private
 * @details Retrieves circulars based on the logged-in user's role. 
 *          ZEO sees all circulars, while Teachers and Principals only see published circulars targeted to their role.
 */
const getCirculars = async (req, res) => {
    try {
        const { role } = req.user;
        let circulars;

        if (role === 'ZEO') {
            circulars = await Circular.findAll({
                order: [['createdAt', 'DESC']]
            });
        } else {
            // Find circulars where recipient role matches
            const recipientRecords = await CircularRecipient.findAll({
                where: { role: role }
            });
            const circularIds = recipientRecords.map(r => r.circularId);

            circulars = await Circular.findAll({
                where: {
                    id: circularIds,
                    status: 'PUBLISHED'
                },
                order: [['publishedAt', 'DESC']]
            });
        }

        res.json(circulars);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    publishCircular,
    getCirculars
};
