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


        const { amount, paymentMethod, welfareRequestId, paymentReference, transactionId } = req.body;

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
            paymentMethod: paymentMethod ? paymentMethod.toUpperCase() : 'ONLINE',
            receiptReference,
            status: 'PENDING'
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
            order: [['createdAt', 'DESC']]
        };

        let result;
        if (req.user.role === 'ZEO') {
            queryOptions.include = [
                {
                    model: Donor,
                    as: 'donor',
                    include: { model: User, as: 'user', attributes: ['fullName'] }
                },
                {
                    model: WelfareRequest,
                    as: 'request',
                    attributes: ['id', 'referenceCode', 'category', 'description'],
                    include: {
                        model: School,
                        as: 'school',
                        attributes: ['id', 'name', 'bankName', 'bankBranch', 'accountNumber', 'accountHolder']
                    }
                }
            ];
            result = await Donation.findAndCountAll(queryOptions);

            result.rows = result.rows.map(d => {
                const json = d.toJSON();
                if (json.request) {
                    json.request.referenceId = json.request.referenceCode;
                    json.request.schoolData = json.request.school;
                }
                return {
                    ...json,
                    donorName: json.donor?.user?.fullName || json.donor?.organizationName || 'Anonymous',
                    receiptUrl: json.receiptReference
                };
            });
        } else {
            queryOptions.where = { donorId: req.user.profileId };
            result = await Donation.findAndCountAll(queryOptions);
        }

        if (page) {
            res.status(200).json({
                data: result.rows,
                total: result.count,
                page,
                totalPages: Math.ceil(result.count / limit)
            });
        } else {
            res.status(200).json(result.rows);
        }
    } catch (error) {
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
        const donation = await Donation.findByPk(req.params.id, { transaction });

        if (!donation) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Donation not found' });
        }
        if (req.user.role !== 'ZEO') {
            await transaction.rollback();
            return res.status(403).json({ message: 'Not authorized' });
        }

        const upperStatus = status.toUpperCase();
        donation.status = upperStatus;
        await donation.save({ transaction });

        if (upperStatus === 'VERIFIED' && donation.welfareRequestId) {
            const request = await WelfareRequest.findByPk(donation.welfareRequestId, { transaction });
            if (request) {
                const allDonations = await Donation.findAll({
                    where: { welfareRequestId: request.id, status: 'VERIFIED' },
                    transaction
                });
                const totalCollected = allDonations.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

                if (totalCollected >= parseFloat(request.amountRequired)) {
                    request.status = 'FULLY_FUNDED';
                } else {
                    request.status = 'PARTIALLY_FUNDED';
                }
                await request.save({ transaction });

                // Create Approval Record as audit
                await WelfareApproval.create({
                    welfareRequestId: request.id,
                    approvedBy: req.user.id,
                    role: 'ZEO',
                    decision: 'APPROVED',
                    remarks: `Donation verified: LKR ${parseFloat(donation.amount).toLocaleString()}`
                }, { transaction });
            }
        }

        const donor = await Donor.findByPk(donation.donorId, { include: ['user'], transaction });
        if (donor && donor.user) {
            await Notification.create({
                userId: donor.user.id,
                message: `Your donation was ${upperStatus.toLowerCase()}.`,
                title: 'Donation Update'
            }, { transaction });
        }

        await transaction.commit();
        res.status(200).json(donation);
    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createDonation,
    getDonations,
    getStats,
    verifyDonation
};
