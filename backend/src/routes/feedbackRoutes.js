const express = require('express')
const { protect, authorize } = require('../middleware/auth')
const Feedback = require('../models/Feedback')

const router = express.Router()

// POST /api/feedback — submit platform feedback (auth required)
router.post('/', protect, async (req, res, next) => {
  try {
    const trimmedText = String(req.body.text || '').trim()

    if (!trimmedText) {
      return res.status(400).json({ success: false, message: 'Feedback cannot be empty' })
    }

    const userName =
      `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Anonymous User'

    const feedback = await Feedback.create({
      user: req.user._id,
      userName,
      text: trimmedText,
      role: req.user.role || 'investor',
    })

    res.status(201).json({ success: true, data: feedback })
  } catch (err) {
    next(err)
  }
})

// GET /api/feedback/latest — latest 6 feedback items (public)
router.get('/latest', async (req, res, next) => {
  try {
    const feedback = await Feedback.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select('userName text role createdAt')

    res.json({ success: true, data: feedback })
  } catch (err) {
    next(err)
  }
})

// GET /api/feedback/my — current user's feedback history (auth required)
router.get('/my', protect, async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ user: req.user._id })
      .sort({ createdAt: -1 })

    res.json({ success: true, data: feedback })
  } catch (err) {
    next(err)
  }
})

// GET /api/feedback — all feedback (admin only)
router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 })
    res.json({ success: true, data: feedback })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/feedback/:id — delete a feedback entry (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id)
    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' })
    res.json({ success: true, message: 'Feedback deleted' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
