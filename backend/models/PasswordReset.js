const { DataTypes } = require('sequelize');
const db = require('../config/db');

const PasswordReset = db.define('PasswordReset', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id'
    },
    tokenHash: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'token_hash'
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'expires_at'
    },
    used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'password_resets',
    underscored: true,
    updatedAt: false // Only created_at is in SQL
});

module.exports = PasswordReset;
