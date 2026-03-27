const request = require('supertest');
const app = require('../../server');
const { sequelize } = require('../../models');

let donorToken;
let zeoToken;

describe('Donation API Endpoints', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });

        // Register donor
        await request(app).post('/api/auth/register/donor').send({
            name: 'Donor User',
            email: 'donor@example.com',
            password: 'Password123!',
            phone: '1234567890'
        });
        await sequelize.models.User.update({ isVerified: true }, { where: { email: 'donor@example.com' } });
        const donorRes = await request(app).post('/api/auth/login').send({ email: 'donor@example.com', password: 'Password123!' });
        donorToken = donorRes.body.token;

        // Register a ZEO to verify donations
        // Normally this is an admin route, but we might just test unauthorized for now.
    });



    describe('GET /api/donations', () => {
        it('should fail without token', async () => {
            const res = await request(app).get('/api/donations');
            expect(res.statusCode).toBe(401);
        });

        it('should get all user donations when authorized', async () => {
            const res = await request(app)
                .get('/api/donations')
                .set('Authorization', `Bearer ${donorToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body) || Array.isArray(res.body?.data)).toBe(true);
        });
    });

    describe('GET /api/donations/stats', () => {
        it('should return donation statistics', async () => {
            const res = await request(app).get('/api/donations/stats');

            // Depending on implementation, some public stats might just return 200
            expect(res.statusCode).toBe(200);
            expect(typeof res.body).toBe('object');
        });
    });

    describe('POST /api/donations', () => {
        it('should fail if missing required fields (like amount)', async () => {
            const res = await request(app)
                .post('/api/donations')
                .set('Authorization', `Bearer ${donorToken}`)
                .send({
                    type: 'money'
                });

            expect(res.statusCode).toBeGreaterThanOrEqual(400); // Bad request
        });
    });
});
