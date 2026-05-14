/**
 * INTEGRATION TESTS — KYC + Project Submission Workflow
 *
 * Tests the connected workflow:
 *  1. Entrepreneur registers
 *  2. Entrepreneur tries to submit project WITHOUT KYC → blocked
 *  3. Entrepreneur submits KYC
 *  4. Admin approves the KYC
 *  5. Entrepreneur can now submit a project successfully
 *  6. Admin approves the project
 *  7. Investor can browse approved projects
 */

require('../setup')
const request = require('supertest')
const app = require('../../src/app')
const User = require('../../src/models/User')

// ── Helper: register a user and return their token ──────────────────────────
const registerAndLogin = async (userData) => {
  const res = await request(app).post('/api/auth/register').send(userData)
  return res.body.token
}

// ── Test data ────────────────────────────────────────────────────────────────
const entrepreneur = {
  firstName: 'Kamal',
  lastName: 'Perera',
  email: 'kamal@test.com',
  password: 'Password123',
  role: 'entrepreneur',
}

const investor = {
  firstName: 'Nimal',
  lastName: 'Silva',
  email: 'nimal@test.com',
  password: 'Password123',
  role: 'investor',
}

const sampleProject = {
  title: 'EduTech Sri Lanka',
  description: 'A'.repeat(300),   // must be > 200 chars for credit score
  category: 'Software',
  fundingType: 'microloan',
  fundingGoal: 500000,
  interestRate: 8,
  duration: 12,
}

const sampleKyc = {
  nic: '200012345678',
  dateOfBirth: '2000-05-01',
  address: '123 Main Street, Colombo 03',
  nicFrontImage: 'data:image/png;base64,abc',
  nicBackImage: 'data:image/png;base64,xyz',
  proofOfAddressImage: 'data:image/png;base64,proof',
}

describe('KYC + Project Workflow — Integration Tests', () => {

  let entrepreneurToken
  let adminToken
  let kycId
  let projectId

  beforeEach(async () => {
    // Register entrepreneur and investor
    entrepreneurToken = await registerAndLogin(entrepreneur)
    await registerAndLogin(investor)

    // Promote a user to admin directly in the DB (no public register-as-admin endpoint)
    await User.findOneAndUpdate(
      { email: entrepreneur.email },
      { $set: {} }   // entrepreneur stays entrepreneur
    )
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      password: 'AdminPass123',
      role: 'admin',
    })
    const adminLoginRes = await request(app).post('/api/auth/login').send({
      email: 'admin@test.com',
      password: 'AdminPass123',
    })
    adminToken = adminLoginRes.body.token
  })

  // ── KYC ────────────────────────────────────────────────────────────────────

  test('TC-P01: Entrepreneur cannot submit a project without KYC approval', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${entrepreneurToken}`)
      .send(sampleProject)

    expect(res.statusCode).toBe(403)
    expect(res.body.kycRequired).toBe(true)
  })

  test('TC-P02: Entrepreneur can submit KYC successfully', async () => {
    const res = await request(app)
      .post('/api/kyc/submit')
      .set('Authorization', `Bearer ${entrepreneurToken}`)
      .send(sampleKyc)

    expect(res.statusCode).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.status).toBe('pending')
    kycId = res.body.data._id
  })

  test('TC-P03: Admin can approve a KYC submission', async () => {
    // Submit KYC first
    const kycRes = await request(app)
      .post('/api/kyc/submit')
      .set('Authorization', `Bearer ${entrepreneurToken}`)
      .send(sampleKyc)
    kycId = kycRes.body.data._id

    // Admin approves
    const res = await request(app)
      .put(`/api/kyc/admin/${kycId}/review`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'approved' })

    expect(res.statusCode).toBe(200)
    expect(res.body.data.status).toBe('approved')
  })

  // ── PROJECT SUBMISSION ─────────────────────────────────────────────────────

  test('TC-P04: Entrepreneur can submit a project after KYC is approved', async () => {
    // Submit and approve KYC
    const kycRes = await request(app)
      .post('/api/kyc/submit')
      .set('Authorization', `Bearer ${entrepreneurToken}`)
      .send(sampleKyc)
    kycId = kycRes.body.data._id

    await request(app)
      .put(`/api/kyc/admin/${kycId}/review`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'approved' })

    // Now submit project
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${entrepreneurToken}`)
      .send(sampleProject)

    expect(res.statusCode).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.status).toBe('pending')
    projectId = res.body.data._id
  })

  test('TC-P05: Admin can approve a project and investor can see it in listings', async () => {
    // Full setup: KYC approved → project submitted
    const kycRes = await request(app)
      .post('/api/kyc/submit')
      .set('Authorization', `Bearer ${entrepreneurToken}`)
      .send(sampleKyc)

    await request(app)
      .put(`/api/kyc/admin/${kycRes.body.data._id}/review`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'approved' })

    const projRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${entrepreneurToken}`)
      .send(sampleProject)
    projectId = projRes.body.data._id

    // Admin approves the project
    const approveRes = await request(app)
      .put(`/api/admin/projects/${projectId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'approved' })

    expect(approveRes.statusCode).toBe(200)
    expect(approveRes.body.data.status).toBe('approved')

    // Investor browses approved projects
    const investorToken = await registerAndLogin({ ...investor, email: 'investor2@test.com' })
    const listRes = await request(app)
      .get('/api/projects?status=approved')
      .set('Authorization', `Bearer ${investorToken}`)

    expect(listRes.statusCode).toBe(200)
    expect(listRes.body.data.length).toBeGreaterThan(0)
    expect(listRes.body.data[0].title).toBe(sampleProject.title)
  })

})
