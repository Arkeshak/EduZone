const db = require('./config/db');
const User = require('./models/User');
const { registerDonor, verifyEmail } = require('./controllers/authController');

// Mock Express Request/Response
const mockReq = (body) => ({ body });
const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

const runTest = async () => {
    console.log('🚀 Starting Full Auth Flow Verification...');

    try {
        await db.sync();
        const testEmail = process.env.SMTP_EMAIL; // Use the provided email to verify delivery

        // 1. Cleanup
        await User.destroy({ where: { email: testEmail } });
        console.log('🧹 Cleaned up previous test user.');

        // 2. Register
        console.log(`\n📧 Registering donor: ${testEmail}...`);
        const regReq = mockReq({
            name: 'Test Donor',
            email: testEmail,
            password: 'password123'
        });
        const regRes = mockRes();
        await registerDonor(regReq, regRes);

        console.log(`Debug: Status ${regRes.statusCode}, Body:`, regRes.data);

        if (regRes.statusCode === 201) {
            console.log('✅ Registration logic successful.');
            console.log('   Response:', regRes.data.message);
        } else {
            throw new Error(`Registration failed: ${JSON.stringify(regRes.data)}`);
        }

        // 3. Fetch Code from DB (Simulating checking email)
        const user = await User.findOne({ where: { email: testEmail } });
        const code = user.verificationToken;
        console.log(`\n🔍 Database Check: Retrieved Verification Code: [ ${code} ]`);
        console.log('   (You should receive an email with this code closely matching the timestamp)');

        // 4. Verify Code
        console.log(`\n🔐 Verifying code...`);
        const verifyReq = mockReq({
            email: testEmail,
            code: code // Using the correct code
        });
        const verifyRes = mockRes();
        await verifyEmail(verifyReq, verifyRes);

        if (verifyRes.statusCode === 200) {
            console.log('✅ Verification successful!');
            console.log('   Token received:', verifyRes.data.token ? 'Yes (JWT)' : 'No');

            // Final DB Check
            await user.reload();
            console.log(`\n🎉 Final Status: User isVerified = ${user.isVerified}`);
        } else {
            throw new Error(`Verification failed: ${JSON.stringify(verifyRes.data)}`);
        }

    } catch (error) {
        const fs = require('fs');
        fs.writeFileSync('error.log', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        console.error('\n❌ Test Failed:', error);
    } finally {
        process.exit();
    }
};

runTest();
