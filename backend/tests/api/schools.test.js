const request = require('supertest');
const app = require('../../server');
const { sequelize } = require('../../models');

let authToken;

describe('School API Endpoints', () => {
    beforeAll(async () => {
        // Sync database and create a user/school for protected routes
        await sequelize.sync({ force: true });

        // Register a user
        await request(app).post('/api/auth/register/donor').send({
            name: 'School Test User',
            email: 'schooltest@example.com',
            password: 'Password123!',
            phone: '1234567890'
        });
        await sequelize.models.User.update({ isVerified: true }, { where: { email: 'schooltest@example.com' } });
        const res = await request(app).post('/api/auth/login').send({ email: 'schooltest@example.com', password: 'Password123!' });
        authToken = res.body.token;
    });



    describe('GET /api/schools', () => {
        it('should get all schools', async () => {
            const res = await request(app).get('/api/schools');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('GET /api/schools/my-school', () => {
        it('should fail without token', async () => {
            const res = await request(app).get('/api/schools/my-school');
            expect(res.statusCode).toBe(401);
        });

        it('should succeed with token but might return 404 if no school attached', async () => {
            const res = await request(app)
                .get('/api/schools/my-school')
                .set('Authorization', `Bearer ${authToken}`);

            // This depends on whether registration creates a school or not
            // We just ensure it passes auth
            expect(res.statusCode).not.toBe(401);
        });
    });
});
