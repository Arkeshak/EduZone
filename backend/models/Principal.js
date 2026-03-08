const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Principal = db.define('Principal', {
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
    schoolId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: 'school_id'
    },
    contactNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'contact_number'
    }
}, {
    tableName: 'principals',
    underscored: true
});

module.exports = Principal;
