const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Donor = db.define('Donor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: 'user_id'
    },
    organizationName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'organization_name'
    },
    contactNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'contact_number'
    }
}, {
    tableName: 'donors',
    underscored: true
});

module.exports = Donor;
