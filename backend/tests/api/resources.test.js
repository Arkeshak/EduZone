const request = require('supertest');
const app = require('../../server');
const { sequelize } = require('../../models');

describe('Resource API Endpoints', () => {
    describe('GET /api/resources/public', () => {
        it('should get all public resources', async () => {
            const res = await request(app).get('/api/resources/public');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body) || typeof res.body === 'object').toBe(true);
        });
    });

    describe('GET /api/resources/my-resources', () => {
        it('should fail without token', async () => {
            const res = await request(app).get('/api/resources/my-resources');
            expect(res.statusCode).toBe(401);
        });
    });
});
