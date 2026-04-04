const express = require('express')
const { protect } = require('../middleware/auth')
const Investment = require('../models/Investment')
const Project = require('../models/Project')

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

    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }
    if (!['active', 'approved'].includes(project.status)) {
      return res.status(400).json({ success: false, message: 'Project is not currently accepting investments' })
    }

    // Create the investment record (status = completed after payment)
    const investment = await Investment.create({
      investor: req.user._id,
      project: projectId,
      amount: parsedAmount,
      type: project.fundingType === 'equity' ? 'equity' : 'loan',
      status: 'completed',
      paymentIntentId: orderId || `MANUAL_${Date.now()}`,
    })

    // Update project's current funding
    project.currentFunding = (project.currentFunding || 0) + parsedAmount
    if (project.currentFunding >= project.fundingGoal) {
      project.status = 'funded'
    }
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

    res.status(201).json({ success: true, data: investment })
  } catch (err) {
    next(err)
  }
})

// GET /api/investments/my  — list the logged-in user's investments
router.get('/my', protect, async (req, res, next) => {
  try {
    const investments = await Investment.find({ investor: req.user._id })
      .populate('project', 'title category fundingType fundingGoal currentFunding status')
      .sort({ createdAt: -1 })
    res.json({ success: true, data: investments })
  } catch (err) {
    next(err)
  }
})

module.exports = router
