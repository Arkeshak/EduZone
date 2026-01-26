require('dotenv').config();
const nodemailer = require('nodemailer');

const debugEmail = async () => {
    console.log('--- Email Debug Utility ---');
    console.log('Host:', process.env.SMTP_HOST);
    console.log('Port:', process.env.SMTP_PORT);
    console.log('User:', process.env.SMTP_EMAIL);
    console.log('Pass:', process.env.SMTP_PASSWORD ? '******' : '(missing)');
    console.log('Secure:', process.env.SMTP_PORT == 465);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT == 465,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        },
        debug: true, // Show detailed logs
        logger: true // Log to console
    });

    try {
        console.log('Attempting to verify connection...');
        await transporter.verify();
        console.log('✅ Connection Verified!');

        console.log('Attempting to send mail...');
        const info = await transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to: process.env.SMTP_EMAIL, // Send to self
            subject: 'Debug Test',
            text: 'This is a debug email.'
        });
        console.log('✅ Message sent:', info.messageId);
    } catch (error) {
        console.error('❌ FAILURE:', error);
    }
};

debugEmail();
