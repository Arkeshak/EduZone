const sequelize = require('./config/db');
const Resource = require('./models/Resource');

(async () => {
    try {
        await sequelize.authenticate();
        await Resource.sync({ force: true }); // Reset Resource table for testing
        console.log("Resource table created successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
})();
