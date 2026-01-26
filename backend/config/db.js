const Sequelize = require('sequelize');
const dotenv = require('dotenv');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });



const db = new Sequelize(
    process.env.DB_NAME || 'eduzone',
    process.env.DB_USER || 'root',
    process.env.DB_PASS !== undefined ? process.env.DB_PASS : '',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        logging: console.log
    }
);

module.exports = db;
