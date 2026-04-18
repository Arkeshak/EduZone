/**
 * DONATION CONTROLLER
 * 
 * File Purpose: Handles donation processing and verification
 * Used for: Recording donations, administering verification, tracking funds
 * 
 * Key functions:
 * - createDonation() - Record new donation (from donor or anonymous)
 * - getDonations() - List donations (role-based: ZEO sees all, donors see own)
 * - verifyDonation() - ZEO confirms payment and marks as verified
 * - getDonationById() - Get donation details
 * - updateDonationStatus() - Change donation status (PENDING → VERIFIED → TRANSFERRED)
 * 
 * Workflow: Donation submitted → Payment verification → Fund transfer to school
 * Security: Only verified donations move funds, audit trail maintained
 */

const { Donation, User, Donor, WelfareRequest, School, Notification, WelfareApproval, sequelize } = require('../models');

/**
 * @desc    Create a new donation
 * @route   POST /api/donations
 * @access  Public / Private (Donor)
 * @details Records a new donation. Links to a donor profile if authenticated, 
 *          or tracks as anonymous if not. Stores the receipt/reference code for ZEO verification.
 */
const createDonation = async (req, res) => {


    try {


        let { amount, paymentMethod, welfareRequestId, paymentReference, transactionId, isAnonymous } = req.body;

        if (paymentMethod) {
            paymentMethod = paymentMethod.toUpperCase().replace(/\s+/g, '_');
        }

        let donorId = null;
        if (req.user) {

            const donorProfile = await Donor.findOne({ where: { userId: req.user.id } });
            if (donorProfile) {
                donorId = donorProfile.id;
            } else {

            }
        }

        let receiptReference = paymentReference || transactionId;
        if (req.file) {
            receiptReference = req.file.path.replace(/\\/g, "/");
        }

        const donation = await Donation.create({
            donorId,
            welfareRequestId: welfareRequestId || null,
            amount,
            paymentMethod: paymentMethod || 'ONLINE',
            receiptReference,
            isAnonymous: isAnonymous === 'true' || isAnonymous === true
        });



        res.status(201).json(donation);
    } catch (error) {

        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get donations history
 * @route   GET /api/donations
 * @access  Private (Donor / ZEO)
 * @details ZEO sees a paginated list of all donations with associated school/donor info for verification.
 *          Donors only see their own personal donation history.
 */
const getDonations = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10);
        const limit = parseInt(req.query.limit, 10) || 100;
        const offset = page ? (page - 1) * limit : 0;

        let queryOptions = {
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            include: []
        };

        const role = (req.user.role || '').toUpperCase();

        const { welfareRequestId } = req.query;

        if (role === 'ZEO') {
            // ZEO sees everything
            if (welfareRequestId) queryOptions.where = { welfareRequestId };
            queryOptions.include = [
                {
                    model: Donor,
                    as: 'donor',
                    include: { model: User, as: 'user', attributes: ['fullName'] }
                },
                {
                    model: WelfareRequest,
                    as: 'request',
                    include: { 
                        model: School, 
                        as: 'school', 
                        attributes: ['id', 'name', 'bankName', 'bankBranch', 'accountNumber', 'accountHolder'] 
                    }
                }
            ];
        } else if (role === 'TEACHER' || role === 'PRINCIPAL') {
            // Educational staff sees donations for their school's requests
            if (welfareRequestId) queryOptions.where = { welfareRequestId };
            queryOptions.include = [
                {
                    model: Donor,
                    as: 'donor',
                    include: { model: User, as: 'user', attributes: ['fullName'] }
                },
                {
                    model: WelfareRequest,
                    as: 'request',
                    required: true,
                    where: { schoolId: req.user.schoolId }
                }
            ];
        } else if (role === 'DONOR') {
            // Donors see only their own history
            if (!req.user.profileId) {
                return res.status(200).json(page ? { data: [], total: 0 } : []);
            }
            queryOptions.where = { donorId: req.user.profileId };
            queryOptions.include = [
                {
                    model: WelfareRequest,
                    as: 'request',
                    include: { model: School, as: 'school', attributes: ['name'] }
                }
            ];
        } else {
            return res.status(403).json({ message: 'Unauthorized role' });
        }

        const result = await Donation.findAndCountAll(queryOptions);

        const mappedRows = result.rows.map(d => {
            const json = d.toJSON();
            
            // Mask donor name for teachers/principals if anonymous
            if ((role === 'TEACHER' || role === 'PRINCIPAL') && json.isAnonymous) {
                return {
                    ...json,
                    donorName: 'Anonymous Donor',
                    donor: null // Hide full donor profile
                };
            }

            // Standardize donor name display
            const donorName = json.donor?.user?.fullName || json.donor?.organizationName || 'Donor';
            
            // Map School Data for ZEO verification
            if (json.request && json.request.school) {
                json.request.schoolData = {
                    accountName: json.request.school.accountHolder,
                    bankName: json.request.school.bankName,
                    branch: json.request.school.bankBranch,
                    accountNumber: json.request.school.accountNumber
                };
            }

            return {
                ...json,
                donorName: json.isAnonymous && role !== 'ZEO' && json.donorId !== req.user.profileId ? 'Anonymous Donor' : donorName
            };
        });

        if (page) {
            res.status(200).json({
                data: mappedRows,
                total: result.count,
                page,
                totalPages: Math.ceil(result.count / limit)
            });
        } else {
            res.status(200).json(mappedRows);
        }
    } catch (error) {
        console.error("GET DONATIONS ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get system-wide donation statistics
 * @route   GET /api/donations/stats
 * @access  Public
 * @details Returns the aggregated total of all donations collected across the platform.
 */
const getStats = async (req, res) => {
    try {
        const totalDonations = await Donation.sum('amount') || 0;
        res.status(200).json({
            donationFund: totalDonations
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Verify and Process a Donation
 * @route   PATCH /api/donations/:id/verify
 * @access  Private (ZEO Only)
 * @details ZEO verifies the receipt. Automatically aggregates funds for the associated 
 *          WelfareRequest. If the request meets its goal, updates status to 'FULLY_FUNDED',
 *          otherwise 'PARTIALLY_FUNDED'. Notifies the donor of their receipt status.
 */
const verifyDonation = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { status, remarks } = req.body;
        const upperStatus = (status || '').toUpperCase();
        const validStatuses = ['VERIFIED', 'REJECTED', 'PENDING_REVIEW'];

        if (!validStatuses.includes(upperStatus)) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: `Invalid status. Allowed: ${validStatuses.join(', ')}`
            });
        }

        const donation = await Donation.findByPk(req.params.id, {
            include: [{ model: WelfareRequest, as: 'request' }],
            transaction
        });

        if (!donation) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'Donation not found' });
        }

        if (req.user.role !== 'ZEO') {
            await transaction.rollback();
            return res.status(403).json({ success: false, message: 'Only ZEO can verify donations' });
        }

        donation.status = upperStatus;
        donation.verifiedBy = req.user.id;
        donation.verifiedAt = new Date();
        await donation.save({ transaction });

        if (upperStatus === 'VERIFIED' && donation.welfareRequestId) {
            const request = await WelfareRequest.findByPk(donation.welfareRequestId, { transaction });
            if (request) {
                const allDonations = await Donation.findAll({
                    where: { welfareRequestId: request.id, status: 'VERIFIED' },
                    transaction,
                    attributes: ['amount']
                });
                const totalCollected = allDonations.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
                const amountRequired = parseFloat(request.amountRequired);

                if (totalCollected >= amountRequired) {
                    request.status = 'FULLY_FUNDED';
                } else if (totalCollected > 0) {
                    request.status = 'PARTIALLY_FUNDED';
                }
                await request.save({ transaction });

                await WelfareApproval.create({
                    welfareRequestId: request.id,
                    approvedBy: req.user.id,
                    role: 'ZEO',
                    decision: 'APPROVED',
                    remarks: `Donation verified: LKR ${parseFloat(donation.amount).toLocaleString()} | Total: LKR ${totalCollected.toLocaleString()} / ${amountRequired.toLocaleString()}`
                }, { transaction });
            }
        } else if (upperStatus === 'REJECTED') {
            if (donation.welfareRequestId) {
                await WelfareApproval.create({
                    welfareRequestId: donation.welfareRequestId,
                    approvedBy: req.user.id,
                    role: 'ZEO',
                    decision: 'REJECTED',
                    remarks: remarks || 'Donation receipt verification failed'
                }, { transaction });
            }
        }

        const donor = await Donor.findByPk(donation.donorId, {
            attributes: ['userId'],
            include: [{ model: User, as: 'user', attributes: ['id'], transaction }],
            transaction
        });

        if (donor && donor.user) {
            const messageMap = {
                'VERIFIED': 'Your donation has been verified and processed.',
                'REJECTED': `Your donation verification was rejected. ${remarks ? `Reason: ${remarks}` : ''}`,
                'PENDING_REVIEW': 'Your donation is under review.'
            };

            await Notification.create({
                userId: donor.user.id,
                message: messageMap[upperStatus],
                title: 'Donation Verification Result'
            }, { transaction });
        }

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: `Donation ${upperStatus.toLowerCase()} successfully`,
            data: donation
        });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('verifyDonation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createDonation,
    getDonations,
    getStats,
    verifyDonation
};
