const {
    sequelize, User, School, Teacher, Principal, Donor, Student, Subject,
    WelfareRequest, Donation, Transfer, Notification, MonthlyReport,
    Circular, Resource, PasswordReset, WelfareRequestDocument, WelfareApproval,
    CircularRecipient, CircularAttachment, TeacherSubject
} = require('../models');

const bcrypt = require('bcryptjs');

const seedValues = async () => {
    try {
        // Disable foreign key checks to force sync
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        await sequelize.sync({ force: true });
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log("Database synced (Force Reset).");

        // Use a consistent hash for 'password'
        const passwordHash = bcrypt.hashSync('password', 10);

        // 0. SUBJECTS
        const subjectsData = [
            'Mathematics', 'Science', 'English', 'History', 'Geography',
            'Civics Education', 'Art', 'Music', 'Tamil', 'Sinhala', 'Information & Communication Technology'
        ];
        await Subject.bulkCreate(subjectsData.map(name => ({ name })));
        console.log("Subjects created.");

        // 1. USERS
        const u1 = await User.create({ fullName: 'ZEO Admin', email: 'zeo@edu.lk', passwordHash, role: 'ZEO', isVerified: true });
        const u2 = await User.create({ fullName: 'Principal Highlands', email: 'highlands@edu.lk', passwordHash, role: 'PRINCIPAL', isVerified: true });
        const u3 = await User.create({ fullName: 'Principal Gabriel', email: 'gabriel@edu.lk', passwordHash, role: 'PRINCIPAL', isVerified: true });
        const u4 = await User.create({ fullName: 'Teacher Highlands', email: 'teacher1@edu.lk', passwordHash, role: 'TEACHER', isVerified: true });
        const u5 = await User.create({ fullName: 'Teacher Gabriel', email: 'teacher2@edu.lk', passwordHash, role: 'TEACHER', isVerified: true });
        const u6 = await User.create({ fullName: 'Donor John', email: 'donor@edu.lk', passwordHash, role: 'DONOR', isVerified: true });
        console.log("Users created.");

        // 2. SCHOOLS
        const schoolsData = [
            { name: 'Highlands College', address: 'Hatton', division: 'Hatton Zone', bankName: 'BOC', bankBranch: 'Hatton', accountNumber: '100001', accountHolder: 'Highlands College' },
            { name: 'St. Gabriel’s College', address: 'Hatton', division: 'Hatton Zone', bankName: 'BOC', bankBranch: 'Hatton', accountNumber: '100002', accountHolder: 'St. Gabriel’s College' },
            { name: 'St. Paul’s Girls’ School', address: 'Hatton', division: 'Hatton Zone', bankName: 'People’s Bank', bankBranch: 'Hatton', accountNumber: '100003', accountHolder: 'St. Paul’s Girls’ School' },
            { name: 'Hatton National College', address: 'Hatton', division: 'Hatton Zone', bankName: 'BOC', bankBranch: 'Hatton', accountNumber: '100004', accountHolder: 'Hatton National College' },
            { name: 'Hatton Hindu National College', address: 'Hatton', division: 'Hatton Zone', bankName: 'People’s Bank', bankBranch: 'Hatton', accountNumber: '100005', accountHolder: 'Hatton Hindu NC' },
            { name: 'Norwood Central College', address: 'Norwood', division: 'Hatton Zone', bankName: 'BOC', bankBranch: 'Norwood', accountNumber: '100006', accountHolder: 'Norwood Central College' },
            { name: 'St. Anthony’s College', address: 'Norwood', division: 'Hatton Zone', bankName: 'BOC', bankBranch: 'Norwood', accountNumber: '100007', accountHolder: 'St. Anthony’s College' },
            { name: 'St. Mary’s College', address: 'Hatton', division: 'Hatton Zone', bankName: 'People’s Bank', bankBranch: 'Hatton', accountNumber: '100008', accountHolder: 'St. Mary’s College' },
            { name: 'Nallathanniya Tamil Maha Vidyalayam', address: 'Nallathanniya', division: 'Hatton Zone', bankName: 'BOC', bankBranch: 'Nallathanniya', accountNumber: '100009', accountHolder: 'Nallathanniya TMV' },
            { name: 'Talawakele Tamil Maha Vidyalayam', address: 'Talawakele', division: 'Hatton Zone', bankName: 'People’s Bank', bankBranch: 'Talawakele', accountNumber: '100010', accountHolder: 'Talawakele TMV' }
        ];
        const schools = await School.bulkCreate(schoolsData);
        console.log("Schools created.");

        // 3. PRINCIPALS + TEACHERS
        const p1 = await Principal.create({ userId: u2.id, schoolId: schools[0].id, contactNumber: '+94710000001' });
        const p2 = await Principal.create({ userId: u3.id, schoolId: schools[1].id, contactNumber: '+94710000002' });

        const t1 = await Teacher.create({ userId: u4.id, schoolId: schools[0].id, contactNumber: '+94720000001' });
        const t2 = await Teacher.create({ userId: u5.id, schoolId: schools[1].id, contactNumber: '+94720000002' });
        console.log("Profiles created.");

        // 4. STUDENTS
        const st1 = await Student.create({ schoolId: schools[0].id, fullName: 'Student A', grade: 'Grade 10', section: 'A' });
        const st2 = await Student.create({ schoolId: schools[0].id, fullName: 'Student B', grade: 'Grade 5', section: 'B' });
        const st3 = await Student.create({ schoolId: schools[1].id, fullName: 'Student C', grade: 'Grade 9', section: 'A' });
        console.log("Students created.");

        // 5. WELFARE REQUESTS
        const wr1 = await WelfareRequest.create({
            referenceCode: 'ZEO-REQ-2026-001',
            studentId: st1.id,
            teacherId: t1.id,
            schoolId: schools[0].id,
            category: 'Supplies',
            description: 'School bag & books',
            amountRequired: 6000,
            status: 'PUBLISHED',
            priority: 'HIGH'
        });

        const wr2 = await WelfareRequest.create({
            referenceCode: 'ZEO-REQ-2026-002',
            studentId: st2.id,
            teacherId: t1.id,
            schoolId: schools[0].id,
            category: 'Transport',
            description: 'Bicycle for school',
            amountRequired: 25000,
            status: 'TRANSFERRED',
            priority: 'HIGH'
        });
        console.log("Welfare requests created.");

        // 6. APPROVAL HISTORY
        await WelfareApproval.bulkCreate([
            { welfareRequestId: wr1.id, approvedBy: u2.id, role: 'PRINCIPAL', decision: 'APPROVED', remarks: 'Verified' },
            { welfareRequestId: wr1.id, approvedBy: u1.id, role: 'ZEO', decision: 'APPROVED', remarks: 'Published' },
            { welfareRequestId: wr2.id, approvedBy: u2.id, role: 'PRINCIPAL', decision: 'APPROVED', remarks: 'Verified' },
            { welfareRequestId: wr2.id, approvedBy: u1.id, role: 'ZEO', decision: 'APPROVED', remarks: 'Funds transferred' }
        ]);
        console.log("Approvals created.");

        // 7. DONOR + DONATION
        const d1 = await Donor.create({ userId: u6.id, organizationName: 'John Foundation', contactNumber: '+94770000000' });
        const don1 = await Donation.create({
            donorId: d1.id,
            welfareRequestId: wr2.id,
            amount: 25000,
            paymentMethod: 'BANK_TRANSFER',
            status: 'VERIFIED',
            receiptReference: 'REC-001'
        });
        console.log("Donations created.");

        // 8. TRANSFER
        await Transfer.create({
            welfareRequestId: wr2.id,
            donationId: don1.id,
            schoolId: schools[0].id,
            amount: 25000,
            transferReference: 'TRF-BOC-001',
            proofUrl: '/proofs/transfer.pdf',
            transferredBy: u1.id,
            transferredAt: new Date()
        });
        console.log("Transfers created.");

        // 9. MONTHLY REPORTS
        await MonthlyReport.bulkCreate([
            { schoolId: schools[0].id, reportMonth: '2026-01-01', avgAttendance: 95.5, staffAttendance: 98, dropoutCount: 0, remarks: 'Excellent' },
            { schoolId: schools[1].id, reportMonth: '2026-01-01', avgAttendance: 94.2, staffAttendance: 97, dropoutCount: 1, remarks: 'Good' }
        ]);
        console.log("Monthly reports created.");

        // 10. CIRCULAR
        const circ = await Circular.create({
            title: 'Term 1 Guidelines',
            message: 'Please follow attached exam guidelines.',
            status: 'PUBLISHED',
            publishedBy: u1.id,
            publishedAt: new Date()
        });
        await CircularRecipient.bulkCreate([
            { circularId: circ.id, role: 'PRINCIPAL' },
            { circularId: circ.id, role: 'TEACHER' }
        ]);
        console.log("Circulars created.");

        console.log("Seed Completed Successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Seed Error:", error);
        process.exit(1);
    }
};

seedValues();
