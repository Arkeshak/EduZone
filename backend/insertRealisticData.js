const { School, WelfareRequest, Student } = require('./models');

async function executeSeeding() {
    try {
        console.log("Starting realistic data seeding...");

        // 1. Update School Name to Hatton Central College
        const school1 = await School.findByPk(1);
        if (school1) {
            school1.name = 'Hatton Central College';
            await school1.save();
            console.log("✅ Successfully updated School #1 to 'Hatton Central College'");
        }

        // 2. Update Welfare Requests to have realistic descriptions and 3000 LKR amount
        const requests = await WelfareRequest.findAll({ limit: 3 });
        let count = 0;
        for (const req of requests) {
            req.description = "Grade 10 Textbook Funding";
            req.category = "Books";
            req.amountRequired = 3000.00;
            req.status = "PUBLISHED"; 
            await req.save();

            // Also check if the student name is realistic
            const student = await Student.findOne({ where: { id: req.studentId } });
            if (student && student.fullName && student.fullName.includes("Student")) {
                 student.fullName = "Kavindu Perera";
                 await student.save();
            }
            count++;
        }
        
        console.log(`✅ Successfully updated ${count} Welfare Requests to 3000 LKR for 'Grade 10 Textbook Funding' and assigned realistic student names.`);
    } catch (e) {
        console.error("❌ Seeding failed:", e);
    } finally {
        process.exit();
    }
}

executeSeeding();
