const express = require('express')
const User = require('../models/User')
const { protect } = require('../middleware/auth')

const router = express.Router()

// GET /api/users/profile — get own profile
router.get('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
})

// PUT /api/users/profile — update own profile
router.put('/profile', protect, async (req, res, next) => {
  try {
    const allowed = ['firstName', 'lastName', 'phoneNumber', 'nic']
    const updates = {}
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field]
    })

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password')

    res.json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
})

// PUT /api/users/change-password — change own password
router.put('/change-password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide currentPassword and newPassword',
      })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters',
      })
    }

    const user = await User.findById(req.user.id).select('+password')
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' })
    }

    user.password = newPassword
    await user.save() // triggers bcrypt pre-save hook

    res.json({ success: true, message: 'Password updated successfully' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
