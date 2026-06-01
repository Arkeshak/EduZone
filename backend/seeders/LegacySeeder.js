const { 
    sequelize, User, School, Teacher, Principal, Donor, WelfareRequest, 
    Donation, MonthlyReport, Circular, Resource, Student, Subject,
    CircularRecipient, WelfareApproval
} = require('../models');
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
            { name: 'Ginigathena Central College', address: 'Ginigathena', division: 'Hatton' },
            { name: 'Highlands College', address: 'Hatton', division: 'Hatton' },
            { name: 'St. Gabriel’s Girls’ College', address: 'Hatton', division: 'Hatton' },
            { name: 'St. John Bosco’s College', address: 'Hatton', division: 'Hatton' },
            { name: 'Sri Pada Central College', address: 'Hatton', division: 'Hatton' },
            { name: 'Zonal Education Office', address: 'Nuwara Eliya Rd, Hatton', division: 'Hatton' }
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
            { fullName: 'Mr. Bandara (ZEO)', email: 'zeo@edu.lk', role: 'ZEO', isVerified: true },
            { fullName: 'Mrs. Silva (Principal)', email: 'principal@edu.lk', role: 'PRINCIPAL', isVerified: true }, // Hatton Central
            { fullName: 'Mr. Perera (Principal)', email: 'principal2@edu.lk', role: 'PRINCIPAL', isVerified: true }, // Highlands
            { fullName: 'Sarath Perera (Teacher)', email: 'teacher@edu.lk', role: 'TEACHER', isVerified: true }, // Hatton Central, Math
            { fullName: 'Rani Devi (Teacher)', email: 'teacher2@edu.lk', role: 'TEACHER', isVerified: true }, // Highlands, English
            { fullName: 'Alice Foundations (Donor)', email: 'donor@example.com', role: 'DONOR', isVerified: true },
            { fullName: 'Global Education Trust (Donor)', email: 'global@edu.org', role: 'DONOR', isVerified: true },
            { fullName: 'Community Helpers (Donor)', email: 'community@help.org', role: 'DONOR', isVerified: true }
        ];

        // Create Users individually
        const zeoUser = await User.create({ ...usersData[0], passwordHash: hashedPassword });
        const principal1 = await User.create({ ...usersData[1], passwordHash: hashedPassword });
        const principal2 = await User.create({ ...usersData[2], passwordHash: hashedPassword });
        const teacher1 = await User.create({ ...usersData[3], passwordHash: hashedPassword });
        const teacher2 = await User.create({ ...usersData[4], passwordHash: hashedPassword });
        const donor1 = await User.create({ ...usersData[5], passwordHash: hashedPassword });
        const donor2 = await User.create({ ...usersData[6], passwordHash: hashedPassword });
        const donor3 = await User.create({ ...usersData[7], passwordHash: hashedPassword });

        // 4. Create Profiles & Link Subjects
        await Principal.create({ userId: principal1.id, schoolId: hattonCentral.id, appointmentDate: '2020-01-01' });
        await Principal.create({ userId: principal2.id, schoolId: highlands.id, appointmentDate: '2021-05-15' });

        const t1Profile = await Teacher.create({ userId: teacher1.id, schoolId: hattonCentral.id, appointmentDate: '2019-02-01' });
        await t1Profile.addSubjects([math, science]); // Sequelize magic method

        const t2Profile = await Teacher.create({ userId: teacher2.id, schoolId: highlands.id, appointmentDate: '2018-03-10' });
        await t2Profile.addSubjects([english, literature]);

        await Donor.create({ userId: donor1.id, organizationName: 'Alice Foundations', contactNumber: '0771234567' });
        await Donor.create({ userId: donor2.id, organizationName: 'Global Education Trust', contactNumber: '0777654321' });
        await Donor.create({ userId: donor3.id, organizationName: 'Community Helpers', contactNumber: '0712223334' });

        console.log('Profiles & Subjects Seeded!');

        // 5. Create Students
        const students = await Student.bulkCreate([
            { fullName: 'Nimal Sirisena', grade: '10', section: 'A', schoolId: hattonCentral.id },
            { fullName: 'Saman Kumara', grade: '6', section: 'C', schoolId: hattonCentral.id },
            { fullName: 'Kamala Perera', grade: '8', section: 'B', schoolId: highlands.id },
            { fullName: 'Meena Kumari', grade: '11', section: 'A', schoolId: stGabriels.id },
            { fullName: 'Ravi Shankar', grade: '9', section: 'C', schoolId: stGabriels.id },
            { fullName: 'Fathima Razeena', grade: '7', section: 'B', schoolId: stGabriels.id }
        ]);
        console.log('Students Seeded!');

        // 6. Create Welfare Requests
        const requests = await WelfareRequest.bulkCreate([
            {
                studentId: students[0].id,
                schoolId: hattonCentral.id,
                description: 'Needs shoes for school season',
                category: 'Uniforms',
                amountRequired: 2500.00,
                priority: 'HIGH',
                teacherId: t1Profile.id,
                status: 'PUBLISHED',
                referenceCode: 'ZEO-REQ-2024-001'
            },
            {
                studentId: students[2].id,
                schoolId: highlands.id,
                description: 'Unable to pay facility fees',
                category: 'Fees',
                amountRequired: 5000.00,
                priority: 'MEDIUM',
                teacherId: t2Profile.id,
                status: 'PRINCIPAL_APPROVED'
            },
            {
                studentId: students[1].id,
                schoolId: hattonCentral.id,
                description: 'Notebooks and stationery',
                category: 'Stationery',
                amountRequired: 1500.00,
                priority: 'LOW',
                teacherId: t1Profile.id,
                status: 'SUBMITTED'
            },
            {
                studentId: students[0].id,
                schoolId: hattonCentral.id,
                description: 'Extra classes fees support',
                category: 'Fees',
                amountRequired: 1200.00,
                priority: 'MEDIUM',
                teacherId: t1Profile.id,
                status: 'SUBMITTED'
            },
            {
                studentId: students[2].id,
                schoolId: highlands.id,
                description: 'School bag replacement',
                category: 'Uniforms',
                amountRequired: 1800.00,
                priority: 'MEDIUM',
                teacherId: t2Profile.id,
                status: 'SUBMITTED'
            },
            {
                studentId: students[3].id,
                schoolId: stGabriels.id,
                description: 'Science Lab Coat',
                category: 'Uniforms',
                amountRequired: 800.00,
                priority: 'LOW',
                teacherId: t1Profile.id, // Assigning a teacher for completeness
                status: 'PRINCIPAL_APPROVED'
            },
            {
                studentId: students[4].id,
                schoolId: stGabriels.id,
                description: 'Mathematics Tuition Support',
                category: 'Fees',
                amountRequired: 1500.00,
                priority: 'HIGH',
                teacherId: t1Profile.id,
                status: 'PRINCIPAL_APPROVED'
            },
            {
                studentId: students[5].id,
                schoolId: stGabriels.id,
                description: 'Books for Term 2',
                category: 'Stationery',
                amountRequired: 2200.00,
                priority: 'MEDIUM',
                teacherId: t1Profile.id,
                status: 'PRINCIPAL_APPROVED'
            },
            {
                studentId: students[0].id,
                schoolId: hattonCentral.id,
                description: 'Cricket Bat for Sports',
                category: 'Sports',
                amountRequired: 4500.00,
                priority: 'LOW',
                teacherId: t1Profile.id,
                status: 'PRINCIPAL_APPROVED'
            },
            {
                studentId: students[1].id,
                schoolId: hattonCentral.id,
                description: 'Geometry Box sets for Grade 8',
                category: 'Stationery',
                amountRequired: 3000.00,
                priority: 'MEDIUM',
                teacherId: t1Profile.id,
                status: 'SUBMITTED'
            },
            {
                studentId: students[0].id,
                schoolId: hattonCentral.id,
                description: 'Lunch box support for 5 students',
                category: 'Food',
                amountRequired: 5000.00,
                priority: 'HIGH',
                teacherId: t1Profile.id,
                status: 'SUBMITTED'
            },
            {
                studentId: students[2].id,
                schoolId: highlands.id,
                description: 'Advanced Level Physics Textbooks',
                category: 'Books',
                amountRequired: 4500.00,
                priority: 'HIGH',
                teacherId: t2Profile.id,
                status: 'PUBLISHED',
                referenceCode: 'ZEO-REQ-2024-002'
            },
            {
                studentId: students[0].id,
                schoolId: hattonCentral.id,
                description: 'Musical Instruments Maintenance',
                category: 'Equipment',
                amountRequired: 8000.00,
                priority: 'LOW',
                teacherId: t1Profile.id,
                status: 'PUBLISHED',
                referenceCode: 'ZEO-REQ-2024-003'
            },
            {
                studentId: students[2].id,
                schoolId: highlands.id,
                description: 'Computer Lab Mouse replacement',
                category: 'Equipment',
                amountRequired: 6000.00,
                priority: 'MEDIUM',
                teacherId: t2Profile.id,
                status: 'PRINCIPAL_APPROVED'
            }
        ]);

        // Create Approvals (Audit Trail)
        await WelfareApproval.bulkCreate([
            { welfareRequestId: requests[0].id, approvedBy: principal1.id, role: 'PRINCIPAL', decision: 'APPROVED', remarks: 'Verified' },
            { welfareRequestId: requests[0].id, approvedBy: zeoUser.id, role: 'ZEO', decision: 'APPROVED', remarks: 'Published' },
            { welfareRequestId: requests[1].id, approvedBy: principal2.id, role: 'PRINCIPAL', decision: 'APPROVED', remarks: 'Verified' },
            { welfareRequestId: requests[5].id, approvedBy: principal1.id, role: 'PRINCIPAL', decision: 'APPROVED', remarks: 'Verified' },
            { welfareRequestId: requests[11].id, approvedBy: principal2.id, role: 'PRINCIPAL', decision: 'APPROVED', remarks: 'Verified' },
            { welfareRequestId: requests[11].id, approvedBy: zeoUser.id, role: 'ZEO', decision: 'APPROVED', remarks: 'Published' }
        ]);
        console.log('Welfare Requests Seeded!');

        // 7. Create Donations
        const donorId1 = (await Donor.findOne({ where: { userId: donor1.id } })).id;
        const donorId2 = (await Donor.findOne({ where: { userId: donor2.id } })).id;
        const donorId3 = (await Donor.findOne({ where: { userId: donor3.id } })).id;

        await Donation.bulkCreate([
            {
                amount: 2500.00,
                donorId: donorId1,
                welfareRequestId: requests[0].id,
                status: 'VERIFIED',
                paymentMethod: 'ONLINE',
                receiptReference: 'REC-001'
            },
            {
                amount: 10000.00,
                donorId: donorId2,
                welfareRequestId: null,
                status: 'VERIFIED',
                schoolId: highlands.id,
                paymentMethod: 'BANK_TRANSFER',
                receiptReference: 'REC-002'
            },
            {
                amount: 5000.00,
                donorId: donorId3,
                welfareRequestId: null,
                status: 'PENDING',
                schoolId: hattonCentral.id,
                paymentMethod: 'BANK_TRANSFER',
                receiptReference: 'REC-003'
            },
            {
                amount: 7500.00,
                donorId: donorId1, // Anonymous but need a donor ID for FK
                welfareRequestId: null,
                status: 'PENDING',
                isAnonymous: true,
                paymentMethod: 'ONLINE',
                receiptReference: 'REC-004'
            },
            {
                amount: 1500.00,
                donorId: donorId1,
                welfareRequestId: requests[2].id,
                status: 'VERIFIED',
                paymentMethod: 'ONLINE',
                receiptReference: 'REC-005'
            }
        ]);
        console.log('Donations Seeded!');

        // 8. Monthly Reports
        await MonthlyReport.bulkCreate([
            {
                reportMonth: '2024-01-01',
                avgAttendance: 85.5,
                staffAttendance: 92.0,
                dropoutCount: 2,
                remarks: 'Good start to the year.',
                schoolId: hattonCentral.id
            },
            {
                reportMonth: '2024-02-01',
                avgAttendance: 88.0,
                staffAttendance: 95.0,
                dropoutCount: 0,
                remarks: 'Attendance improved.',
                schoolId: hattonCentral.id
            },
            {
                reportMonth: '2024-01-01',
                avgAttendance: 90.0,
                staffAttendance: 98.0,
                dropoutCount: 1,
                remarks: 'Excellent performance.',
                schoolId: highlands.id
            },
            {
                reportMonth: '2024-02-01',
                avgAttendance: 89.5,
                staffAttendance: 96.0,
                dropoutCount: 0,
                remarks: 'Steady progress.',
                schoolId: highlands.id
            },
            {
                reportMonth: '2023-12-01',
                avgAttendance: 82.0,
                staffAttendance: 90.0,
                dropoutCount: 3,
                remarks: 'End of year wrap up.',
                schoolId: hattonCentral.id
            }
        ]);
        console.log('Reports Seeded!');

        // 9. Circulars
        const circulars = await Circular.bulkCreate([
            {
                title: 'Annual Sports Meet 2024',
                message: 'The Annual Zonal Sports Meet will be held on...',
                status: 'PUBLISHED',
                publishedBy: zeoUser.id,
                publishedAt: new Date()
            },
            {
                title: 'Grade 5 Scholarship Exam',
                message: 'Instructions for invigilators...',
                status: 'PUBLISHED',
                publishedBy: zeoUser.id,
                publishedAt: new Date()
            },
            {
                title: 'Principal Meeting - March',
                message: 'Mandatory meeting for all principals...',
                status: 'PUBLISHED',
                publishedBy: zeoUser.id,
                publishedAt: new Date()
            },
            {
                title: 'Term 1 Holidays',
                message: 'School will be closed from...',
                status: 'DRAFT',
                publishedBy: zeoUser.id
            },
            {
                title: 'Dengue Prevention Program',
                message: 'All schools must conduct cleaning programs...',
                status: 'PUBLISHED',
                publishedBy: zeoUser.id,
                publishedAt: new Date()
            }
        ]);

        await CircularRecipient.bulkCreate([
            { circularId: circulars[0].id, role: 'PRINCIPAL' },
            { circularId: circulars[0].id, role: 'TEACHER' },
            { circularId: circulars[1].id, role: 'TEACHER' },
            { circularId: circulars[2].id, role: 'PRINCIPAL' },
            { circularId: circulars[4].id, role: 'PRINCIPAL' },
            { circularId: circulars[4].id, role: 'TEACHER' }
        ]);

        // 10. Resources
        await Resource.bulkCreate([
            {
                title: 'Grade 10 Math Past Papers',
                description: '2023 1st Term Papers with answers',
                grade: '10',
                subjectId: math.id,
                fileUrl: '/uploads/math_g10_2023.pdf',
                teacherId: t1Profile.id,
                schoolId: hattonCentral.id,
                status: 'PUBLISHED'
            },
            {
                title: 'Grade 8 Science Notes',
                description: 'Unit 1-5 Short Notes',
                grade: '8',
                subjectId: science.id,
                fileUrl: '/uploads/sci_g8_notes.pdf',
                teacherId: t1Profile.id,
                schoolId: hattonCentral.id,
                status: 'PUBLISHED'
            },
            {
                title: 'English Grammar Guide',
                description: 'Tenses and Active/Passive Voice',
                grade: '11',
                subjectId: english.id,
                fileUrl: '/uploads/eng_grammar.pdf',
                teacherId: t2Profile.id,
                schoolId: highlands.id,
                status: 'PUBLISHED'
            },
            {
                title: 'O/L History Map Marking',
                description: 'Essential locations for O/L exam',
                grade: '11',
                subjectId: history.id,
                fileUrl: '/uploads/hist_map.pdf',
                teacherId: t2Profile.id,
                schoolId: highlands.id,
                status: 'PUBLISHED'
            },
            {
                title: 'Grade 6 Math Workbook',
                description: 'Exercises for Term 1',
                grade: '6',
                subjectId: math.id,
                fileUrl: '/uploads/math_g6_wb.pdf',
                teacherId: t1Profile.id,
                schoolId: hattonCentral.id,
                status: 'REMOVED'
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
