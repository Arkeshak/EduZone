const { sequelize } = require('../models');

async function checkSchema() {
    try {
        const [results] = await sequelize.query("SHOW COLUMNS FROM users;");
        console.log("Users Table Columns:");
        console.table(results);
        
        const hasColumn = results.some(column => column.Field === 'profile_picture');
        console.log(`\nHas 'profile_picture' column: ${hasColumn}`);
    } catch (error) {
        console.error("Failed to check schema:", error);
    } finally {
        await sequelize.close();
    }
}

checkSchema();
