const { DataTypes } = require('sequelize');
const db = require('../config/db');

const CircularAttachment = db.define('CircularAttachment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    circularId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'circular_id'
    },
    fileUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'file_url'
    }
}, {
    tableName: 'circular_attachments',
    underscored: true,
    timestamps: false
});

module.exports = CircularAttachment;
