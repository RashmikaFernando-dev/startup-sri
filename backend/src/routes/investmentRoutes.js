const express = require('express')
const { protect } = require('../middleware/auth')
const Investment = require('../models/Investment')
const Project = require('../models/Project')
const User = require('../models/User')
const { sendInvestmentReceivedEmail, sendRepaymentOverdueEmail } = require('../utils/emailService')
const KycVerification = require('../models/KycVerification')
const computeCreditScore = require('../utils/creditScore')
const Notification = require('../models/Notification')

const router = express.Router()

// POST /api/investments  — record a new investment after PayHere payment
router.post('/', protect, async (req, res, next) => {
  try {
    const { projectId, amount, orderId } = req.body

    if (!projectId || !amount) {
      return res.status(400).json({ success: false, message: 'projectId and amount are required' })
    }

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' })
    }

    // Investor must have approved KYC before investing
    const investorKyc = await KycVerification.findOne({ user: req.user._id })
    if (!investorKyc || investorKyc.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'You must complete identity verification (KYC) before investing.',
        kycRequired: true,
      })
    }

    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }
    if (!['active', 'approved'].includes(project.status)) {
      return res.status(400).json({ success: false, message: 'Project is not currently accepting investments' })
    }

    const paymentId = orderId || `MANUAL_${Date.now()}`

    // Prevent duplicate investment for the same order
    const existing = await Investment.findOne({ paymentIntentId: paymentId })
    if (existing) {
      return res.status(200).json({ success: true, data: existing, duplicate: true })
    }

    const investment = await Investment.create({
      investor: req.user._id,
      project: projectId,
      amount: parsedAmount,
      type: project.fundingType === 'equity' ? 'equity' : 'loan',
      status: 'completed',
      paymentIntentId: paymentId,
    })

    // Update project's current funding and track investor
    project.currentFunding = (project.currentFunding || 0) + parsedAmount
    if (project.currentFunding >= project.fundingGoal) {
      project.status = 'funded'
    }
    project.investors.push({
      user: req.user._id,
      amount: parsedAmount,
      type: project.fundingType === 'equity' ? 'equity' : 'loan',
      date: new Date(),
    })
    await project.save()

    // Generate repayment schedule for microloan investments
    if (project.fundingType === 'microloan' && project.duration && project.interestRate) {
      const monthlyRate = project.interestRate / 100 / 12
      const n = project.duration
      const monthlyPayment =
        monthlyRate === 0
          ? parsedAmount / n
          : (parsedAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n))

      const schedule = []
      for (let i = 1; i <= n; i++) {
        const due = new Date()
        due.setMonth(due.getMonth() + i)
        schedule.push({ dueDate: due, amount: Math.round(monthlyPayment), status: 'pending' })
      }
      investment.repaymentSchedule = schedule
      await investment.save()
    }

    // Recompute and persist entrepreneur's credit score
    try {
      const kyc = await KycVerification.findOne({ user: project.entrepreneur }).lean()
      const { score } = computeCreditScore(project, kyc)
      await User.findByIdAndUpdate(project.entrepreneur, { creditScore: score })
    } catch (scoreErr) {
      console.error('Failed to update credit score:', scoreErr.message)
    }

    // Notify entrepreneur of new investment
    try {
      const entrepreneur = await User.findById(project.entrepreneur).select('email')
      if (entrepreneur?.email) {
        await sendInvestmentReceivedEmail(entrepreneur.email, project.title, parsedAmount)
      }
    } catch (emailErr) {
      console.error('Failed to send investment email:', emailErr.message)
    }

    // In-app notifications
    const investorName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'An investor'
    Notification.create({
      user: project.entrepreneur,
      message: `${investorName} invested LKR ${parsedAmount.toLocaleString()} in your project "${project.title}".`,
      type: 'success',
    }).catch(() => {})

    // Notify investor that their investment was recorded
    Notification.create({
      user: req.user._id,
      message: `Your investment of LKR ${parsedAmount.toLocaleString()} in "${project.title}" was successful.`,
      type: 'success',
    }).catch(() => {})

    // Notify entrepreneur if project just became fully funded
    if (project.status === 'funded') {
      Notification.create({
        user: project.entrepreneur,
        message: `Congratulations! Your project "${project.title}" has reached its funding goal.`,
        type: 'success',
      }).catch(() => {})
    }

    res.status(201).json({ success: true, data: investment })
  } catch (err) {
    next(err)
  }
})

