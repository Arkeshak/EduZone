const User = require('./models/User');
const db = require('./config/db');

(async () => {
    try {
        await db.sync();
        const user = await User.findOne({
            order: [['createdAt', 'DESC']]
        });
        if (user && user.verificationToken) {
            console.log(`LATEST_TOKEN:${user.verificationToken}`);
        } else {
            console.log('NO_TOKEN_FOUND');
        }
    } catch (e) {
        console.error(e);
    }
    process.exit();
})();
