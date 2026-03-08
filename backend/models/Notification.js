const { DataTypes } = require('sequelize');
const db = require('../config/db');

/**
 * Notification Model
 * Stores basic system notifications for users (e.g., status updates on requests, approvals).
 */
const Notification = db.define('Notification', {
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
    title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_read'
    }
}, {
    tableName: 'notifications',
    underscored: true
});

module.exports = Notification;
