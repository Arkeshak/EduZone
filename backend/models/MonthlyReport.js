const { DataTypes } = require('sequelize');
const db = require('../config/db');

const MonthlyReport = db.define('MonthlyReport', {
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
    reportMonth: {
        type: DataTypes.DATEONLY, // report_month DATE
        allowNull: false,
        field: 'report_month'
    },
    avgAttendance: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        field: 'avg_attendance'
    },
    staffAttendance: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        field: 'staff_attendance'
    },
    dropoutCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'dropout_count'
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'monthly_reports',
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['school_id', 'report_month']
        }
    ]
});

module.exports = MonthlyReport;
