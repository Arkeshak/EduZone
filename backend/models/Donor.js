/**
 * DONOR MODEL
 * 
 * File Purpose: Extends User model with donor-specific profile data
 * Used for: Storing donor account details, tracking individual or organizational donors
 * 
 * Core fields:
 * - userId: Reference to the User account
 * - organizationName: Company/organization name (optional)
 * - contactNumber: Phone number (optional)
 * 
 * Relationships:
 * - Donor belongsTo User
 * - Donor hasMany Donation
 * 
 * Usage: When donor logs in, system loads Donor profile; used to associate donations
 */

const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Donor = db.define('Donor', {
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
    organizationName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'organization_name'
    },
    contactNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'contact_number'
    }
}, {
    tableName: 'donors',
    underscored: true,
    indexes: [
        { fields: ['user_id'], unique: true }
    ]
});

module.exports = Donor;
