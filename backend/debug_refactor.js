const { sequelize, User, Teacher, Principal, Donor, School } = require('./models');
const bcrypt = require('bcryptjs');

const verifySystem = async () => {
    try {
        await sequelize.authenticate();
        console.log("DB Connection: OK");

        // Test Helper
        const checkLogin = async (email, role) => {
            console.log(`\nTesting Login for ${role} (${email})...`);
            const user = await User.findOne({ where: { email } });
            if (!user) { console.error("User not found!"); return; }

            console.log(`User Found: ${user.name}`);

            // Fetch Profile using new logic
            let profile = null;
            if (role === 'teacher') profile = await Teacher.findOne({ where: { userId: user.id }, include: ['schoolData'] });
            if (role === 'principal') profile = await Principal.findOne({ where: { userId: user.id }, include: ['schoolData'] });
            if (role === 'donor') profile = await Donor.findOne({ where: { userId: user.id } });

            if (profile) {
                console.log(`Profile Found: ID ${profile.id}`);
                if (role !== 'donor') console.log(`School: ${profile.schoolData?.name || 'N/A'}`);
            } else {
                console.error("Profile NOT found! Schema migration might be incomplete.");
            }
        };

        await checkLogin('teacher@hatton.lk', 'teacher');
        await checkLogin('principal@hatton.lk', 'principal');
        await checkLogin('donor@gmail.com', 'donor');

        // Verify Donation Link
        const { Donation, Donor } = require('./models');
        console.log('\nChecking Donation Link...');
        // Create a dummy donation to test
        const donorUser = await User.findOne({ where: { email: 'donor@gmail.com' } });
        const donorProfile = await Donor.findOne({ where: { userId: donorUser.id } });

        const donation = await Donation.create({
            donorId: donorProfile.id,
            amount: 100,
            description: "Test Flow",
            isAnonymous: false
        });

        console.log(`Donation Created: ID ${donation.id}`);
        const fetchedDonation = await Donation.findByPk(donation.id, { include: ['donor'] });
        console.log(`Fetched Donation linked to Donor Profile: ${fetchedDonation.donor ? fetchedDonation.donor.organizationName : 'FAILED LINK'}`);

    } catch (e) {
        console.error("Verification Failed:", e);
    } finally {
        await sequelize.close();
    }
};

verifySystem();
