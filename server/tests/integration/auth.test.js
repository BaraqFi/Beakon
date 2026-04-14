jest.mock('../../models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn()
}));

const request = require('supertest');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const createApp = require('../../app');

describe('Auth routes', () => {
  let app;

  beforeAll(() => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
  });

  beforeEach(() => {
    app = createApp();
    jest.clearAllMocks();
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('registers a user with valid payload', async () => {
    User.findOne.mockResolvedValueOnce(null);
    User.create.mockResolvedValueOnce({
      _id: 'user123',
      email: 'new@example.com',
      name: 'new',
      plan: 'Free'
    });

    const response = await request(app)
      .post('/api/auth/register')
      .set('origin', process.env.CLIENT_URL || 'http://localhost:3000')
      .send({ email: 'new@example.com', password: 'password123', name: 'new' });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe('new@example.com');
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('logs in a user with valid credentials', async () => {
    User.findOne.mockResolvedValueOnce({
      _id: 'user123',
      email: 'test@example.com',
      name: 'test',
      plan: 'Free',
      passwordHash: 'stubbed-hash'
    });

    const response = await request(app)
      .post('/api/auth/login')
      .set('origin', process.env.CLIENT_URL || 'http://localhost:3000')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe('test@example.com');
    expect(response.headers['set-cookie']).toBeDefined();
  });
});
