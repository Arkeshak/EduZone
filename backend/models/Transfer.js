/**
 * TRANSFER MODEL
 * 
 * File Purpose: Represents the completed money transfer for a funded welfare request.
 * Used for: Tracking when donations are moved to a school's bank account.
 * 
 * Core fields:
 * - welfareRequestId: Associated welfare request funded by this transfer
 * - donationId: Donation that provided the money
 * - schoolId: Destination school account
 * - amount: Amount transferred
 * - transferReference: Bank/transaction reference ID
 * - proofUrl: Optional receipt/proof file URL
 * - transferredBy: User ID of the staff member who executed the transfer
 * - transferredAt: Timestamp when transfer was completed
 * 
 * Relationships:
 * - Transfer belongsTo WelfareRequest
 * - Transfer belongsTo Donation
 * - Transfer belongsTo School
 */
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
