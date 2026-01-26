const sequelize = require('./config/db');
const User = require('./models/User');
const School = require('./models/School');

// Mimic what User.js does (since it might only run if required)
// In a real app, models/index.js usually loads them. 
// authController requires User.js, which requires School.js and sets associations.
// So we just require User.js here.

const testLogin = async () => {
    try {
        await sequelize.authenticate();
        console.log('DB Connected.');

        const email = 'principal@hatton.lk';

        console.log(`Searching for ${email}...`);

        // This is the identical query from authController
        const user = await User.findOne({
            where: { email },
            include: [{ model: School, as: 'schoolData' }]
        });

        if (user) {
            console.log('User found:', user.name);
            console.log('School Data:', user.schoolData ? user.schoolData.name : 'None');
            console.log('Role:', user.role);
            console.log('Verified:', user.isVerified);
        } else {
            console.log('User NOT found.');
        }

    } catch (error) {
        console.error('CRASHED:', error);
    } finally {
        await sequelize.close();
    }
};

testLogin();
