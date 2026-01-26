const db = require('./config/db');

async function test() {
    console.log('Testing connection via db.js...');
    try {
        await db.authenticate();
        console.log('✅ Connection has been established successfully via db.js.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        if (error.errors) {
            error.errors.forEach(e => console.error('  - ', e.message));
        }
    } finally {
        await db.close();
    }
}

test();
