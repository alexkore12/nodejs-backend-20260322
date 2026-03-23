/**
 * Test Suite for Node.js Backend API
 * Tests security, authentication, and endpoints
 */

const request = require('supertest');
const app = require('./src/index');

describe('Security Headers', () => {
  test('should include security headers', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeDefined();
  });
});

describe('Health Check', () => {
  test('GET /api/health should return 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
  });

  test('should return healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.status).toBe('healthy');
  });
});

describe('Authentication', () => {
  test('POST /api/auth/register should create user', async () => {
    const timestamp = Date.now();
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: `testuser${timestamp}`,
        email: `test${timestamp}@example.com`,
        password: 'Test123'
      });
    expect(res.status).toBe(201);
  });

  test('POST /api/auth/login should return token', async () => {
    // First register
    const timestamp = Date.now();
    await request(app)
      .post('/api/auth/register')
      .send({
        username: `logintest${timestamp}`,
        email: `login${timestamp}@example.com`,
        password: 'Test123'
      });

    // Then login
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: `logintest${timestamp}`,
        password: 'Test123'
      });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('should reject invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'nonexistent',
        password: 'wrongpassword'
      });
    expect(res.status).toBe(401);
  });
});

describe('Protected Routes', () => {
  let token;
  let timestamp = Date.now();

  beforeAll(async () => {
    // Register and login to get token
    timestamp = Date.now();
    await request(app)
      .post('/api/auth/register')
      .send({
        username: `protected${timestamp}`,
        email: `protected${timestamp}@example.com`,
        password: 'Test123'
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        username: `protected${timestamp}`,
        password: 'Test123'
      });
    
    token = loginRes.body.token;
  });

  test('GET /api/profile should return user data with valid token', async () => {
    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  test('GET /api/profile should reject without token', async () => {
    const res = await request(app).get('/api/profile');
    expect(res.status).toBe(401);
  });

  test('GET /api/users should list users with valid token', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('Input Validation', () => {
  test('should reject weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'test',
        email: 'test@example.com',
        password: 'weak'
      });
    expect(res.status).toBe(400);
  });

  test('should reject invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'not-an-email',
        password: 'Test123'
      });
    expect(res.status).toBe(400);
  });

  test('should reject short username', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'ab',
        email: 'test@example.com',
        password: 'Test123'
      });
    expect(res.status).toBe(400);
  });
});

describe('Error Handling', () => {
  test('should return 404 for non-existent route', async () => {
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
  });
});
