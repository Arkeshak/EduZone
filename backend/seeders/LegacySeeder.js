const sequelize = require('./config/db');
const { User, School, Teacher, Principal, Donor, WelfareRequest, Donation, MonthlyReport, Circular, Resource, Student, Subject } = require('./models');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seedData = async () => {
    try {
        // Disable FK checks to allow dropping tables
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
        await sequelize.sync({ force: true });
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });
        console.log('Database synced!');

        // 1. Create Schools
        const schools = await School.bulkCreate([
            { name: 'Ginigathena Central College', address: 'Ginigathena', division: 'Hatton', censusNo: 'CEN001' },
            { name: 'Highlands College', address: 'Hatton', division: 'Hatton', censusNo: 'CEN002' },
            { name: 'St. Gabriel’s Girls’ College', address: 'Hatton', division: 'Hatton', censusNo: 'CEN003' },
            { name: 'St. John Bosco’s College', address: 'Hatton', division: 'Hatton', censusNo: 'CEN004' },
            { name: 'Sri Pada Central College', address: 'Hatton', division: 'Hatton', censusNo: 'CEN005' },
            { name: 'Zonal Education Office', address: 'Nuwara Eliya Rd, Hatton', division: 'Hatton', censusNo: 'ZEO001' }
        ]);

        const hattonCentral = schools[0];
        const highlands = schools[1];
        const stGabriels = schools[2];
        const zeoOffice = schools[schools.length - 1];

        console.log('Schools Seeded!');

        // 2. Create Subjects
        const math = await Subject.create({ name: 'Mathematics' });
        const science = await Subject.create({ name: 'Science' });
        const english = await Subject.create({ name: 'English' });
        const history = await Subject.create({ name: 'History' });
        const literature = await Subject.create({ name: 'Literature' });

        console.log('Subjects Seeded!');

        // 3. Create Users
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password', salt);

        const usersData = [
            { name: 'Mr. Bandara (ZEO)', email: 'zeo@edu.lk', role: 'zeo', isVerified: true },
            { name: 'Mrs. Silva (Principal)', email: 'principal@edu.lk', role: 'principal', isVerified: true }, // Hatton Central
            { name: 'Mr. Perera (Principal)', email: 'principal2@edu.lk', role: 'principal', isVerified: true }, // Highlands
            { name: 'Sarath Perera (Teacher)', email: 'teacher@edu.lk', role: 'teacher', isVerified: true }, // Hatton Central, Math
            { name: 'Rani Devi (Teacher)', email: 'teacher2@edu.lk', role: 'teacher', isVerified: true }, // Highlands, English
            { name: 'Alice Foundations (Donor)', email: 'donor@example.com', role: 'donor', isVerified: true },
            { name: 'Global Education Trust (Donor)', email: 'global@edu.org', role: 'donor', isVerified: true },
            { name: 'Community Helpers (Donor)', email: 'community@help.org', role: 'donor', isVerified: true }
        ];

        // Create Users individually
        const zeoUser = await User.create({ ...usersData[0], password: hashedPassword });
        const principal1 = await User.create({ ...usersData[1], password: hashedPassword });
        const principal2 = await User.create({ ...usersData[2], password: hashedPassword });
        const teacher1 = await User.create({ ...usersData[3], password: hashedPassword });
        const teacher2 = await User.create({ ...usersData[4], password: hashedPassword });
        const donor1 = await User.create({ ...usersData[5], password: hashedPassword });
        const donor2 = await User.create({ ...usersData[6], password: hashedPassword });
        const donor3 = await User.create({ ...usersData[7], password: hashedPassword });

        // 4. Create Profiles & Link Subjects
        await Principal.create({ userId: principal1.id, schoolId: hattonCentral.id, appointmentDate: '2020-01-01' });
        await Principal.create({ userId: principal2.id, schoolId: highlands.id, appointmentDate: '2021-05-15' });

        const t1Profile = await Teacher.create({ userId: teacher1.id, schoolId: hattonCentral.id, appointmentDate: '2019-02-01' });
        await t1Profile.addTeachesSubjects([math, science]); // Sequelize magic method

        const t2Profile = await Teacher.create({ userId: teacher2.id, schoolId: highlands.id, appointmentDate: '2018-03-10' });
        await t2Profile.addTeachesSubjects([english, literature]);

        await Donor.create({ userId: donor1.id, organizationName: 'Alice Foundations', contactNumber: '0771234567' });
        await Donor.create({ userId: donor2.id, organizationName: 'Global Education Trust', contactNumber: '0777654321' });
        await Donor.create({ userId: donor3.id, organizationName: 'Community Helpers', contactNumber: '0712223334' });

        console.log('Profiles & Subjects Seeded!');

        // 5. Create Students
        const students = await Student.bulkCreate([
            { name: 'Nimal Sirisena', currentGrade: '10-A', schoolId: hattonCentral.id },
            { name: 'Saman Kumara', currentGrade: '6-C', schoolId: hattonCentral.id },
            { name: 'Kamala Perera', currentGrade: '8-B', schoolId: highlands.id },
            { name: 'Meena Kumari', currentGrade: '11-A', schoolId: stGabriels.id },
            { name: 'Ravi Shankar', currentGrade: '9-C', schoolId: stGabriels.id },
            { name: 'Fathima Razeena', currentGrade: '7-B', schoolId: stGabriels.id }
        ]);
        console.log('Students Seeded!');

        // 6. Create Welfare Requests
        const requests = await WelfareRequest.bulkCreate([
            {
                StudentId: students[0].id,
                SchoolId: hattonCentral.id,
                description: 'Needs shoes for school season',
                category: 'Uniforms',
                amountRequired: 2500.00,
                priority: 'High',
                teacherId: t1Profile.id,
                status: 'Published', // Was Approved by ZEO
                approvedByPrincipalId: (await Principal.findOne({ where: { userId: principal1.id } })).id,
                approvedByZEOId: zeoUser.id,
                referenceId: 'ZEO-REQ-2024-001'
            },
            {
                StudentId: students[2].id,
                SchoolId: highlands.id,
                description: 'Unable to pay facility fees',
                category: 'Fees',
                cost: 5000.00,
                priority: 'Medium',
                teacherId: t2Profile.id,
                status: 'Principal_Approved', // Was Approved by Principal
                approvedByPrincipalId: (await Principal.findOne({ where: { userId: principal2.id } })).id
            },
            {
                StudentId: students[1].id,
                SchoolId: hattonCentral.id,
                description: 'Notebooks and stationery',
                category: 'Stationery',
                cost: 1500.00,
                priority: 'Low',
                teacherId: t1Profile.id,
                status: 'Submitted' // Was Pending
            },
            {
                StudentId: students[0].id,
                SchoolId: hattonCentral.id,
                description: 'Extra classes fees support',
                category: 'Fees',
                cost: 1200.00,
                priority: 'Medium',
                teacherId: t1Profile.id,
                status: 'Submitted'
            },
            {
                StudentId: students[2].id,
                SchoolId: highlands.id,
                description: 'School bag replacement',
                category: 'Uniforms',
                cost: 1800.00,
                priority: 'Medium',
                teacherId: t2Profile.id,
                status: 'Submitted'
            },
            {
                StudentId: students[3].id,
                SchoolId: stGabriels.id,
                description: 'Science Lab Coat',
                category: 'Uniforms',
                cost: 800.00,
                priority: 'Low',
                status: 'Principal_Approved',
                approvedByPrincipalId: (await Principal.findOne({ where: { schoolId: stGabriels.id } }))?.id || 1
            },
            {
                StudentId: students[4].id,
                SchoolId: stGabriels.id,
                description: 'Mathematics Tuition Support',
                category: 'Fees',
                cost: 1500.00,
                priority: 'High',
                status: 'Principal_Approved',
                approvedByPrincipalId: (await Principal.findOne({ where: { schoolId: stGabriels.id } }))?.id || 1
            },
            {
                StudentId: students[5].id, // Fathima
                SchoolId: stGabriels.id,
                description: 'Books for Term 2',
                category: 'Stationery',
                cost: 2200.00,
                priority: 'Medium',
                status: 'Principal_Approved',
                approvedByPrincipalId: (await Principal.findOne({ where: { schoolId: stGabriels.id } }))?.id || 1
            },
            {
                StudentId: students[0].id, // Nimal again
                SchoolId: hattonCentral.id,
                description: 'Cricket Bat for Sports',
                category: 'Sports',
                cost: 4500.00,
                priority: 'Low',
                status: 'Principal_Approved',
                approvedByPrincipalId: (await Principal.findOne({ where: { userId: principal1.id } })).id
            },
            // --- NEW MOCK DATA ---
            {
                StudentId: students[1].id,
                SchoolId: hattonCentral.id,
                description: 'Geometry Box sets for Grade 8',
                category: 'Stationery',
                cost: 3000.00,
                priority: 'Medium',
                teacherId: t1Profile.id,
                status: 'Submitted' // For Principal Review
            },
            {
                StudentId: students[0].id,
                SchoolId: hattonCentral.id,
                description: 'Lunch box support for 5 students',
                category: 'Food',
                cost: 5000.00,
                priority: 'High',
                teacherId: t1Profile.id,
                status: 'Submitted' // For Principal Review
            },
            {
                StudentId: students[2].id,
                SchoolId: highlands.id,
                description: 'Advanced Level Physics Textbooks',
                category: 'Books',
                cost: 4500.00,
                priority: 'High',
                teacherId: t2Profile.id,
                status: 'Published', // For Donor Browse
                approvedByPrincipalId: (await Principal.findOne({ where: { userId: principal2.id } })).id,
                approvedByZEOId: zeoUser.id,
                referenceId: 'ZEO-REQ-2024-002'
            },
            {
                StudentId: students[0].id,
                SchoolId: hattonCentral.id,
                description: 'Musical Instruments Maintenance',
                category: 'Equipment',
                cost: 8000.00,
                priority: 'Low',
                teacherId: t1Profile.id,
                status: 'Published', // For Donor Browse
                approvedByPrincipalId: (await Principal.findOne({ where: { userId: principal1.id } })).id,
                approvedByZEOId: zeoUser.id,
                referenceId: 'ZEO-REQ-2024-003'
            },
            {
                StudentId: students[2].id,
                SchoolId: highlands.id,
                description: 'Computer Lab Mouse replacement',
                category: 'Equipment',
                cost: 6000.00,
                priority: 'Medium',
                teacherId: t2Profile.id,
                status: 'Principal_Approved', // For ZEO Review
                approvedByPrincipalId: (await Principal.findOne({ where: { userId: principal2.id } })).id
            }
        ]);
        console.log('Welfare Requests Seeded!');

        // 7. Create Donations
        const donorId1 = (await Donor.findOne({ where: { userId: donor1.id } })).id;
        const donorId2 = (await Donor.findOne({ where: { userId: donor2.id } })).id;
        const donorId3 = (await Donor.findOne({ where: { userId: donor3.id } })).id;

        await Donation.bulkCreate([
            {
                amount: 2500.00,
                description: 'Donation for Nimal',
                donorId: donorId1,
                welfareRequestId: requests[0].id,
                status: 'Completed',
                paymentMethod: 'Online',
                receiptUrl: '/uploads/receipt1.jpg'
            },
            {
                amount: 10000.00,
                description: 'General School Fund - Highlands',
                donorId: donorId2,
                welfareRequestId: null,
                status: 'Completed',
                allocatedSchoolId: highlands.id,
                paymentMethod: 'Bank Transfer'
            },
            {
                amount: 5000.00,
                description: 'Stationery Donation Pending',
                donorId: donorId3,
                welfareRequestId: null,
                status: 'Pending_ZEO_Verification', // Was Pending
                paymentMethod: 'Bank Transfer'
            },
            {
                amount: 7500.00,
                description: 'Anonymous Donation',
                donorId: null,
                welfareRequestId: null,
                status: 'Pending_ZEO_Verification', // Was Pending
                isAnonymous: true,
                paymentMethod: 'Online'
            },
            {
                amount: 1500.00,
                description: 'Specific Request Funding',
                donorId: donorId1,
                welfareRequestId: requests[2].id,
                status: 'Completed',
                paymentMethod: 'Online'
            }
        ]);
        console.log('Donations Seeded!');

        // 8. Monthly Reports
        await MonthlyReport.bulkCreate([
            {
                month: '2024-01',
                averageAttendance: 85.5,
                staffAttendance: 92.0,
                dropoutCount: 2,
                remarks: 'Good start to the year.',
                principalId: (await Principal.findOne({ where: { userId: principal1.id } })).id,
                schoolId: hattonCentral.id
            },
            {
                month: '2024-02',
                averageAttendance: 88.0,
                staffAttendance: 95.0,
                dropoutCount: 0,
                remarks: 'Attendance improved.',
                principalId: (await Principal.findOne({ where: { userId: principal1.id } })).id,
                schoolId: hattonCentral.id
            },
            {
                month: '2024-01',
                averageAttendance: 90.0,
                staffAttendance: 98.0,
                dropoutCount: 1,
                remarks: 'Excellent performance.',
                principalId: (await Principal.findOne({ where: { userId: principal2.id } })).id,
                schoolId: highlands.id
            },
            {
                month: '2024-02',
                averageAttendance: 89.5,
                staffAttendance: 96.0,
                dropoutCount: 0,
                remarks: 'Steady progress.',
                principalId: (await Principal.findOne({ where: { userId: principal2.id } })).id,
                schoolId: highlands.id
            },
            {
                month: '2023-12',
                averageAttendance: 82.0,
                staffAttendance: 90.0,
                dropoutCount: 3,
                remarks: 'End of year wrap up.',
                principalId: (await Principal.findOne({ where: { userId: principal1.id } })).id,
                schoolId: hattonCentral.id
            }
        ]);
        console.log('Reports Seeded!');

        // 9. Circulars
        await Circular.bulkCreate([
            {
                title: 'Annual Sports Meet 2024',
                content: 'The Annual Zonal Sports Meet will be held on...',
                targetAudience: 'all',
                status: 'Published',
                authorId: zeoUser.id
            },
            {
                title: 'Grade 5 Scholarship Exam',
                content: 'Instructions for invigilators...',
                targetAudience: 'teachers',
                status: 'Published',
                authorId: zeoUser.id
            },
            {
                title: 'Principal Meeting - March',
                content: 'Mandatory meeting for all principals...',
                targetAudience: 'principals',
                status: 'Published',
                authorId: zeoUser.id
            },
            {
                title: 'Term 1 Holidays',
                content: 'School will be closed from...',
                targetAudience: 'all',
                status: 'Draft',
                authorId: zeoUser.id
            },
            {
                title: 'Dengue Prevention Program',
                content: 'All schools must conduct cleaning programs...',
                targetAudience: 'all',
                status: 'Published',
                authorId: zeoUser.id
            }
        ]);

        // 10. Resources
        await Resource.bulkCreate([
            {
                title: 'Grade 10 Math Past Papers',
                description: '2023 1st Term Papers with answers',
                grade: '10',
                subject: 'Mathematics',
                fileUrl: '/uploads/math_g10_2023.pdf',
                teacherId: t1Profile.id,
                schoolId: hattonCentral.id,
                status: 'Approved'
            },
            {
                title: 'Grade 8 Science Notes',
                description: 'Unit 1-5 Short Notes',
                grade: '8',
                subject: 'Science',
                fileUrl: '/uploads/sci_g8_notes.pdf',
                teacherId: t1Profile.id,
                schoolId: hattonCentral.id,
                status: 'Pending'
            },
            {
                title: 'English Grammar Guide',
                description: 'Tenses and Active/Passive Voice',
                grade: '11',
                subject: 'English',
                fileUrl: '/uploads/eng_grammar.pdf',
                teacherId: t2Profile.id,
                schoolId: highlands.id,
                status: 'Approved'
            },
            {
                title: 'O/L History Map Marking',
                description: 'Essential locations for O/L exam',
                grade: '11',
                subject: 'History',
                fileUrl: '/uploads/hist_map.pdf',
                teacherId: t2Profile.id,
                schoolId: highlands.id,
                status: 'Approved'
            },
            {
                title: 'Grade 6 Math Workbook',
                description: 'Exercises for Term 1',
                grade: '6',
                subject: 'Mathematics',
                fileUrl: '/uploads/math_g6_wb.pdf',
                teacherId: t1Profile.id,
                schoolId: hattonCentral.id,
                status: 'Rejected'
            }
        ]);

        console.log('Circulars & Resources Seeded!');

        process.exit();

    } catch (error) {
        const fs = require('fs');
        fs.writeFileSync('seed_error_output.txt', error.stack || error.toString());
        console.error('Seed Error:', error);
        process.exit(1);
    }
};

seedData();
