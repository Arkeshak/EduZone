const { Teacher, User, School, Resource, Subject, db } = require('../models');

const fixAndSeed = async () => {
    try {
        console.log('--- STARTING TEACHER & RESOURCE FIX ---');

        // 1. Ensure Teacher Profile exists for highlands_teacher@gmail.com
        const user = await User.findOne({ where: { email: 'highlands_teacher@gmail.com' } });
        if (!user) {
            console.error('User highlands_teacher@gmail.com not found. Please create user first.');
            return;
        }

        const school = await School.findOne({ where: { name: 'Highlands College' } });
        if (!school) {
            console.error('School Highlands College not found.');
            return;
        }

        let teacher = await Teacher.findOne({ where: { userId: user.id } });
        if (!teacher) {
            console.log('Creating missing Teacher profile for userId:', user.id);
            teacher = await Teacher.create({
                userId: user.id,
                schoolId: school.id,
                specialization: 'General Studies'
            });
            console.log('Teacher profile created with ID:', teacher.id);
        } else {
            console.log('Teacher profile already exists with ID:', teacher.id);
        }

        // 2. Ensure Subjects exist
        const subjectNames = ['Mathematics', 'Science', 'ICT', 'History', 'English'];
        const subjects = {};
        for (const name of subjectNames) {
            const [subj] = await Subject.findOrCreate({ where: { name } });
            subjects[name] = subj.id;
        }
        console.log('Subjects verified.');

        // 3. Seed Mock Resources
        const mockResources = [
            {
                title: 'Grade 11 Mathematics - Geometry Guide',
                description: 'Comprehensive guide covering circle theorems and triangles.',
                grade: '11',
                subjectId: subjects['Mathematics'],
                fileUrl: '/uploads/math_geo_guide.pdf'
            },
            {
                title: 'Introduction to Web Development (ICT)',
                description: 'HTML/CSS basics for O/L students.',
                grade: '10',
                subjectId: subjects['ICT'],
                fileUrl: '/uploads/ict_web_intro.pdf'
            },
            {
                title: 'Plant Physiology Notes - Grade 12',
                description: 'Detailed notes on photosynthesis and respiration.',
                grade: '12',
                subjectId: subjects['Science'],
                fileUrl: '/uploads/science_plants.pdf'
            },
            {
                title: 'Modern World History - Summary',
                description: 'Key events of the 20th century summarized.',
                grade: '11',
                subjectId: subjects['History'],
                fileUrl: '/uploads/history_world.pdf'
            }
        ];

        for (const resData of mockResources) {
            const [resource, created] = await Resource.findOrCreate({
                where: { title: resData.title },
                defaults: {
                    ...resData,
                    teacherId: teacher.id,
                    schoolId: school.id,
                    status: 'PUBLISHED'
                }
            });
            if (created) {
                console.log('Created resource:', resData.title);
            } else {
                console.log('Resource already exists:', resData.title);
            }
        }

        console.log('--- FIX COMPLETED SUCCESSFULLY ---');
        process.exit(0);
    } catch (error) {
        console.error('Error during fix:', error);
        process.exit(1);
    }
};

fixAndSeed();
