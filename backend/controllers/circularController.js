/**
 * CIRCULAR CONTROLLER
 * 
 * File Purpose: Manages official announcements and circulars
 * Used for: Publishing and retrieving notices to/from school stakeholders
 * 
 * Key functions:
 * - publishCircular() - ZEO publishes circular to target roles
 * - getCirculars() - Get circulars visible to user's role
 * - updateCircular() - Modify circular (ZEO only)
 * - deleteCircular() - Remove circular (ZEO only)
 * 
 * Features:
 * - Draft and publish workflow
 * - Role-based circular targeting (PRINCIPAL, TEACHER, etc.)
 * - Audit trail of publisher and publish date
 * - File attachments support
 * 
 * Security: Only ZEO can create/publish, others can view assigned circulars
 */

const { Circular, CircularRecipient, User, CircularAttachment } = require('../models');

/**
 * @desc    Publish a new Circular
 * @route   POST /api/circulars
 * @access  Private (ZEO Only)
 * @details Allows the ZEO to broadcast official circulars to specific roles (e.g., Principals, Teachers).
 *          Creates the Circular record and associated CircularRecipient records.
 */
const publishCircular = async (req, res) => {
    try {
        let { title, message, content, status, recipients } = req.body; 
        
        // Handle FormData array naming (recipients[] vs recipients)
        if (!recipients && req.body['recipients[]']) {
            recipients = req.body['recipients[]'];
        }
        
        // Ensure recipients is an array (even if one item sent via FormData)
        if (recipients && !Array.isArray(recipients)) {
            recipients = [recipients];
        }

        // Handle field name mismatch: content vs message
        if (!message && content) message = content;

        if (req.user.role !== 'ZEO') {
            return res.status(403).json({ message: 'Only ZEO can publish circulars.' });
        }

        if (!title || !message) {
            return res.status(400).json({ message: 'Title and content are required.' });
        }

        console.log('--- PUBLISHING CIRCULAR ---');
        console.log('Body:', req.body);
        console.log('File:', req.file ? req.file.filename : 'NO FILE ATTACHED');

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

        // Handle PDF Attachment
        if (req.file) {
            console.log('Creating attachment record for circular:', circular.id);
            await CircularAttachment.create({
                circularId: circular.id,
                fileUrl: `/uploads/${req.file.filename}`
            });
            console.log('Attachment record created.');
        } else {
            console.log('No req.file found, skipping attachment creation.');
        }

        res.status(201).json({
            success: true,
            data: circular
        });
    } catch (error) {
        const fs = require('fs');
        const logMsg = `[${new Date().toISOString()}] PUBLISH_ERROR: ${error.message}\nStack: ${error.stack}\nBody: ${JSON.stringify(req.body)}\n\n`;
        fs.appendFileSync('circular_error.log', logMsg);
        console.error('[PUBLISH_CIRCULAR_ERROR]:', error);
        res.status(500).json({ success: false, message: error.message });
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
                include: [{
                    model: CircularRecipient,
                    as: 'recipients',
                    attributes: ['role']
                }, {
                    model: CircularAttachment,
                    as: 'attachments',
                    attributes: ['fileUrl']
                }],
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
                include: [{
                    model: CircularAttachment,
                    as: 'attachments',
                    attributes: ['fileUrl']
                }],
                order: [['publishedAt', 'DESC']]
            });
        }

        res.status(200).json({
            success: true,
            data: circulars
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Update Circular
 * @route   PUT /api/circulars/:id
 * @access  Private (ZEO Only)
 */
const updateCircular = async (req, res) => {
    try {
        const { id } = req.params;
        let { title, message, content, status } = req.body;
        let recipients = req.body.recipients;

        // Handle FormData array naming
        if (!recipients && req.body['recipients[]']) {
            recipients = req.body['recipients[]'];
        }

        // Ensure recipients is an array
        if (recipients && !Array.isArray(recipients)) {
            recipients = [recipients];
        }

        if (!message && content) message = content;

        if (req.user.role !== 'ZEO') {
            return res.status(403).json({ message: 'Only ZEO can edit circulars.' });
        }

        const circular = await Circular.findByPk(id);
        if (!circular) {
            return res.status(404).json({ message: 'Circular not found.' });
        }

        // Only allow publisher or another ZEO to edit
        if (circular.publishedBy !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to edit this circular.' });
        }

        if (title) circular.title = title;
        if (message) circular.message = message;

        // Update status and publishedAt logic
        if (status && status !== circular.status) {
            if (status === 'PUBLISHED' && !circular.publishedAt) {
                circular.publishedAt = new Date();
            }
            circular.status = status;
        }

        await circular.save();

        // ✅ Synchronize Recipients if provided
        if (recipients) {
            // Remove old mapping
            await CircularRecipient.destroy({ where: { circularId: id } });
            
            // Add new mapping
            for (const role of recipients) {
                await CircularRecipient.create({
                    circularId: circular.id,
                    role: role.toUpperCase()
                });
            }
        }

        // Handle PDF Attachment update
        if (req.file) {
            // Option 1: Replace existing (simple approach)
            await CircularAttachment.destroy({ where: { circularId: id } });
            await CircularAttachment.create({
                circularId: circular.id,
                fileUrl: `/uploads/${req.file.filename}`
            });
        }

        res.status(200).json({
            success: true,
            data: circular,
            message: 'Circular updated successfully'
        });
    } catch (error) {
        console.error('[UPDATE_CIRCULAR_ERROR]:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    publishCircular,
    getCirculars,
    updateCircular
};
