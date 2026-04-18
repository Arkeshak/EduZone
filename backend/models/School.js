/**
 * SCHOOL MODEL
 * 
 * File Purpose: Defines school/institution data
 * Used for: Storing school information and bank details for fund transfers
 * 
 * Core fields:
 * - name: School name (unique)
 * - address: Physical location
 * - division: Administrative division/district
 * - bankName/bankBranch/accountNumber/accountHolder: Bank info for receiving welfare funds
 * 
 * Relationships:
 * - School 1:Many Teacher
 * - School 1:Many Principal
 * - School 1:Many Student
 * - School 1:Many WelfareRequest
 * - School 1:Many Donation
 * 
 * Usage: Fund transfers go to school bank account, teachers/principals belong to school
 */

const { DataTypes } = require('sequelize');
const db = require('../config/db');

/**
 * School Model
 * Contains school details, including bank information for welfare transfers.
 */
const School = db.define('School', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    division: {
        type: DataTypes.STRING,
        allowNull: true
    },
    bankName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'bank_name'
    },
    bankBranch: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'bank_branch'
    },
    accountNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'account_number'
    },
    accountHolder: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'account_holder'
    }
}, {
    tableName: 'schools',
    underscored: true
});

module.exports = School;
