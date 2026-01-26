const { DataTypes } = require('sequelize');
const db = require('../config/db');
const User = require('./User');
const School = require('./School');

const Teacher = db.define('Teacher', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // Foreign Keys handle the linking (UserId, SchoolId)
    // sequelize associations will add userId and SchoolId

    subjects: {
        type: DataTypes.JSON, // Array of strings e.g. ["Maths", "Science"]
        allowNull: false
    },
    appointmentDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    }
});

// We will define associations in a central index or after definition
// But for now, let's keep it simple here or in User.js.
// Best practice: Defined in separate file or bottom of model if circular dep avoided.
// Let's define them in User.js or a central models/index.js later, 
// OR just put the foreign keys here explicitly to be safe.

module.exports = Teacher;
