const RULES = [
  { label: 'Identity Verified (KYC)',       points: 30 },
  { label: 'Business Plan Uploaded',        points: 25 },
  { label: 'Detailed Description Provided', points: 20 },
  { label: 'Has Active Investors',          points: 15 },
  { label: 'Funding Progress ≥ 25%',       points: 10 },
]

/**
 * Compute a rule-based credit score (0–100) for a project.
 * @param {Object} project  - Mongoose project document or plain object
 * @param {Object|null} kyc - KYC record for the entrepreneur (or null)
 * @returns {{ score: number, breakdown: Array }}
 */
const computeCreditScore = (project, kyc) => {
  const checks = [
    kyc?.status === 'approved',
    !!project.documents?.businessPlan,
    (project.description?.length || 0) > 200,
    (project.investors?.length || 0) > 0,
    project.fundingGoal > 0 && (project.currentFunding / project.fundingGoal) >= 0.25,
  ]

  const breakdown = RULES.map((rule, i) => ({ ...rule, met: checks[i] }))
  const score = breakdown.reduce((sum, r) => sum + (r.met ? r.points : 0), 0)
  return { score, breakdown }
}

module.exports = computeCreditScore
