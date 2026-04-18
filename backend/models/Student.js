/**
 * STUDENT MODEL
 * 
 * File Purpose: Represents student records within a school
 * Used for: Recording student data for welfare request creation
 * 
 * Core fields:
 * - schoolId: Which school student attends
 * - fullName: Student name
 * - grade: Grade/class level (8, 9, 12, etc.)
 * - section: Class section (A, B, C, etc.)
 * 
 * Relationships:
 * - Student Many:One School
 * - Student 1:Many WelfareRequest
 * 
 * Usage: When teacher creates welfare request, student record is created/updated
 */

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
