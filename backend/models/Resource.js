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
    underscored: true
});

module.exports = Resource;
