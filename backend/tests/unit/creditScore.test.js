/**
 * UNIT TESTS — Credit Score Algorithm
 *
 * Testing: backend/src/utils/creditScore.js
 *
 * These tests check the rule-based credit scoring function in isolation.
 * No database or HTTP requests needed — pure function tests.
 *
 * Rules and their points:
 *  - Identity Verified (KYC approved)   → 30 pts
 *  - Business Plan uploaded              → 25 pts
 *  - Description > 200 characters        → 20 pts
 *  - Has at least 1 active investor      → 15 pts
 *  - Funding progress >= 25%             → 10 pts
 *  Total possible: 100 pts
 */

const computeCreditScore = require('../../src/utils/creditScore')

describe('Credit Score Algorithm — Unit Tests', () => {

  test('TC-U01: Score is 0 when no rules are met (empty project, no KYC)', () => {
    const project = {
      description: 'Short',        // less than 200 chars → rule not met
      documents: {},               // no business plan
      investors: [],               // no investors
      fundingGoal: 100000,
      currentFunding: 0,
    }
    const kyc = null               // no KYC record

    const { score } = computeCreditScore(project, kyc)
    expect(score).toBe(0)
  })

  test('TC-U02: KYC approved adds 30 points', () => {
    const project = { description: 'Short', documents: {}, investors: [], fundingGoal: 100000, currentFunding: 0 }
    const kyc = { status: 'approved' }

    const { score } = computeCreditScore(project, kyc)
    expect(score).toBe(30)
  })

  test('TC-U03: Business plan uploaded adds 25 points', () => {
    const project = {
      description: 'Short',
      documents: { businessPlan: 'https://cdn.example.com/plan.pdf' },
      investors: [],
      fundingGoal: 100000,
      currentFunding: 0,
    }
    const { score } = computeCreditScore(project, null)
    expect(score).toBe(25)
  })

  test('TC-U04: Description longer than 200 characters adds 20 points', () => {
    const project = {
      description: 'A'.repeat(201),   // exactly 201 characters → rule met
      documents: {},
      investors: [],
      fundingGoal: 100000,
      currentFunding: 0,
    }
    const { score } = computeCreditScore(project, null)
    expect(score).toBe(20)
  })

  test('TC-U05: Having at least one investor adds 15 points', () => {
    const project = {
      description: 'Short',
      documents: {},
      investors: [{ user: 'user123', amount: 5000 }],
      fundingGoal: 100000,
      currentFunding: 0,
    }
    const { score } = computeCreditScore(project, null)
    expect(score).toBe(15)
  })

  test('TC-U06: Funding progress >= 25% adds 10 points', () => {
    const project = {
      description: 'Short',
      documents: {},
      investors: [],
      fundingGoal: 100000,
      currentFunding: 25000,    // exactly 25% → rule met
    }
    const { score } = computeCreditScore(project, null)
    expect(score).toBe(10)
  })

  test('TC-U07: All rules met gives maximum score of 100', () => {
    const project = {
      description: 'A'.repeat(201),
      documents: { businessPlan: 'https://cdn.example.com/plan.pdf' },
      investors: [{ user: 'user123', amount: 50000 }],
      fundingGoal: 100000,
      currentFunding: 30000,   // 30% → above 25%
    }
    const kyc = { status: 'approved' }

    const { score, breakdown } = computeCreditScore(project, kyc)
    expect(score).toBe(100)
    expect(breakdown).toHaveLength(5)
    breakdown.forEach(rule => expect(rule.met).toBe(true))
  })

  test('TC-U08: Funding at exactly 24% does NOT trigger the 25% rule', () => {
    const project = {
      description: 'Short',
      documents: {},
      investors: [],
      fundingGoal: 100000,
      currentFunding: 24999,   // just under 25%
    }
    const { score } = computeCreditScore(project, null)
    expect(score).toBe(0)
  })

})
