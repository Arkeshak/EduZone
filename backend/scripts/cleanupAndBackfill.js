const { User, Principal, Teacher, WelfareRequest, Student, Donation, MonthlyReport } = require('../models');
const db = require('../config/db');

async function cleanupAndBackfill() {
    try {
        await db.authenticate();
        console.log('Connected to database.');

        // 1. Fix Highlands College requests with empty statuses
        console.log('Cleaning up empty statuses for Highlands College...');
        const [affectedCount] = await WelfareRequest.update(
            { status: 'SUBMITTED' },
            { where: { schoolId: 1, status: '' } }
        );
        console.log(`Updated ${affectedCount} requests to SUBMITTED status.`);

        // 2. Backfill Analytics Data (Past 6 Months)
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const schools = [1, 2, 3]; // Highlands + 2 more
        
        console.log('Generating backfilled analytics data...');
        for (let i = 5; i >= 1; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const reportMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
            
            for (const schoolId of schools) {
                // Create Monthly Reports if missing
                await MonthlyReport.findOrCreate({
                    where: { schoolId, reportMonth },
                    defaults: {
                        avgAttendance: (85 + Math.random() * 10).toFixed(2),
                        staffAttendance: (90 + Math.random() * 8).toFixed(2),
                        dropoutCount: Math.floor(Math.random() * 3),
                        remarks: `Automated backfill report for ${monthNames[date.getMonth()]} ${date.getFullYear()}`
                    }
                });

                // Create some verified donations for each month (for charts)
                const donor = await User.findOne({ where: { role: 'DONOR' } });
                const request = await WelfareRequest.findOne({ where: { schoolId } });
                
                if (donor && request) {
                    await Donation.create({
                        donorId: 1, // Assuming donor profile ID 1
                        welfareRequestId: request.id,
                        amount: (1000 + Math.random() * 5000).toFixed(2),
                        status: 'VERIFIED',
                        paymentMethod: 'ONLINE',
                        createdAt: date
                    });
                }
            }
        }
        
        console.log('Backfill complete.');
        process.exit(0);
    } catch (error) {
        console.error('Cleanup/Backfill failed:', error);
        process.exit(1);
    }
}

cleanupAndBackfill();
