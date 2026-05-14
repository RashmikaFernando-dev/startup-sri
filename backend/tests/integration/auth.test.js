/**
 * INTEGRATION TESTS — Authentication
 *
 * Testing: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
 *
 * These tests send real HTTP requests to the Express app connected to an
 * in-memory MongoDB database. They verify that the full auth workflow works
 * correctly from request to database to response.
 */

require('../setup')
const request = require('supertest')
const app = require('../../src/app')

// A valid test user we reuse across tests
const testUser = {
  firstName: 'Pasindu',
  lastName: 'Fernando',
  email: 'pasindu@test.com',
  password: 'Password123',
  role: 'entrepreneur',
}

describe('Authentication — Integration Tests', () => {

  // ─── REGISTER ──────────────────────────────────────────────────────────────

  test('TC-A01: Register a new user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser)

    expect(res.statusCode).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.token).toBeDefined()          // JWT returned
    expect(res.body.user.email).toBe(testUser.email)
    expect(res.body.user.password).toBeUndefined() // password must NOT be in response
  })

  test('TC-A02: Register fails when email is already taken', async () => {
    // First registration
    await request(app).post('/api/auth/register').send(testUser)

    // Second registration with same email
    const res = await request(app).post('/api/auth/register').send(testUser)

    expect(res.statusCode).toBe(400)
    expect(res.body.success).toBe(false)
  })

  test('TC-A03: Register fails when required fields are missing', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'incomplete@test.com',
      // missing firstName, lastName, password
    })

    expect(res.statusCode).toBe(400)
    expect(res.body.success).toBe(false)
  })

  // ─── LOGIN ─────────────────────────────────────────────────────────────────

  test('TC-A04: Login with correct credentials returns a JWT token', async () => {
    // Register first
    await request(app).post('/api/auth/register').send(testUser)

    // Then login
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    })

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.token).toBeDefined()
    expect(res.body.user.role).toBe('entrepreneur')
  })

  test('TC-A05: Login fails with wrong password', async () => {
    await request(app).post('/api/auth/register').send(testUser)

    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword999',
    })

    expect(res.statusCode).toBe(401)
    expect(res.body.success).toBe(false)
    expect(res.body.token).toBeUndefined()
  })

  test('TC-A06: Login fails with a non-existent email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@test.com',
      password: 'Password123',
    })

    expect(res.statusCode).toBe(401)
    expect(res.body.success).toBe(false)
  })

  // ─── GET ME (protected route) ───────────────────────────────────────────────

  test('TC-A07: GET /api/auth/me returns the logged-in user when token is valid', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(testUser)
    const token = registerRes.body.token

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.data.email).toBe(testUser.email)
  })

  test('TC-A08: GET /api/auth/me returns 401 when no token is sent', async () => {
    const res = await request(app).get('/api/auth/me')
    // No Authorization header

    expect(res.statusCode).toBe(401)
    expect(res.body.success).toBe(false)
  })

})
