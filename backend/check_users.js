const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function checkUsers() {
    try {
        console.log('Checking for users...');
        const users = await User.findAll();
        console.log(`Found ${users.length} users.`);

        if (users.length > 0) {
            const user = users[0];
            console.log(`Testing password for user: ${user.email}`);
            console.log(`Stored Hash: ${user.password}`);

            const isMatch = await bcrypt.compare('password', user.password);
            console.log(`Password 'password' match result: ${isMatch}`);
        } else {
            console.log('No users found. Database might be empty.');
        }

    } catch (error) {
        console.error('Error checking users:', error);
    }
}

checkUsers();
