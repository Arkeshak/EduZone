/**
 * RESOURCE MODEL
 * 
 * File Purpose: Stores educational materials (PDFs, docs, videos, etc.) uploaded by teachers
 * Used for: Sharing learning materials across school
 * 
 * Core fields:
 * - teacherId: Teacher who uploaded the resource
 * - subjectId: Subject the resource covers
 * - schoolId: School where resource is available
 * - title: Resource name/title
 * - description: What the resource contains
 * - grade: Grade level (10, 11, 12, etc.)
 * - fileUrl: Path to uploaded file
 * - status: PUBLISHED or REMOVED
 * 
 * Relationships:
 * - Resource belongsTo Teacher
 * - Resource belongsTo Subject
 * - Resource belongsTo School
 * 
 * Indexes: Added for efficient queries by teacher, school, subject, and creation date
 */

const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Resource = db.define('Resource', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    teacherId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'teacher_id'
    },
    subjectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'subject_id'
    },
    schoolId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'school_id'
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    grade: {
        type: DataTypes.STRING,
        allowNull: true
    },
    fileUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'file_url'
    },
    status: {
        type: DataTypes.ENUM('PUBLISHED', 'REMOVED'),
        defaultValue: 'PUBLISHED'
    }
}, {
    tableName: 'resources',
    underscored: true,
    indexes: [
        { fields: ['teacher_id'] },
        { fields: ['school_id'] },
        { fields: ['subject_id'] },
        { fields: ['created_at'] }
    ]
});

module.exports = Resource;
