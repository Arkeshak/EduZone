/**
 * TEACHER MODEL
 * 
 * File Purpose: Extends User model with teacher-specific data
 * Used for: Storing teacher profile, school assignment, contact info
 * 
 * Core fields:
 * - userId: Reference to User account
 * - schoolId: Which school the teacher belongs to
 * - contactNumber: Phone number
 * 
 * Relationships:
 * - Teacher 1:1 User
 * - Teacher 1:Many WelfareRequest (teacher creates welfare requests)
 * - Teacher 1:Many Resource (teacher uploads materials)
 * - Teacher 1:Many TeacherSubject (subjects teacher teaches)
 * 
 * Usage: When teacher logs in, system loads Teacher profile to get schoolId
 */

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
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'address'
    }
}, {
    tableName: 'teachers',
    underscored: true,
    indexes: [
        { fields: ['user_id'], unique: true },
        { fields: ['school_id'] }
    ]
});

module.exports = Teacher;
