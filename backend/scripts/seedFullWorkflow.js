const { User, Principal, Teacher, WelfareRequest, Student, Donation, MonthlyReport, School, Donor, WelfareType, sequelize } = require('../models');
const db = require('../config/db');

async function seedFullWorkflow() {
    const transaction = await sequelize.transaction();
    try {
        await db.authenticate();
        console.log('--- STARTING COMPREHENSIVE SEEDING ---');

        // 1. Get Core Profiles
        const schools = await School.findAll({ limit: 4, transaction });
        const donor = await Donor.findOne({ transaction });
        
        if (schools.length < 2 || !donor) {
            throw new Error('Required base data (schools or donor profile) missing. Please ensure database is initialized.');
        }

        // 1.5 Seed Welfare Types
        console.log('Seeding welfare types...');
        const welfareTypeNames = ['Books', 'Uniforms', 'Fees', 'Equipment', 'Medical', 'Transport', 'Meals', 'Other'];
        for (const name of welfareTypeNames) {
            await WelfareType.findOrCreate({ 
                where: { name }, 
                defaults: { isActive: true },
                transaction 
            });
        }

        // 2. Helper to get/create students
        const getStudent = async (name, schoolId) => {
            const [student] = await Student.findOrCreate({
                where: { fullName: name, schoolId },
                defaults: { grade: '9', section: 'A' },
                transaction
            });
            return student;
        };

        // 3. SEEDING LOGIC PER STAGE
        const stages = [
            { status: 'SUBMITTED', category: 'Books', amount: 3500, desc: 'Set of Grade 9 textbooks and workbooks.' },
            { status: 'PRINCIPAL_APPROVED', category: 'Uniforms', amount: 5000, desc: 'School uniforms and shoes for two siblings.' },
            { status: 'ZEO_APPROVED', category: 'Fees', amount: 12000, desc: 'Annual exam fees and extra-curricular project costs.' },
            { status: 'PUBLISHED', category: 'Equipment', amount: 8500, desc: 'Cricket gear for aspiring student athlete.' },
            { status: 'PARTIALLY_FUNDED', category: 'Medical', amount: 25000, desc: 'Contribution for urgent dental surgery.' },
            { status: 'FULLY_FUNDED', category: 'Transport', amount: 6000, desc: 'Monthly bus pass for remote village student.' },
            { status: 'TRANSFERRED', category: 'Other', amount: 4500, desc: 'Special education tools and stationery.' }
        ];

        for (const school of schools) {
            console.log(`Processing school: ${school.name}...`);
            const teacher = await Teacher.findOne({ where: { schoolId: school.id }, transaction });
            if (!teacher) continue;

            for (const [index, stage] of stages.entries()) {
                const student = await getStudent(`Student ${index + 1} ${school.name}`, school.id);
                
                // Create Request
                const request = await WelfareRequest.create({
                    teacherId: teacher.id,
                    schoolId: school.id,
                    studentId: student.id,
                    category: stage.category,
                    description: stage.desc,
                    amountRequired: stage.amount,
                    status: stage.status,
                    referenceCode: stage.status === 'SUBMITTED' ? null : `REF-${school.id}-${index}-${Date.now()}`,
                    createdAt: new Date(Date.now() - (index * 2 * 24 * 60 * 60 * 1000)) // Spread over last 2 weeks
                }, { transaction });

                // Add Donations if needed
                if (stage.status === 'PARTIALLY_FUNDED') {
                    await Donation.create({
                        donorId: donor.id,
                        welfareRequestId: request.id,
                        amount: stage.amount / 2,
                        status: 'VERIFIED',
                        paymentMethod: 'ONLINE',
                        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    }, { transaction });
                } else if (stage.status === 'FULLY_FUNDED' || stage.status === 'TRANSFERRED') {
                    await Donation.create({
                        donorId: donor.id,
                        welfareRequestId: request.id,
                        amount: stage.amount,
                        status: 'VERIFIED',
                        paymentMethod: 'BANK_TRANSFER',
                        createdAt: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000))
                    }, { transaction });
                }
            }

            // 4. Seed Monthly Reports for ZEO Analytics
            console.log(`Seeding reports for ${school.name}...`);
            for (let i = 0; i < 6; i++) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const reportMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;

                await MonthlyReport.findOrCreate({
                    where: { schoolId: school.id, reportMonth },
                    defaults: {
                        avgAttendance: (80 + Math.random() * 15).toFixed(2),
                        staffAttendance: (90 + Math.random() * 8).toFixed(2),
                        dropoutCount: Math.floor(Math.random() * 4),
                        remarks: `Generated report for ${reportMonth}`
                    },
                    transaction
                });
            }
        }

        await transaction.commit();
        console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
        process.exit(0);
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('--- SEEDING FAILED ---');
        console.error(error);
        process.exit(1);
    }
}

seedFullWorkflow();
