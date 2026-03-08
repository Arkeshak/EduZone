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
        type: DataTypes.ENUM('Supplies', 'Fees', 'Medical', 'Transport', 'Equipment', 'Hostel', 'Food', 'Books', 'Uniforms', 'Other'),
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
        {
            fields: ['status']
        },
        {
            fields: ['school_id']
        },
        {
            fields: ['teacher_id']
        }
    ]
});

module.exports = WelfareRequest;
