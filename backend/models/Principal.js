const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Principal = db.define('Principal', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // Linked to User and School
    appointmentDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    }
});

module.exports = Principal;
