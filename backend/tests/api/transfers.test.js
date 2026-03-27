const request = require('supertest');
const app = require('../../server');
const { sequelize } = require('../../models');

describe('Transfer API Endpoints', () => {
    describe('GET /api/transfers', () => {
        it('should fail without token', async () => {
            const res = await request(app).get('/api/transfers');
            expect(res.statusCode).toBe(401);
        });
    });

    describe('POST /api/transfers', () => {
        it('should fail without token', async () => {
            const res = await request(app).post('/api/transfers').send({
                amount: 1000,
                schoolId: 1
            });
            expect(res.statusCode).toBe(401);
        });
    });
});
