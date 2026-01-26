const { sequelize } = require('./models');

async function nuke() {
    try {
        console.log('Disabling FK checks...');
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

        console.log('Syncing with force: true...');
        await sequelize.sync({ force: true });

        console.log('Enabling FK checks...');
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Database Nuked and Reset Successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Nuke Failed:', error);
        process.exit(1);
    }
}

nuke();
