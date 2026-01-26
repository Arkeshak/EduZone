const { sequelize, User, School, Teacher, Principal, Donor, WelfareRequest } = require('./models');
const bcrypt = require('bcryptjs');

const seedData = async () => {
    try {
        await sequelize.authenticate();

        // Disable FK checks to allow dropping tables cleanly
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        await sequelize.sync({ force: true }); // CLEAR DATABASE & TABLES
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Database cleared and synced.');

        // 1. Create Schools (10 Schools)
        const schoolsToCreate = [
            "Hatton Central College",
            "St. John's Bosco",
            "Gabriel's Convent",
            "Highlands College",
            "Shannon Tamil Vid",
            "Norwood National",
            "Bogawantalawa Central",
            "Maskeliya Tamil Vid",
            "Dickoya Urban Council",
            "St. Andrews College"
        ];

        const schools = [];
        for (const name of schoolsToCreate) {
            schools.push(await School.create({ name, address: "Hatton Zone", division: "Hatton" }));
        }
        console.log('10 Schools Created.');

        // 2. Create Users & Profiles
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        // ZEO Admin (No additional profile needed yet, or could add ZeoProfile later)
        await User.create({
            name: "Zonal Director",
            email: "zeo@eduzone.lk",
            password: hashedPassword,
            role: "zeo",
            isVerified: true
        });

        // Principal (User + Principal Profile)
        const principalUser = await User.create({
            name: "Mrs. S. Perera",
            email: "principal@hatton.lk",
            password: hashedPassword,
            role: "principal",
            isVerified: true
        });
        await Principal.create({
            userId: principalUser.id,
            schoolId: schools[0].id,
            appointmentDate: new Date()
        });

        // Teacher (User + Teacher Profile)
        const teacherUser = await User.create({
            name: "Mr. K. Silva",
            email: "teacher@hatton.lk",
            password: hashedPassword,
            role: "teacher",
            isVerified: true
        });
        const teacherProfile = await Teacher.create({
            userId: teacherUser.id,
            schoolId: schools[0].id,
            subjects: ["Mathematics", "Science"],
            appointmentDate: new Date()
        });

        // Donor (User + Donor Profile)
        const donorUser = await User.create({
            name: "Alice Foundation",
            email: "donor@gmail.com",
            password: hashedPassword,
            role: "donor",
            isVerified: true
        });
        await Donor.create({
            userId: donorUser.id,
            organizationName: "Alice Corp",
            totalDonations: 0
        });

        console.log('Users & Profiles Created (Password: 123456).');

        // 3. Create Sample Welfare Request
        // Needs teacherId (Profile ID) or User ID? 
        // Associations say `Teacher.hasMany(WelfareRequest)`.
        // This usually implies `teacherId` points to `Teacher.id` (PK) OR `User.id` depending on setup.
        // In `models/index.js`, we did `Teacher.hasMany(..., { foreignKey: 'teacherId' })`.
        // Sequelize default references the MODEL's PK (Teacher.id).
        await WelfareRequest.create({
            teacherId: teacherProfile.id, // Using Profile ID
            SchoolId: schools[0].id,
            studentName: "Kamal Perera",
            grade: "10-A",
            description: "Financial assistance needed for O/L tuition fees.",
            requirements: "Tuition Fees",
            priority: "High",
            category: "Financial Aid",
            cost: 5000,
            status: "Pending"
        });

        console.log('Sample Welfare Request Created.');
        console.log('SEEDING COMPLETE.');
        process.exit(0);

    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