// GET /api/investments/my  — list the logged-in user's investments
router.get('/my', protect, async (req, res, next) => {
  try {
    const investments = await Investment.find({ investor: req.user._id })
      .populate('project', 'title category fundingType fundingGoal currentFunding status interestRate duration equityOffered')
      .sort({ createdAt: -1 })
    res.json({ success: true, data: investments })
  } catch (err) {
    next(err)
  }
})

// GET /api/investments/entrepreneur  — microloan investments on entrepreneur's projects
router.get('/entrepreneur', protect, async (req, res, next) => {
  try {
    const projects = await Project.find({ entrepreneur: req.user._id }).select('_id title')
    const projectIds = projects.map(p => p._id)
    const investments = await Investment.find({
      project: { $in: projectIds },
      type: 'loan',
      'repaymentSchedule.0': { $exists: true },
    })
      .populate('project', 'title fundingType interestRate duration')
      .populate('investor', 'firstName lastName email')
      .sort({ createdAt: -1 })
    res.json({ success: true, data: investments })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/investments/:id/repayment/:index
// Entrepreneur claims they have paid — sets status to payment_claimed
router.patch('/:id/repayment/:index', protect, async (req, res, next) => {
  try {
    const investment = await Investment.findById(req.params.id).populate('project', 'entrepreneur title')
    if (!investment) return res.status(404).json({ success: false, message: 'Investment not found' })

    if (investment.project.entrepreneur.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' })

    const idx = parseInt(req.params.index)
    const instalment = investment.repaymentSchedule[idx]
    if (!instalment) return res.status(404).json({ success: false, message: 'Instalment not found' })
    if (instalment.status === 'paid') return res.status(400).json({ success: false, message: 'Already paid' })
    if (instalment.status === 'payment_claimed') return res.status(400).json({ success: false, message: 'Payment already claimed — awaiting investor confirmation' })

    investment.repaymentSchedule[idx].status = 'payment_claimed'
    investment.repaymentSchedule[idx].claimedDate = new Date()
    investment.markModified('repaymentSchedule')
    await investment.save()

    // Notify investor to confirm receipt
    const entrepreneurName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'The entrepreneur'
    Notification.create({
      user: investment.investor,
      message: `${entrepreneurName} has claimed repayment #${idx + 1} for "${investment.project.title}". Please confirm receipt in your portfolio.`,
      type: 'info',
    }).catch(() => {})

    res.json({ success: true, data: investment })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/investments/:id/repayment/:index/confirm
// Investor confirms they received the payment — sets status to paid
router.patch('/:id/repayment/:index/confirm', protect, async (req, res, next) => {
  try {
    const investment = await Investment.findById(req.params.id).populate('project', 'entrepreneur title')
    if (!investment) return res.status(404).json({ success: false, message: 'Investment not found' })

    if (investment.investor.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized — only the investor can confirm receipt' })

    const idx = parseInt(req.params.index)
    const instalment = investment.repaymentSchedule[idx]
    if (!instalment) return res.status(404).json({ success: false, message: 'Instalment not found' })
    if (instalment.status !== 'payment_claimed') return res.status(400).json({ success: false, message: 'Instalment is not awaiting confirmation' })

    investment.repaymentSchedule[idx].status = 'paid'
    investment.repaymentSchedule[idx].paidDate = new Date()
    investment.markModified('repaymentSchedule')
    await investment.save()

    // Notify entrepreneur that payment was confirmed
    const investorName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'The investor'
    Notification.create({
      user: investment.project.entrepreneur,
      message: `${investorName} confirmed receipt of repayment #${idx + 1} for "${investment.project.title}". Instalment marked as paid.`,
      type: 'success',
    }).catch(() => {})

    // Check for overdue remaining instalments and notify entrepreneur
    try {
      const now = new Date()
      const nextOverdue = investment.repaymentSchedule.find(
        r => r.status !== 'paid' && r.status !== 'payment_claimed' && new Date(r.dueDate) < now
      )
      if (nextOverdue) {
        const project = await Project.findById(investment.project).populate('entrepreneur', 'email')
        if (project?.entrepreneur?.email) {
          await sendRepaymentOverdueEmail(project.entrepreneur.email, project.title, nextOverdue.amount, nextOverdue.dueDate)
        }
      }
    } catch (emailErr) {
      console.error('Failed to send overdue email:', emailErr.message)
    }

    res.json({ success: true, data: investment })
  } catch (err) {
    next(err)
  }
})

module.exports = router
