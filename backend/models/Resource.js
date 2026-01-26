const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');


const Resource = sequelize.define('Resource', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
        allowNull: false
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fileUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    teacherId: {
        type: DataTypes.INTEGER,
        allowNull: true
        // References handled by association
    },
    schoolId: {
        type: DataTypes.INTEGER,
        allowNull: true
        // References handled by association
    },
    status: {

        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        defaultValue: 'Pending'
    }
    // Associations handled in index.js: teacherId, schoolId added automatically
}, {
    timestamps: true
});

module.exports = Resource;
