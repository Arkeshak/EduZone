const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Subject = db.define('Subject', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'subjects',
    underscored: true,
    timestamps: false
});

module.exports = Subject;
