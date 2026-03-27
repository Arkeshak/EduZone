const request = require('supertest');
const app = require('../../server');
const { sequelize } = require('../../models');

describe('Auth API Endpoints', () => {
    // Clean up users before each test
    beforeEach(async () => {
        if (sequelize.models.User) {
            await sequelize.models.User.destroy({ where: {} });
        }
    });

    describe('POST /api/auth/register/donor', () => {
        it('should register a new donor successfully', async () => {
            const res = await request(app)
                .post('/api/auth/register/donor')
                .send({
                    name: 'Test Donor',
                    email: 'testdonor@example.com',
                    password: 'Password123!',
                    phone: '1234567890'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('user');
        });

        it('should fail with missing fields', async () => {
            const res = await request(app)
                .post('/api/auth/register/donor')
                .send({
                    email: 'testdonor@example.com',
                });

            expect(res.statusCode).toBeGreaterThanOrEqual(400);
            expect(res.body).toHaveProperty('message');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login successfully with correct credentials', async () => {
            // Register first
            await request(app).post('/api/auth/register/donor').send({
                name: 'Login Test',
                email: 'loginuser@example.com',
                password: 'Password123!',
                phone: '1234567890'
            });

            // Verify manually
            const { sequelize } = require('../../models');
            await sequelize.models.User.update(
                { isVerified: true },
                { where: { email: 'loginuser@example.com' } }
            );

            // Login
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'loginuser@example.com',
                    password: 'Password123!'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
        });

        it('should fail with incorrect password', async () => {
            await request(app).post('/api/auth/register/donor').send({
                name: 'Login Test',
                email: 'wrongpass@example.com',
                password: 'Password123!',
                phone: '1234567890'
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'wrongpass@example.com',
                    password: 'WrongPassword!'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('message');
        });
    });
});
