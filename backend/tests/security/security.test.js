/**
 * SECURITY TESTS — JWT, Role-Based Access Control, Input Protection
 *
 * These tests verify that the security controls in the system actually work:
 *
 *  TC-S01: A request with no JWT token is rejected (401)
 *  TC-S02: A request with a fake/invalid JWT is rejected (401)
 *  TC-S03: An entrepreneur cannot access admin-only routes (403)
 *  TC-S04: An investor cannot submit a project (403 — entrepreneur only)
 *  TC-S05: An investor cannot invest without KYC approval (403)
 *  TC-S06: NoSQL injection in login body is blocked — no user returned
 *  TC-S07: Passwords are never returned in any API response
 */

require('../setup')
const request = require('supertest')
const app = require('../../src/app')
const User = require('../../src/models/User')

// ── Helpers ──────────────────────────────────────────────────────────────────
const registerUser = async (overrides = {}) => {
  const defaults = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@test.com',
    password: 'Password123',
    role: 'entrepreneur',
  }
  const res = await request(app).post('/api/auth/register').send({ ...defaults, ...overrides })
  return { token: res.body.token, data: res.body.data }
}

describe('Security Tests', () => {

  test('TC-S01: Accessing a protected route without any JWT returns 401', async () => {
    const res = await request(app).get('/api/auth/me')
    // No Authorization header at all

    expect(res.statusCode).toBe(401)
    expect(res.body.success).toBe(false)
  })

  test('TC-S02: Accessing a protected route with a fake/tampered JWT returns 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer this.is.a.fake.token')

    expect(res.statusCode).toBe(401)
    expect(res.body.success).toBe(false)
  })

  test('TC-S03: An entrepreneur cannot access admin-only user management route (403)', async () => {
    const { token } = await registerUser({ role: 'entrepreneur' })

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toBe(403)
    expect(res.body.success).toBe(false)
  })

  test('TC-S04: An investor cannot access admin-only routes (403)', async () => {
    const { token } = await registerUser({ email: 'inv@test.com', role: 'investor' })

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toBe(403)
    expect(res.body.success).toBe(false)
  })

  test('TC-S05: An investor without KYC cannot invest in a project (403)', async () => {
    const { token } = await registerUser({ email: 'investor@test.com', role: 'investor' })

    const res = await request(app)
      .post('/api/investments')
      .set('Authorization', `Bearer ${token}`)
      .send({ projectId: '648a1b2c3d4e5f6789abcdef', amount: 5000 })

    expect(res.statusCode).toBe(403)
    expect(res.body.kycRequired).toBe(true)
  })

  test('TC-S06: NoSQL injection in login email field is blocked — no token returned', async () => {
    // Register a real user first
    await registerUser({ email: 'real@test.com', password: 'Password123' })

    // Attempt NoSQL injection: { "$gt": "" } would match any user in a vulnerable system
    const res = await request(app).post('/api/auth/login').send({
      email: { $gt: '' },
      password: { $gt: '' },
    })

    // Should NOT get a 200 with a token — either 400 or 401
    expect(res.statusCode).not.toBe(200)
    expect(res.body.token).toBeUndefined()
  })

  test('TC-S07: Password field is never exposed in register or login responses', async () => {
    const registerRes = await request(app).post('/api/auth/register').send({
      firstName: 'Safe',
      lastName: 'User',
      email: 'safe@test.com',
      password: 'Password123',
      role: 'entrepreneur',
    })

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'safe@test.com',
      password: 'Password123',
    })

    // Password must never appear in any response
    expect(registerRes.body.user?.password).toBeUndefined()
    expect(loginRes.body.user?.password).toBeUndefined()
    expect(JSON.stringify(registerRes.body)).not.toContain('Password123')
    expect(JSON.stringify(loginRes.body)).not.toContain('Password123')
  })

})
