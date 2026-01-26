const School = require('./models/School');
const db = require('./config/db');
require('dotenv').config();

const checkSchools = async () => {
    try {
        await db.authenticate();
        console.log('DB Connected.');
        const schools = await School.findAll();
        console.log('Schools found:', JSON.stringify(schools, null, 2));
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkSchools();
