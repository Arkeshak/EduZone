const { DataTypes } = require('sequelize');
const db = require('../config/db');

const TransferRequest = db.define('TransferRequest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        defaultValue: 'Pending'
    },
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // Associations: teacherId, fromSchoolId, toSchoolId, approvedByZEOId
});

module.exports = TransferRequest;
