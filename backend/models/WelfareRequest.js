const { DataTypes } = require('sequelize');
const db = require('../config/db');
const User = require('./User');

const WelfareRequest = db.define('WelfareRequest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // school: { type: DataTypes.STRING } -> Moved to Association (SchoolId)
    studentName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    grade: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    requirements: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Approved by Principal', 'Approved by ZEO', 'Rejected'),
        defaultValue: 'Pending'
    },
    priority: {
        type: DataTypes.ENUM('High', 'Medium', 'Low'),
        defaultValue: 'Medium'
    },
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    fundedAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    evidenceUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    approvedByPrincipalId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    approvedByZEOId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

// Associations are now handled in models/index.js
// WelfareRequest.belongsTo(User, ...); -> Removed
// WelfareRequest.belongsTo(School, ...); -> Removed

module.exports = WelfareRequest;
