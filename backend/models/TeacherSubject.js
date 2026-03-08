const { DataTypes } = require('sequelize');
const db = require('../config/db');

const TeacherSubject = db.define('TeacherSubject', {
    teacherId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: 'teacher_id'
    },
    subjectId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: 'subject_id'
    }
}, {
    tableName: 'teacher_subjects',
    underscored: true,
    timestamps: false
});

module.exports = TeacherSubject;
