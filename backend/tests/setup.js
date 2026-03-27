const { sequelize } = require('../models');

// Increase global timeout
jest.setTimeout(10000);

// Mock send email globally
jest.mock('../utils/sendEmail', () => {
    return jest.fn().mockResolvedValue(true);
});

// Sync the database before all tests
beforeAll(async () => {
    // Force sync creates fresh tables
    await sequelize.sync({ force: true });
});

// Close connection after all tests
afterAll(async () => {
    await sequelize.close();
});
