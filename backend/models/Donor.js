const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Donor = db.define('Donor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    organizationName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    totalDonations: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    }
});

module.exports = Donor;
