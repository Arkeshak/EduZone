const { DataTypes } = require('sequelize');
const db = require('../config/db');

const WelfareHistory = db.define('WelfareHistory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    requestId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'WelfareRequests',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    changedById: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    changeDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    remarks: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = WelfareHistory;
