const request = require('supertest');
const app = require('../app');

describe('Health & Meta Endpoints', () => {
  it('GET /health returns ok status', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET /meta returns service metadata', async () => {
    const res = await request(app).get('/meta');

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      service: 'gemini-poll-assistant',
      runtime: 'cloud-run',
      stateless: true
    });
  });

  it('GET /unknown returns structured 404', async () => {
    const res = await request(app).get('/some-random-route');

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'NotFound');
  });
});
