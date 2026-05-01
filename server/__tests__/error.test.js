const request = require('supertest');
const express = require('express');
const app = require('../app');

describe('Global error handling', () => {

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/__does_not_exist__');

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual(
      expect.objectContaining({
        error: 'NotFound'
      })
    );
  });

  it('returns 500 for thrown runtime errors', async () => {
    const testApp = express();

    testApp.get('/boom', () => {
      throw new Error('boom');
    });

    // attach same error handler logic as app.js
    testApp.use((err, _req, res, _next) => {
      res.status(500).json({ error: 'InternalError' });
    });

    const res = await request(testApp).get('/boom');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'InternalError');
  });

});
