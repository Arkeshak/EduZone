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
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    // recipients: 'principals', 'teachers', 'all'
    targetAudience: {
        type: DataTypes.STRING,
        defaultValue: 'all'
    },
    status: {
        type: DataTypes.ENUM('Published', 'Draft'),
        defaultValue: 'Published'
    }
    // We will associate with 'User' (ZEO) as 'author'
});

module.exports = Circular;
