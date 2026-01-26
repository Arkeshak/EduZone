const { DataTypes } = require('sequelize');
const db = require('../config/db');

const MonthlyReport = db.define('MonthlyReport', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    month: {
        type: DataTypes.STRING, // YYYY-MM
        allowNull: false
    },
    averageAttendance: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    staffAttendance: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    dropoutCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    authorId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    schoolName: {
        type: DataTypes.STRING,
        allowNull: true
    }
    // Associated with Principal (Reporter) and School (Subject)
});

module.exports = MonthlyReport;
