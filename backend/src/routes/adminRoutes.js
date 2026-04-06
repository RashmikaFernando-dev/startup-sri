const express = require('express')
const User = require('../models/User')
const Investment = require('../models/Investment')
const {
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  updateProjectStatus,
} = require('../controllers/projectController')
const { protect, authorize } = require('../middleware/auth')

const router = express.Router()

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'))

// GET /api/admin/users — list all users
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    res.json({ success: true, count: users.length, data: users })
  } catch (err) {
    next(err)
  }
})

// GET /api/admin/users/:id — get a single user
router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    res.json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
})


router.get('/projects', getProjects)

router.get('/projects/:id', getProject)

router.put('/projects/:id', updateProject)

router.delete('/projects/:id', deleteProject)

router.put('/projects/:id/status', updateProjectStatus)

// GET /api/admin/transactions — all investment transactions
router.get('/transactions', async (req, res, next) => {
  try {
    const { type, status } = req.query
    const filter = {}
    if (type) filter.type = type
    if (status) filter.status = status

    const transactions = await Investment.find(filter)
      .populate('investor', 'firstName lastName email')
      .populate('project', 'title category fundingType')
      .sort({ createdAt: -1 })

    res.json({ success: true, count: transactions.length, data: transactions })
  } catch (err) {
    next(err)
  }
})

module.exports = router
