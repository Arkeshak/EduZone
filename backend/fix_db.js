const { sequelize } = require('./models');

async function fixDb() {
    try {
        console.log('Syncing database with alter: true...');
        await sequelize.sync({ alter: true });
        console.log('Database synced successfully.');
    } catch (error) {
        console.error('Sync failed:', error);
    } finally {
        await sequelize.close();
    }
}

fixDb();
