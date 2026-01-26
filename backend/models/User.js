const { DataTypes } = require('sequelize');
const db = require('../config/db');

const User = db.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('zeo', 'principal', 'teacher', 'donor'),
        allowNull: false,
        defaultValue: 'donor'
    },
    // Authentication & Verification
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    verificationToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    verificationTokenExpire: {
        type: DataTypes.DATE,
        allowNull: true
    }
});

// Associations
// Note: We need to require the other models here or in a init file to set up associations
// To avoid circular dependency issues, we can do it in a separate 'associations.js' or handle carefully.
// For simplicity in this project, we'll try to do it here but we must require them.

// To prevent circular dependency crash during module load:
// We will export a function or handle associations in server.js/db.js or just use Strings if models are registered.
// Sequelize allows associating by model name string usually if loaded.
// BUT simplest currently: Let's assume we do associations in a `models/index.js` or `server.js` 
// or I will attach them here using late requires.

module.exports = User;
