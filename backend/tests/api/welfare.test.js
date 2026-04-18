const request = require('supertest');
const app = require('../../server');
const { sequelize } = require('../../models');

describe('Welfare API Endpoints', () => {
    describe('GET /api/welfare/published', () => {
        it('should get published welfare requests', async () => {
            const res = await request(app).get('/api/welfare/published');
            expect(res.statusCode).toBe(200);
            const data = res.body.data || res.body;
            expect(Array.isArray(data)).toBe(true);
        });
    });

    describe('POST /api/welfare', () => {
        it('should fail without teacher token', async () => {
            const res = await request(app).post('/api/welfare').send({
                title: 'Need Books',
                description: 'We need more math books',
                amount: 500
            });
            expect(res.statusCode).toBe(401);
        });
    });
});
