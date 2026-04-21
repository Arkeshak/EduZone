/**
 * WELFARE REQUEST MODEL
 * 
 * File Purpose: Defines welfare/assistance request schema
 * Used for: Tracking student financial assistance from submission to funding
 * 
 * Core fields:
 * - studentId: Which student needs assistance
 * - teacherId: Teacher who submitted request
 * - schoolId: School the student attends
 * - category: Type of assistance (Fees, Medical, Transport, etc.)
 * - amountRequired: How much money is needed
 * - status: Current workflow state (SUBMITTED → PUBLISHED → FULLY_FUNDED → TRANSFERRED)
 * - priority: Urgency level (LOW, MEDIUM, HIGH)
 * 
 * State Machine Flow:
 * SUBMITTED → PRINCIPAL_APPROVED → ZEO_APPROVED → PUBLISHED → 
 * PARTIALLY_FUNDED → FULLY_FUNDED → TRANSFERRED
 * 
 * Relationships:
 * - WelfareRequest 1:Many Donation
 * - WelfareRequest 1:One Student
 * - WelfareRequest 1:One Teacher
 */

const { DataTypes } = require('sequelize');
const db = require('../config/db');

/**
 * WelfareRequest Model
 * The core entity representing a student's need for financial assistance.
 * Tracks the lifecycle from SUBMITTED by Teacher to TRANSFERRED (funded).
 */
const WelfareRequest = db.define('WelfareRequest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    referenceCode: {
        type: DataTypes.STRING,
        unique: true,
        field: 'reference_code'
    },
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'student_id'
    },
    teacherId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'teacher_id'
    },
    schoolId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'school_id'
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    amountRequired: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'amount_required'
    },
    status: {
        type: DataTypes.ENUM(
            'SUBMITTED',
            'PRINCIPAL_APPROVED',
            'ZEO_APPROVED',
            'PUBLISHED',
            'PARTIALLY_FUNDED',
            'FULLY_FUNDED',
            'TRANSFERRED',
            'REJECTED'
        ),
        defaultValue: 'SUBMITTED'
    },
    priority: {
        type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'),
        defaultValue: 'MEDIUM'
    }
}, {
    tableName: 'welfare_requests',
    underscored: true,
    indexes: [
        { fields: ['status'] },
        { fields: ['school_id'] },
        { fields: ['teacher_id'] },
        { fields: ['student_id'] },
        { fields: ['created_at'] }
    ]
});

module.exports = WelfareRequest;
