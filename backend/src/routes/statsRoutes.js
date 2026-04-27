const express = require('express')
const Project = require('../models/Project')
const Investment = require('../models/Investment')
const User = require('../models/User')
const { protect, authorize } = require('../middleware/auth')

const router = express.Router()

// GET /api/stats/public — homepage stats (no auth required)
router.get('/public', async (req, res) => {
  try {
    const [totalFunded, fundedProjects, investorCount] = await Promise.all([
      Investment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Project.countDocuments({ status: { $in: ['funded', 'active', 'completed', 'approved'] } }),
      User.countDocuments({ role: 'investor' }),
    ])

    const totalAmount = totalFunded[0]?.total || 0
    const completedInvestments = await Investment.countDocuments({ status: 'completed' })
    const totalInvestments = await Investment.countDocuments()
    const successRate = totalInvestments > 0
      ? Math.round((completedInvestments / totalInvestments) * 100)
      : 0

    res.json({
      success: true,
      data: {
        totalFunded: totalAmount,
        startupsFunded: fundedProjects,
        activeInvestors: investorCount,
        successRate,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/stats/admin — admin dashboard analytics (auth required)
router.get('/admin', protect, authorize('admin'), async (req, res) => {
  try {
    const [
      users,
      projects,
      investments,
      monthlyInvestments,
      categoryBreakdown,
      fundingTypeBreakdown,
      statusBreakdown,
    ] = await Promise.all([
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
      Project.countDocuments(),
      Investment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Investment.aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]),
      Project.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 }, totalGoal: { $sum: '$fundingGoal' }, totalRaised: { $sum: '$currentFunding' } } },
        { $sort: { count: -1 } },
      ]),
      Project.aggregate([
        { $group: { _id: '$fundingType', count: { $sum: 1 } } },
      ]),
      Project.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ])

    const usersByRole = {}
    users.forEach(u => { usersByRole[u._id] = u.count })

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyData = monthlyInvestments.map(m => ({
      label: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      amount: m.total,
      count: m.count,
    }))

    res.json({
      success: true,
      data: {
        usersByRole,
        totalProjects: projects,
        totalInvested: investments[0]?.total || 0,
        investmentCount: investments[0]?.count || 0,
        monthlyInvestments: monthlyData,
        categoryBreakdown,
        fundingTypeBreakdown,
        statusBreakdown,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
