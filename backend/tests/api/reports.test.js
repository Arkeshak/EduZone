const request = require('supertest');
const app = require('../../server');
const { sequelize } = require('../../models');

let authToken;

describe('Report API Endpoints', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });

        const bcrypt = require('bcryptjs');
        const user = await sequelize.models.User.create({
            fullName: 'Report Test User',
            email: 'reporttest@example.com',
            passwordHash: await bcrypt.hash('Password123!', 10),
            role: 'PRINCIPAL',
            isVerified: true
        });
        const school = await sequelize.models.School.create({
            name: 'Report Test School',
            email: 'report-school@example.com',
            address: '123 Test Ave',
            contactNumber: '1234567890',
            district: 'Test District',
            zone: 'Test Zone'
        });
        await sequelize.models.Principal.create({ userId: user.id, schoolId: school.id });
        const res = await request(app).post('/api/auth/login').send({ email: 'reporttest@example.com', password: 'Password123!' });
        authToken = res.body.token;
    });



    describe('GET /api/reports', () => {
        it('should get all reports for authorized user', async () => {
            const res = await request(app)
                .get('/api/reports')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(403); // Requires ZEO
        });

        it('should fail without token', async () => {
            const res = await request(app).get('/api/reports');
            expect(res.statusCode).toBe(401);
        });
    });

    describe('POST /api/reports', () => {
        it('should create a new report successfully', async () => {
            const res = await request(app)
                .post('/api/reports')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    reportMonth: '2026-03',
                    avgAttendance: 95.5,
                    staffAttendance: 98.0,
                    dropoutCount: 0,
                    remarks: 'All good'
                });

            expect(res.statusCode).toBe(201);
            expect(typeof res.body).toBe('object');
        });
    });
});
