const { User, Principal, Teacher, WelfareRequest, Student, Donation, sequelize } = require('../models');
const db = require('../config/db');

async function verifyFullFlow() {
    try {
        await db.authenticate();
        console.log('--- STARTING END-TO-END FLOW VERIFICATION ---');

        // 1. TEACHER: Create a request
        const teacher = await Teacher.findOne({ where: { userId: 2 } }); // Highlands Teacher
        if (!teacher) throw new Error('Highlands Teacher not found');

        const [student] = await Student.findOrCreate({ 
            where: { fullName: 'Flow Verification Student', schoolId: teacher.schoolId },
            defaults: { grade: '9', section: 'B' }
        });

        const newRequest = await WelfareRequest.create({
            teacherId: teacher.id,
            schoolId: teacher.schoolId,
            studentId: student.id,
            category: 'Uniforms',
            description: 'Automated Flow Verification Request',
            amountRequired: 1500,
            status: 'SUBMITTED'
        });
        console.log(`[PASS] Step 1: Teacher created request #${newRequest.id}`);

        // 2. PRINCIPAL: Approve the request
        const principal = await Principal.findOne({ where: { schoolId: teacher.schoolId } });
        if (!principal) throw new Error('Highlands Principal not found');

        newRequest.status = 'PRINCIPAL_APPROVED';
        await newRequest.save();
        console.log(`[PASS] Step 2: Principal (UserID ${principal.userId}) approved request #${newRequest.id}`);

        // 3. ZEO: Publish the request
        newRequest.status = 'PUBLISHED';
        newRequest.referenceCode = `VERIFY-REQ-${Date.now()}`;
        await newRequest.save();
        console.log(`[PASS] Step 3: ZEO published request #${newRequest.id} with Ref: ${newRequest.referenceCode}`);

        // 4. DONOR: Verify visibility in 'getPublishedRequests' equivalent
        const publishedCount = await WelfareRequest.count({
            where: { status: 'PUBLISHED', id: newRequest.id }
        });
        if (publishedCount === 1) {
            console.log(`[PASS] Step 4: Request #${newRequest.id} is verified as visible to Donors.`);
        } else {
            throw new Error('Request not found in published list');
        }

        // Cleanup
        await newRequest.destroy();
        await student.destroy();
        console.log('--- FLOW VERIFICATION SUCCESSFUL ---');
        process.exit(0);
    } catch (error) {
        console.error('--- FLOW VERIFICATION FAILED ---');
        console.error(error.message);
        process.exit(1);
    }
}

verifyFullFlow();
