const express = require('express')
const router = express.Router()
const KycVerification = require('../models/KycVerification')
const { protect, authorize } = require('../middleware/auth')

const entrepreneur = [protect, authorize('entrepreneur')]
const admin = [protect, authorize('admin')]

// POST /api/kyc/submit
router.post('/submit', entrepreneur, async (req, res) => {
  try {
    const { nic, dateOfBirth, address, nicFrontImage, nicBackImage, proofOfAddressImage, businessRegImage } = req.body
    const existing = await KycVerification.findOne({ user: req.user.id })

    if (existing?.status === 'approved')
      return res.status(400).json({ success: false, message: 'Your KYC is already approved.' })
    if (existing?.status === 'pending')
      return res.status(400).json({ success: false, message: 'Your KYC is already pending review.' })

    if (existing) {
      Object.assign(existing, {
        nic, dateOfBirth, address, nicFrontImage, nicBackImage, proofOfAddressImage,
        businessRegImage: businessRegImage || null, status: 'pending', rejectionReason: null,
        reviewedBy: null, reviewedAt: null, submissionCount: existing.submissionCount + 1,
      })
      await existing.save()
      return res.status(200).json({ success: true, data: existing })
    }

    const kyc = await KycVerification.create({
      user: req.user.id, nic, dateOfBirth, address,
      nicFrontImage, nicBackImage, proofOfAddressImage, businessRegImage: businessRegImage || null,
    })
    res.status(201).json({ success: true, data: kyc })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/kyc/my
router.get('/my', entrepreneur, async (req, res) => {
  try {
    const kyc = await KycVerification.findOne({ user: req.user.id })
    if (!kyc) return res.status(404).json({ success: false, message: 'No KYC record found.' })
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
    res.json({ success: true, data: kyc })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
