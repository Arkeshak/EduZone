const { DataTypes } = require('sequelize');
const db = require('../config/db');

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
    underscored: true
});

module.exports = User;
