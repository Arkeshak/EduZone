/**
 * USER MODEL
 * 
 * File Purpose: Defines user schema for all system actors
 * Used for: Authentication, authorization, user profile storage
 * 
 * Represents: ZEO, Principal, Teacher, Donor accounts
 * Key fields:
 * - email: Unique identifier for login
 * - passwordHash: bcrypt hashed password
 * - role: User type (ZEO, PRINCIPAL, TEACHER, DONOR)
 * - isVerified: Email has been verified
 * - isActive: Account is not suspended
 * - activationToken/PasswordReset tokens: For email verification/password reset
 * 
 * Relationships:
 * - User 1:1 Principal
 * - User 1:1 Teacher  
 * - User 1:1 Donor
 */

const { DataTypes } = require('sequelize');
const db = require('../config/db');

/**
 * User Model
 * Defines the core user schema for authentication and role-based access.
 * Represents all actors in the app (ZEO, Principal, Teacher, Donor).
 */
const User = db.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'full_name'
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'password_hash'
    },
    role: {
        type: DataTypes.ENUM('ZEO', 'PRINCIPAL', 'TEACHER', 'DONOR'),
        allowNull: false
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_verified'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    },
    activationToken: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'activation_token'
    },
    activationExpires: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'activation_expires'
    },
    refreshToken: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'refresh_token'
    }
}, {
    tableName: 'users',
    underscored: true,
    indexes: [
        { fields: ['email'], unique: true },
        { fields: ['role'] },
        { fields: ['is_verified'] },
        { fields: ['is_active'] }
    ]
});

module.exports = User;
