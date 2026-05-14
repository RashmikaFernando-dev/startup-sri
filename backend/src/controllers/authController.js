const crypto = require('crypto')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/emailService')

// Generate JWT Token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET environment variable is not set')
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  })
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role, phoneNumber } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      })
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'entrepreneur',
      phoneNumber,
    })

    const token = generateToken(user._id.toString())

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.firstName).catch(err =>
      console.error('Failed to send welcome email:', err.message)
    )

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      })
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated',
      })
    }

    const token = generateToken(user._id.toString())

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    res.status(200).json({ success: true, data: user })
  } catch (error) {
    next(error)
  }
}

// @desc    Forgot password — generate reset token and email it
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your email address' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' })
    }

    // Generate a random token, hash it, store only the hash
    const rawToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')

    user.resetPasswordToken = hashedToken
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    await user.save({ validateBeforeSave: false })

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${rawToken}`

    try {
      await sendPasswordResetEmail(user.email, resetUrl)
      res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' })
    } catch (emailErr) {
      user.resetPasswordToken = undefined
      user.resetPasswordExpire = undefined
      await user.save({ validateBeforeSave: false })
      return res.status(500).json({ success: false, message: 'Email could not be sent. Please try again.' })
    }
  } catch (error) {
    next(error)
  }
}

// @desc    Reset password using token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' })
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpire')

    if (!user) {
      return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired' })
    }

    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()

    const token = generateToken(user._id.toString())
    res.status(200).json({ success: true, message: 'Password reset successful', token })
  } catch (error) {
    next(error)
  }
}

module.exports = { register, login, getMe, forgotPassword, resetPassword }
