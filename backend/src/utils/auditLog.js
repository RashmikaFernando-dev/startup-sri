const AuditLog = require('../models/AuditLog')

/**
 * Record a sensitive admin action in the audit log.
 *
 * @param {Object} params
 * @param {string|ObjectId} params.adminId       - ID of the admin performing the action
 * @param {string}          params.action        - Action constant (e.g. 'KYC_APPROVED')
 * @param {string}          params.targetType    - 'KYC' | 'Project' | 'User'
 * @param {string|ObjectId} params.targetId      - ID of the affected document
 * @param {string}          params.targetLabel   - Human-readable name (e.g. project title, user email)
 * @param {Object}          [params.details]     - Extra context (rejection reason, new status, etc.)
 * @param {import('express').Request} [params.req] - Express request object for IP capture
 */
const createAuditLog = async ({ adminId, action, targetType, targetId, targetLabel, details = {}, req = null }) => {
  try {
    const ipAddress = req
      ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null)
      : null

    await AuditLog.create({
      admin: adminId,
      action,
      targetType,
      targetId,
      targetLabel,
      details,
      ipAddress,
    })
  } catch (err) {
    // Audit log failure must never crash the main request
    console.error('[AuditLog] Failed to write audit entry:', err.message)
  }
}

module.exports = createAuditLog
