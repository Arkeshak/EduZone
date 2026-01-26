require('dotenv').config();

console.log('DEBUG ENV VARS:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASS:', `'${process.env.DB_PASS}'`); // Wrap in quotes to see if empty or undefined
console.log('DB_PASS type:', typeof process.env.DB_PASS);
