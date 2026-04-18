/**
 * SUBJECT MODEL
 * 
 * File Purpose: Defines subjects/courses in the education system
 * Used for: Categorizing resources and teacher assignments
 * 
 * Core fields:
 * - name: Subject name (Math, Science, English, etc.) - UNIQUE
 * 
 * Relationships:
 * - Subject hasMany Resource
 * - Subject hasMany TeacherSubject
 * 
 * Usage: When teachers upload resources, they select subject; filters available subjects
 */

const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Subject = db.define('Subject', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'subjects',
    underscored: true,
    timestamps: false
});

module.exports = Subject;
