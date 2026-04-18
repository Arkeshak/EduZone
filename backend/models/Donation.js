/**
 * DONATION MODEL
 * 
 * File Purpose: Defines donation/contribution schema
 * Used for: Recording donor contributions to welfare requests or schools
 * 
 * Core fields:
 * - donorId: Who made the donation
 * - welfareRequestId: Which welfare request is being funded (optional)
 * - schoolId: Which school receives funds (optional, if not tied to request)
 * - amount: How much money donated
 * - paymentMethod: How payment was received (ONLINE, BANK_TRANSFER)
 * - status: Donation stage (PENDING verification → VERIFIED → transferred to school)
 * - receiptReference: Payment proof (transaction ID, receipt file path)
 * 
 * Relationships:
 * - Donation Many:One Donor
 * - Donation Many:One WelfareRequest
 * - Donation Many:One School
 * 
 * Workflow: Donor submits amount → ZEO verifies payment → Funds marked as VERIFIED → Transfer initiated
 */

const { DataTypes } = require('sequelize');
const db = require('../config/db');

/**
 * Donation Model
 * Represents a financial contribution from a Donor towards a School or a specific Welfare Request.
 */
const Donation = db.define('Donation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    donorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'donor_id'
    },
    schoolId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'school_id'
    },
    welfareRequestId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'welfare_request_id'
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    paymentMethod: {
        type: DataTypes.ENUM('ONLINE', 'BANK_TRANSFER'),
        allowNull: false,
        field: 'payment_method'
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'VERIFIED', 'REJECTED'),
        defaultValue: 'PENDING'
    },
    receiptReference: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'receipt_reference'
    },
    isAnonymous: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_anonymous'
    }
}, {
    tableName: 'donations',
    underscored: true,
    indexes: [
        { fields: ['status'] },
        { fields: ['donor_id'] },
        { fields: ['welfare_request_id'] },
        { fields: ['created_at'] }
    ]
});

module.exports = Donation;
