const { User, sequelize } = require('../models');

async function syncUserTable() {
  try {
    console.log('Verifying Database Connection...');
    await sequelize.authenticate();
    console.log('Connection established.');

    console.log('Synchronizing User Model (Adding phone_number and address columns)...');
    // Using alter: true will add missing columns without dropping existing data
    await User.sync({ alter: true });
    console.log('User table synchronized successfully.');

    process.exit(0);
  } catch (error) {
    console.error('Synchronization failed:', error);
    process.exit(1);
  }
}

syncUserTable();
