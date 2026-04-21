const { DataTypes } = require('sequelize');
const db = require('../config/db');

/**
 * WelfareType Model
 * Purpose: Stores the list of available welfare categories/types (e.g., Books, Medical, etc.)
 * Manageable by ZEO administrators.
 */
const WelfareType = db.define('WelfareType', {
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
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'welfare_types',
    underscored: true,
    timestamps: true
});

module.exports = WelfareType;
