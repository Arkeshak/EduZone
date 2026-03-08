const { Transfer, WelfareRequest, School, WelfareApproval, Donation, sequelize } = require('../models');

// @desc    Initiate Fund Transfer to School (ZEO)
// @route   POST /api/transfers
// @access  Private (ZEO)
const initiateTransfer = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { requestId, donationId, amount, transferReference } = req.body;

        let proofUrl = null;
        if (req.file) {
            proofUrl = req.file.path.replace(/\\/g, "/");
        }

        const request = await WelfareRequest.findByPk(requestId || req.body.welfareRequestId, { transaction });
        if (!request) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Request not found' });
        }

        // Create Transfer Record
        const transfer = await Transfer.create({
            welfareRequestId: request.id,
            donationId: donationId, // New field in SQL
            schoolId: request.schoolId,
            amount,
            transferReference,
            proofUrl,
            transferredBy: req.user.id,
            transferredAt: new Date()
        }, { transaction });

        // Update Request Status
        request.status = 'TRANSFERRED';
        await request.save({ transaction });

        // Create Approval Record (Audit)
        await WelfareApproval.create({
            welfareRequestId: request.id,
            approvedBy: req.user.id,
            role: 'ZEO',
            decision: 'TRANSFERRED',
            remarks: `Funds transferred to school. Ref: ${transferReference}`
        }, { transaction });

        await transaction.commit();
        res.status(201).json({
            message: 'Transfer recorded successfully.',
            transfer,
            requestStatus: request.status
        });

    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Transfers
// @route   GET /api/transfers
// @access  Private (ZEO/Principal)
const getTransfers = async (req, res) => {
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
            queryOptions.include = [{ model: WelfareRequest, as: 'request' }, { model: School, as: 'school' }];
            result = await Transfer.findAndCountAll(queryOptions);
        } else if (req.user.role === 'PRINCIPAL') {
            queryOptions.where = { schoolId: req.user.schoolId };
            queryOptions.include = [{ model: WelfareRequest, as: 'request' }];
            result = await Transfer.findAndCountAll(queryOptions);
        } else {
            return res.status(403).json({ message: 'Not authorized' });
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

module.exports = {
    initiateTransfer,
    getTransfers
};
