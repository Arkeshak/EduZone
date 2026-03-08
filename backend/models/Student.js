const { DataTypes } = require('sequelize');
const db = require('../config/db');

/**
 * Student Model
 * Represents a student within a specific school.
 * Links to Teacher requests for welfare.
 */
const Student = db.define('Student', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    schoolId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'school_id'
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'full_name'
    },
    grade: {
        type: DataTypes.STRING,
        allowNull: false
    },
    section: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'students',
    underscored: true
});

module.exports = Student;
