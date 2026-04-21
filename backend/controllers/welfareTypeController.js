const { WelfareType } = require('../models');

/**
 * @desc    Get all welfare types
 * @route   GET /api/welfare-types
 * @access  Public
 */
const getWelfareTypes = async (req, res) => {
    try {
        const types = await WelfareType.findAll({
            where: { isActive: true },
            order: [['name', 'ASC']]
        });
        res.status(200).json({ success: true, data: types });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Create a new welfare type
 * @route   POST /api/welfare-types
 * @access  Private (ZEO)
 */
const createWelfareType = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });

        const type = await WelfareType.create({ name, description });
        res.status(201).json({ success: true, data: type });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Update a welfare type
 * @route   PUT /api/welfare-types/:id
 * @access  Private (ZEO)
 */
const updateWelfareType = async (req, res) => {
    try {
        const { name, description, isActive } = req.body;
        const type = await WelfareType.findByPk(req.params.id);
        if (!type) return res.status(404).json({ message: 'Welfare type not found' });

        if (name) type.name = name;
        if (description !== undefined) type.description = description;
        if (isActive !== undefined) type.isActive = isActive;

        await type.save();
        res.status(200).json({ success: true, data: type });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Delete a welfare type (soft delete by setting inactive)
 * @route   DELETE /api/welfare-types/:id
 * @access  Private (ZEO)
 */
const deleteWelfareType = async (req, res) => {
    try {
        const type = await WelfareType.findByPk(req.params.id);
        if (!type) return res.status(404).json({ message: 'Welfare type not found' });

        type.isActive = false;
        await type.save();
        res.status(200).json({ success: true, message: 'Welfare type deactivated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getWelfareTypes,
    createWelfareType,
    updateWelfareType,
    deleteWelfareType
};
