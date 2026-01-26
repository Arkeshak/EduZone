const User = require('./models/User');
const db = require('./config/db');

(async () => {
    await db.sync();
    const user = await User.findOne({ where: { email: process.env.SMTP_EMAIL } });
    if (user) {
        console.log('User Found:', user.email);
        console.log('Is Verified:', user.isVerified);
        console.log('Token:', user.verificationToken);
    } else {
        console.log('User Not Found');
    }
    process.exit();
})();
