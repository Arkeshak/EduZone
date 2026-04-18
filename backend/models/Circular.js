/**
 * CIRCULAR MODEL
 * 
 * File Purpose: Stores official announcements and circulars for school stakeholders.
 * Used for: Publishing notices from ZEO or administrators to principals/teachers.
 * 
 * Core fields:
 * - title: Circular headline
 * - message: Full circular content
 * - status: DRAFT or PUBLISHED
 * - publishedBy: User ID of creator/publisher
 * - publishedAt: Timestamp when published
 * 
 * Relationships:
 * - Circular belongsTo User (publisher)
 * 
 * Usage: ZEO or admins draft and publish circulars for notification distribution.
 */
const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Circular = db.define('Circular', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('DRAFT', 'PUBLISHED'),
        defaultValue: 'DRAFT'
    },
    publishedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'published_by'
    },
    publishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'published_at'
    }
}, {
    tableName: 'circulars',
    underscored: true
});

module.exports = Circular;
