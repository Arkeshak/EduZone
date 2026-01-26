require('dotenv').config({ path: 'backend/.env' });
const sendEmail = require('./backend/utils/sendEmail');

const testEmail = async () => {
    console.log('Testing Email Standalone...');
    try {
        await sendEmail({
            email: process.env.SMTP_EMAIL,
            subject: 'Test 2',
            message: 'Testing again'
        });
        console.log('Done');
    } catch (err) {
        console.error(err);
    }
};

testEmail();
