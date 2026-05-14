const express = require('express')
const AuditLog = require('../models/AuditLog')
const { protect, authorize } = require('../middleware/auth')

const router = express.Router()

router.use(protect, authorize('admin'))

// GET /api/audit-logs
// Query params: action, adminId, targetType, from, to, page, limit
router.get('/', async (req, res, next) => {
  try {
    const { action, adminId, targetType, from, to, page = 1, limit = 50 } = req.query

    const filter = {}
    if (action)      filter.action = action
    if (adminId)     filter.admin = adminId
    if (targetType)  filter.targetType = targetType
    if (from || to) {
      filter.createdAt = {}
      if (from) filter.createdAt.$gte = new Date(from)
      if (to)   filter.createdAt.$lte = new Date(to)
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const total = await AuditLog.countDocuments(filter)

    const logs = await AuditLog.find(filter)
      .populate('admin', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: logs,
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
