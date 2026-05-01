const request = require('supertest');
const app = require('../app');

describe('Civic policy contract', () => {
  it('exposes neutrality and non-goals', async () => {
    const res = await request(app).get('/policy');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('purpose');
    expect(res.body.nonGoals).toContain('Political advocacy');
  });
});