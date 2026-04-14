const request = require('supertest');
const createApp = require('../../app');

describe('GET /api/health', () => {
  it('returns server health payload', async () => {
    const app = createApp();
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(typeof response.body.timestamp).toBe('string');
  });
});
