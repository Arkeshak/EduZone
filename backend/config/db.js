const Sequelize = require('sequelize');
const dotenv = require('dotenv');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });



let db;

if (process.env.NODE_ENV === 'test') {
    db = new Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false
    });
} else {
    db = new Sequelize(
        process.env.DB_NAME || 'eduzone',
        process.env.DB_USER || 'root',
        process.env.DB_PASS !== undefined ? process.env.DB_PASS : '',
        {
            host: process.env.DB_HOST || '127.0.0.1',
            dialect: 'mysql',
            port: parseInt(process.env.DB_PORT || '3306', 10),
            logging: false
        }
    );
}

module.exports = db;
