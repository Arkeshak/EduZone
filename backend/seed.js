const sequelize = require('./config/db');
const User = require('./models/User');
const WelfareRequest = require('./models/WelfareRequest');
const Donation = require('./models/Donation');
const School = require('./models/School');
const MonthlyReport = require('./models/MonthlyReport');
const Circular = require('./models/Circular');
const Resource = require('./models/Resource');
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
            {
                name: 'Ginigathena Central College',
                address: 'Ginigathena',
                division: 'Hatton',
                censusNo: 'CEN001'
            },
            {
                name: 'Highlands College',
                address: 'Hatton',
                division: 'Hatton',
                censusNo: 'CEN002'
            },
            {
                name: 'St. Gabriel’s Girls’ College',
                address: 'Hatton',
                division: 'Hatton',
                censusNo: 'CEN003'
            },
            {
                name: 'St. John Bosco’s College',
                address: 'Hatton',
                division: 'Hatton',
                censusNo: 'CEN004'
            },
            {
                name: 'Sri Pada Central College',
                address: 'Hatton',
                division: 'Hatton',
                censusNo: 'CEN005'
            },
            {
                name: 'St. Mary’s Central College',
                address: 'Bogawanthalawa',
                division: 'Hatton',
                censusNo: 'CEN006'
            },
            {
                name: 'Ambagamuwa Central College',
                address: 'Ambagamuwa',
                division: 'Hatton',
                censusNo: 'CEN007'
            },
            {
                name: 'Talawakelle Tamil Maha Vidyalayam',
                address: 'Talawakelle',
                division: 'Hatton',
                censusNo: 'CEN008'
            },
            {
                name: 'Kotagala Tamil Maha Vidyalayam',
                address: 'Kotagala',
                division: 'Hatton',
                censusNo: 'CEN009'
            },
            {
                name: 'Laxapana Central College',
                address: 'Laxapana',
                division: 'Hatton',
                censusNo: 'CEN010'
            },
            {
                name: 'Zonal Education Office',
                address: 'Nuwara Eliya Rd, Hatton',
                division: 'Hatton',
                censusNo: 'ZEO001'
            }
        ]);

        const hattonCentral = schools[0]; // Ginigathena Central as example for principal
        const stJohns = schools[1]; // Highlands College as example
        const zeoOffice = schools[schools.length - 1]; // ZEO is last

        console.log('Schools Seeded!');

        // 2. Create Users
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password', salt);

        const users = await User.bulkCreate([
            {
                name: 'Mr. Bandara (ZEO)',
                email: 'zeo@edu.lk',
                password: hashedPassword,
                role: 'zeo',
                SchoolId: zeoOffice.id,
                isVerified: true
            },
            {
                name: 'Mrs. Silva (Principal)',
                email: 'principal@edu.lk',
                password: hashedPassword,
                role: 'principal',
                SchoolId: hattonCentral.id,
                isVerified: true
            },
            {
                name: 'Mr. Perera (Principal)',
                email: 'principal2@edu.lk',
                password: hashedPassword,
                role: 'principal',
                SchoolId: stJohns.id,
                isVerified: true
            },
            {
                name: 'Sarath Perera (Teacher)',
                email: 'teacher@edu.lk',
                password: hashedPassword,
                role: 'teacher',
                SchoolId: hattonCentral.id,
                subjects: ['Math', 'Science'], // JSON
                isVerified: true
            },
            {
                name: 'Rani Devi (Teacher)',
                email: 'teacher2@edu.lk',
                password: hashedPassword,
                role: 'teacher',
                SchoolId: stJohns.id,
                subjects: ['English', 'History'], // JSON
                isVerified: true
            },
            {
                name: 'Alice Foundations (Donor)',
                email: 'donor@example.com',
                password: hashedPassword,
                role: 'donor',
                isVerified: true
            },
            {
                name: 'Global Education Trust (Donor)',
                email: 'global@edu.org',
                password: hashedPassword,
                role: 'donor',
                isVerified: true
            },
            {
                name: 'Community Helpers (Donor)',
                email: 'community@help.org',
                password: hashedPassword,
                role: 'donor',
                isVerified: true
            },
            {
                name: 'Mr. Perera (Teacher)',
                email: 'teacher3@edu.lk',
                password: hashedPassword,
                role: 'teacher',
                SchoolId: hattonCentral.id,
                subjects: ['Science'],
                isVerified: false // Pending verification example
            }
        ]);

        console.log('Users Seeded!');

        // 3. Create Welfare Requests
        const teacher1 = users[3]; // Sarath
        const teacher2 = users[4]; // Rani

        const requests = await WelfareRequest.bulkCreate([
            {
                studentName: 'Nimal Sirisena',
                grade: '10-A',
                SchoolId: hattonCentral.id,
                description: 'Needs shoes for school season',
                category: 'Uniforms',
                cost: 2500.00,
                priority: 'High',
                teacherId: teacher1.id,
                status: 'Approved by ZEO'
            },
            {
                studentName: 'Kamala Perera',
                grade: '8-B',
                SchoolId: stJohns.id,
                description: 'Unable to pay facility fees',
                category: 'Fees',
                cost: 5000.00,
                priority: 'Medium',
                teacherId: teacher2.id,
                status: 'Approved by Principal'
            }
        ]);

        console.log('Welfare Requests Seeded!');

        // 4. Create Donations
        await Donation.create({
            amount: 2500.00,
            description: 'Donation for Nimal',
            donorId: users[5].id, // Alice
            welfareRequestId: requests[0].id,
            status: 'Completed'
        });

        await Donation.bulkCreate([
            {
                amount: 10000.00,
                description: 'General School Fund',
                donorId: users[6].id, // Global Trust
                welfareRequestId: null, // General donation
                status: 'Completed'
            },
            {
                amount: 5000.00,
                description: 'Library Books Support',
                donorId: users[7].id, // Community Helpers
                welfareRequestId: requests[1].id, // For Kamala
                status: 'Pending'
            }
        ]);

        console.log('Donations Seeded!');

        // 5. Create Monthly Reports (Mock for ZEO Analysis)
        const principal1 = users[1]; // Mrs. Silva
        const principal2 = users[2]; // Mr. Perera

        await MonthlyReport.bulkCreate([
            {
                month: '2024-01',
                averageAttendance: 85.5,
                staffAttendance: 92.0,
                dropoutCount: 2,
                remarks: 'Good start to the year.',
                authorId: principal1.id,
                schoolName: hattonCentral.name
            },
            {
                month: '2024-02',
                averageAttendance: 88.0,
                staffAttendance: 95.0,
                dropoutCount: 0,
                remarks: 'Improvement observed in Grade 10.',
                authorId: principal1.id,
                schoolName: hattonCentral.name
            },
            {
                month: '2024-01',
                averageAttendance: 78.5,
                staffAttendance: 88.0,
                dropoutCount: 5,
                remarks: 'Staff shortage affecting attendance.',
                authorId: principal2.id,
                schoolName: stJohns.name
            }
        ]);

        console.log('Monthly Reports Seeded!');

        // 6. Create Circulars (ZEO -> Principals/Teachers)
        await Circular.bulkCreate([
            {
                title: 'Annual Sports Meet 2024',
                content: 'The Annual Zonal Sports Meet will be held on March 15th at the Public Ground. All schools must register participants by March 1st.',
                targetAudience: 'all',
                status: 'Published',
                authorId: users[0].id // ZEO
            },
            {
                title: 'Grade 5 Scholarship Exam Guidelines',
                content: 'New guidelines for the upcoming scholarship examination have been released. Please disseminate to primary section heads.',
                targetAudience: 'principals',
                status: 'Published',
                authorId: users[0].id
            },
            {
                title: 'Mid-Year Term Test Schedule',
                content: 'Draft schedule for mid-year exams. Feedback requested from Subject Heads.',
                targetAudience: 'teachers',
                status: 'Draft',
                authorId: users[0].id
            }
        ]);
        console.log('Circulars Seeded!');


        // 7. Create Resources (Teachers -> ZEO Approval)
        await Resource.bulkCreate([
            {
                title: 'Grade 10 Mathematics - Geometry Notes',
                description: 'Comprehensive notes on Circle Geometry with practice problems.',
                grade: '10',
                subject: 'Mathematics',
                fileUrl: 'https://example.com/math-geo.pdf',
                teacherId: teacher1.id, // Sarath (Hatton Central)
                schoolId: hattonCentral.id,
                status: 'Approved' // Already visible to others
            },
            {
                title: 'Grade 11 Science - Genetics',
                description: 'PowerPoint presentation for classroom teaching.',
                grade: '11',
                subject: 'Science',
                fileUrl: 'https://example.com/bio-genetics.ppt',
                teacherId: teacher1.id,
                schoolId: hattonCentral.id,
                status: 'Pending' // Needs ZEO approval
            },
            {
                title: 'English Literature - Poetry Analysis',
                description: 'Analysis of key poems for O/L syllabus.',
                grade: '11',
                subject: 'English',
                fileUrl: 'https://example.com/lit-poetry.pdf',
                teacherId: teacher2.id, // Rani (St. Johns)
                schoolId: stJohns.id,
                status: 'Pending'
            }
        ]);
        console.log('Resources Seeded!');

        process.exit();

    } catch (error) {
        console.error('Seed Error:', error);
        process.exit(1);
    }
};

seedData();

