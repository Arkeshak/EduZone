const { DataTypes } = require('sequelize');
const db = require('../config/db');
const User = require('./User');
const WelfareRequest = require('./WelfareRequest');

const Donation = db.define('Donation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    allocation: {
        type: DataTypes.STRING,
        defaultValue: 'General Fund'
    },
    isAnonymous: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Completed', 'Failed'),
        defaultValue: 'Completed'
    },
    transactionId: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

// Associations handled in models/index.js
// Donation.belongsTo(User, ...) -> Removed/Changed to Donor Profile

module.exports = Donation;
