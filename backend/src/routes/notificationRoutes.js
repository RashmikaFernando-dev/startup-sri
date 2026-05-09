const express = require('express')
const { protect } = require('../middleware/auth')
const Notification = require('../models/Notification')

const router = express.Router()

// GET /api/notifications — all notifications for current user
router.get('/', protect, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
    res.json({ success: true, data: notifications })
  } catch (err) {
    next(err)
  }
})

// GET /api/notifications/unread-count — just the badge number
router.get('/unread-count', protect, async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ user: req.user._id, isRead: false })
    res.json({ success: true, count })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/notifications/:id/read — mark one as read
router.patch('/:id/read', protect, async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true }
    )
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/notifications/read-all — mark all as read
router.patch('/read-all', protect, async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true })
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

module.exports = router
