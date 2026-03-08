const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Teacher = db.define('Teacher', {
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
        field: 'school_id'
    },
    contactNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'contact_number'
    }
}, {
    tableName: 'teachers',
    underscored: true
});

module.exports = Teacher;
