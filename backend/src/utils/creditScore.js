/**
 * Calculate a credit score (0–100) for a user.
 * @param {object} userData
 * @param {string} userData.verificationStatus  - 'approved' | 'pending' | other
 * @param {number} userData.totalProjects
 * @param {number} userData.successfulProjects
 * @param {number} userData.onTimeRepayments
 * @param {number} userData.totalRepayments
 * @param {number} userData.accountAge  - in months
 * @returns {number}
 */
const calculateCreditScore = (userData) => {
  let score = 0

  // Identity Verification (25 points)
  if (userData.verificationStatus === 'approved') {
    score += 25
  } else if (userData.verificationStatus === 'pending') {
    score += 10
  }

  // Project Track Record (30 points)
  if (userData.totalProjects > 0) {
    const successRate = userData.successfulProjects / userData.totalProjects
    score += successRate * 30
  }

  // Repayment History (35 points)
  if (userData.totalRepayments > 0) {
    const repaymentRate = userData.onTimeRepayments / userData.totalRepayments
    score += repaymentRate * 35
  }

  // Account Age (10 points)
  if (userData.accountAge >= 12) {
    score += 10
  } else if (userData.accountAge >= 6) {
    score += 5
  } else if (userData.accountAge >= 3) {
    score += 2
  }

  return Math.min(Math.round(score), 100)
}

module.exports = { calculateCreditScore }
