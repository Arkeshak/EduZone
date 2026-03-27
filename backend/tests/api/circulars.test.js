const request = require('supertest');
const app = require('../../server');
const { sequelize } = require('../../models');

describe('Circular API Endpoints', () => {
    describe('GET /api/circulars', () => {
        it('should fail without token', async () => {
            const res = await request(app).get('/api/circulars');
            expect(res.statusCode).toBe(401);
        });
    });

    describe('POST /api/circulars', () => {
        it('should fail without token', async () => {
            const res = await request(app).post('/api/circulars').send({
                title: 'New Policy',
                content: 'Details here'
            });
            expect(res.statusCode).toBe(401);
        });
    });
});
