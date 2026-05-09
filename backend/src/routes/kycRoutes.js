const express = require('express')
const router = express.Router()
const KycVerification = require('../models/KycVerification')
const User = require('../models/User')
const { protect, authorize } = require('../middleware/auth')
const { sendKycApprovedEmail, sendKycRejectedEmail } = require('../utils/emailService')
const Notification = require('../models/Notification')
const notifyAdmins = require('../utils/notifyAdmins')

const userOnly = [protect, authorize('entrepreneur', 'investor')]
const admin = [protect, authorize('admin')]

// POST /api/kyc/submit
router.post('/submit', userOnly, async (req, res) => {
  try {
    const { nic, dateOfBirth, address, nicFrontImage, nicBackImage, proofOfAddressImage, businessRegImage } = req.body
    const existing = await KycVerification.findOne({ user: req.user.id })

    if (existing?.status === 'approved')
      return res.status(400).json({ success: false, message: 'Your KYC is already approved.' })
    if (existing?.status === 'pending')
      return res.status(400).json({ success: false, message: 'Your KYC is already pending review.' })

    const userName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'A user'

    if (existing) {
      Object.assign(existing, {
        nic, dateOfBirth, address, nicFrontImage, nicBackImage, proofOfAddressImage,
        businessRegImage: businessRegImage || null, status: 'pending', rejectionReason: null,
        reviewedBy: null, reviewedAt: null, submissionCount: existing.submissionCount + 1,
      })
      await existing.save()
      notifyAdmins(`${userName} re-submitted their KYC verification and it is awaiting your review.`, 'info')
      return res.status(200).json({ success: true, data: existing })
    }

    const kyc = await KycVerification.create({
      user: req.user.id, nic, dateOfBirth, address,
      nicFrontImage, nicBackImage, proofOfAddressImage, businessRegImage: businessRegImage || null,
    })
    notifyAdmins(`${userName} submitted a new KYC verification request awaiting your review.`, 'info')
    res.status(201).json({ success: true, data: kyc })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/kyc/my
router.get('/my', userOnly, async (req, res) => {
  try {
    const kyc = await KycVerification.findOne({ user: req.user.id })
    if (!kyc) return res.status(404).json({ success: false, message: 'No KYC record found.' })
    res.json({ success: true, data: kyc })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PATCH /api/kyc/add-business-reg  — add business registration after KYC approval
router.patch('/add-business-reg', userOnly, async (req, res) => {
  try {
    const kyc = await KycVerification.findOne({ user: req.user.id })
    if (!kyc) return res.status(404).json({ success: false, message: 'KYC record not found.' })
    if (kyc.status !== 'approved') return res.status(400).json({ success: false, message: 'Only approved KYC records can be updated.' })
    if (!req.body.businessRegImage) return res.status(400).json({ success: false, message: 'businessRegImage is required.' })
    kyc.businessRegImage = req.body.businessRegImage
    await kyc.save()
    res.json({ success: true, data: kyc })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/kyc/admin/list
router.get('/admin/list', admin, async (req, res) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {}
    const records = await KycVerification.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
    res.json({ success: true, count: records.length, data: records })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/kyc/admin/:id
router.get('/admin/:id', admin, async (req, res) => {
  try {
    const kyc = await KycVerification.findById(req.params.id)
      .populate('user', 'firstName lastName email phoneNumber')
      .populate('reviewedBy', 'firstName lastName')
    if (!kyc) return res.status(404).json({ success: false, message: 'KYC record not found.' })
    res.json({ success: true, data: kyc })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT /api/kyc/admin/:id/review
router.put('/admin/:id/review', admin, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ success: false, message: 'status must be approved or rejected' })
    if (status === 'rejected' && !rejectionReason)
      return res.status(400).json({ success: false, message: 'rejectionReason is required when rejecting.' })

    const kyc = await KycVerification.findById(req.params.id)
    if (!kyc) return res.status(404).json({ success: false, message: 'KYC record not found.' })

    Object.assign(kyc, {
      status, rejectionReason: status === 'rejected' ? rejectionReason : null,
      reviewedBy: req.user.id, reviewedAt: new Date(),
    })
    await kyc.save()

    // Update user's isVerified flag based on KYC decision
    const user = await User.findById(kyc.user)
    if (user) {
      user.isVerified = status === 'approved'
      await user.save()

      try {
        if (status === 'approved') {
          await sendKycApprovedEmail(user.email, user.firstName)
        } else {
          await sendKycRejectedEmail(user.email, user.firstName, rejectionReason)
        }
      } catch (emailErr) {
        console.error('Failed to send KYC email:', emailErr.message)
      }

      if (status === 'approved') {
        const approvedMsg = user.role === 'investor'
          ? 'Your KYC identity verification has been approved. You can now invest in projects.'
          : 'Your KYC identity verification has been approved. You can now submit projects.'
        Notification.create({
          user: kyc.user,
          message: approvedMsg,
          type: 'success',
        }).catch(() => {})
      } else {
        Notification.create({
          user: kyc.user,
          message: `Your KYC verification was rejected. Reason: ${rejectionReason}`,
          type: 'warning',
        }).catch(() => {})
      }
    }

    res.json({ success: true, data: kyc })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
