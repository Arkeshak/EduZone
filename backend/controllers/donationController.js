const Donation = require('../models/Donation');
const User = require('../models/User');

// @desc    Create new donation
// @route   POST /api/donations
// @access  Private (Donor) or Public (Anonymous)
const createDonation = async (req, res) => {
    try {
        const { amount, description, allocation, isAnonymous } = req.body;

        // Check if user has a Donor profile
        const { Donor } = require('../models');
        let donorId = null;

        if (req.user) {
            const donorProfile = await Donor.findOne({ where: { userId: req.user.id } });
            if (donorProfile) donorId = donorProfile.id;
        }

        const donation = await Donation.create({
            donorId: donorId, // Links to Donor Profile ID now
            amount,
            description,
            allocation,
            isAnonymous
        });

        res.status(201).json(donation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get donations
// @route   GET /api/donations
// @access  Private
const getDonations = async (req, res) => {
    try {
        let donations;
        // ZEO sees all. Donor sees own.
        if (req.user.role === 'zeo') {
            donations = await Donation.findAll({ include: { model: User, as: 'donor', attributes: ['name'] } });
        } else {
            donations = await Donation.findAll({ where: { donorId: req.user.id } });
        }
        res.status(200).json(donations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Public Stats
// @route   GET /api/stats
// @access  Public
const getStats = async (req, res) => {
    try {
        const totalDonations = await Donation.sum('amount') || 0;
        // Mocking other stats for simplicity or count queries
        res.status(200).json({
            donationFund: totalDonations
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createDonation,
    getDonations,
    getStats
};
