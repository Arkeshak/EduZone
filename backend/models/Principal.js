/**
 * PRINCIPAL MODEL
 * 
 * File Purpose: Extends User with principal-specific school assignment info.
 * Used for: Identifying which school a principal manages and enforcing access control.
 * 
 * Core fields:
 * - userId: Reference to the User account
 * - schoolId: School assigned to this principal
 * - contactNumber: Optional phone number
 * 
 * Relationships:
 * - Principal belongsTo User
 * - Principal belongsTo School
 * 
 * Usage: Principal routes use this to determine school scope and permissions.
 */
const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Principal = db.define('Principal', {
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
        unique: true,
        field: 'school_id'
    },
    contactNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'contact_number'
    }
}, {
    tableName: 'principals',
    underscored: true,
    indexes: [
        { fields: ['user_id'], unique: true },
        { fields: ['school_id'], unique: true }
    ]
});

module.exports = Principal;
