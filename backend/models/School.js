const { DataTypes } = require('sequelize');
const db = require('../config/db');

/**
 * School Model
 * Contains school details, including bank information for welfare transfers.
 */
const School = db.define('School', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    division: {
        type: DataTypes.STRING,
        allowNull: true
    },
    bankName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'bank_name'
    },
    bankBranch: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'bank_branch'
    },
    accountNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'account_number'
    },
    accountHolder: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'account_holder'
    }
}, {
    tableName: 'schools',
    underscored: true
});

module.exports = School;
