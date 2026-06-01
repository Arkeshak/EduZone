const { DataTypes } = require('sequelize');
const db = require('../config/db');

const WelfareApproval = db.define('WelfareApproval', {
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
    approvedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'approved_by'
    },
    role: {
        type: DataTypes.ENUM('PRINCIPAL', 'ZEO'),
        allowNull: false
    },
    decision: {
        type: DataTypes.ENUM('APPROVED', 'REJECTED', 'TRANSFERRED'),
        allowNull: false
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'welfare_approvals',
    underscored: true
});

module.exports = WelfareApproval;
