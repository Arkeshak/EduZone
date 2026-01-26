const { DataTypes } = require('sequelize');
const db = require('../config/db');

const School = db.define('School', {
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
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    division: {
        type: DataTypes.STRING,
        allowNull: false
    },
    censusNo: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = School;
