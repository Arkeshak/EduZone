const sequelize = require('./config/db');
const User = require('./models/User');
const School = require('./models/School');
const bcrypt = require('bcryptjs');

const testAuth = async () => {
    try {
        await sequelize.authenticate();
        console.log('DB Connected.');

        const email = 'principal@hatton.lk';
        const password = '123456';

        console.log(`Attempting login for ${email} with password '${password}'...`);

        const user = await User.findOne({
            where: { email },
            include: [{ model: School, as: 'schoolData' }]
        });

        if (!user) {
            console.log('User NOT found.');
            return;
        }

        console.log('User found:', user.name);
        console.log('Stored Hash:', user.password);
        console.log('Verified Status:', user.isVerified);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password Match Result:', isMatch);

        if (isMatch) {
            console.log('LOGIN SHOULD SUCCEED.');
        } else {
            console.log('LOGIN FAILS: Password mismatch.');

            // Debug: Hash '123456' again to compare visually
            const salt = await bcrypt.genSalt(10);
            const newHash = await bcrypt.hash(password, salt);
            console.log('Fresh Hash of 123456:', newHash);
        }

    } catch (error) {
        console.error('CRASHED:', error);
    } finally {
        await sequelize.close();
    }
};

testAuth();
