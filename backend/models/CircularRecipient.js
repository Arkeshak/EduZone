const { DataTypes } = require('sequelize');
const db = require('../config/db');

const CircularRecipient = db.define('CircularRecipient', {
    circularId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: 'circular_id'
    },
    role: {
        type: DataTypes.ENUM('PRINCIPAL', 'TEACHER'),
        primaryKey: true
    }
}, {
    tableName: 'circular_recipients',
    underscored: true,
    timestamps: false
});

module.exports = CircularRecipient;
