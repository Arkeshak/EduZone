const { Donation, sequelize } = require('../models');

async function fixDatabase() {
  try {
    console.log('Verifying Database Connection...');
    await sequelize.authenticate();
    console.log('Connection established.');

    console.log('Synchronizing Donation Model (Adding missing columns if any)...');
    // Using alter: true will add missing columns (like is_anonymous) without dropping data
    await Donation.sync({ alter: true });
    console.log('Donation table synchronized successfully.');

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

fixDatabase();
