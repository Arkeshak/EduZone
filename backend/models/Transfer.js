const { DataTypes } = require('sequelize');
const db = require('../config/db');

/**
 * Transfer Model
 * Represents the actual movement of funds from the centralized system account to a School's bank account.
 * Links the accepted donation to the fulfilled welfare request.
 */
const Transfer = db.define('Transfer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    welfareRequestId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'welfare_request_id'
    },
    donationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'donation_id'
    },
    schoolId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'school_id'
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    transferReference: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'transfer_reference'
    },
    proofUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'proof_url'
    },
    transferredBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'transferred_by'
    },
    transferredAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'transferred_at'
    }
}, {
    tableName: 'transfers',
    underscored: true,
    timestamps: false // The SQL specifies transferred_at manually, but we can keep timestamps for consistency if we want. SQL only shows transferred_at.
});

module.exports = Transfer;
