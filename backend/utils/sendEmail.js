const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // For development, use Ethereal or just log
    // In production, user should provide SMTP details in .env

    // Create a transporter
    // If SMTP_HOST is defined, use that. Else use Ethereal for testing.
    let transporter;

    if (process.env.SMTP_HOST) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
            }
        });
    } else {
        // Fallback to console log mock
        console.log('----------------------------------------------------');
        console.log(`[MOCK EMAIL SERVICE] To: ${options.email}`);
        console.log(`[MOCK EMAIL SERVICE] Subject: ${options.subject}`);
        console.log(`[MOCK EMAIL SERVICE] Message: ${options.message}`);
        console.log('----------------------------------------------------');
        return;
    }

    const message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    console.log(`[sendEmail] Connecting to ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}...`);
    try {
        const info = await transporter.sendMail(message);
        console.log('[sendEmail] Message sent: %s', info.messageId);
    } catch (err) {
        console.error('[sendEmail] Error:', err.message);
        throw err;
    }
};

module.exports = sendEmail;
