const { sequelize } = require('./models');

async function forceAdd() {
    try {
        console.log('Attempting to add teacherId column...');
        await sequelize.query("ALTER TABLE Resources ADD COLUMN teacherId INT NULL;");
        console.log('teacherId added.');
    } catch (error) {
        console.log('Error adding teacherId (likely exists):', error.original ? error.original.sqlMessage : error.message);
    }

    try {
        console.log('Attempting to add schoolId column...');
        await sequelize.query("ALTER TABLE Resources ADD COLUMN schoolId INT NULL;");
        console.log('schoolId added.');
    } catch (error) {
        console.log('Error adding schoolId (likely exists):', error.original ? error.original.sqlMessage : error.message);
    }

    await sequelize.close();
}

forceAdd();
