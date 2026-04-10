const Project = require('../models/Project')
const User = require('../models/User')
const KycVerification = require('../models/KycVerification')
const Comment = require('../models/Comment')
const { sendProjectApprovalEmail, sendProjectRejectionEmail } = require('../utils/emailService')
const computeCreditScore = require('../utils/creditScore')

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res, next) => {
  try {
    const { status, category, fundingType } = req.query
    const filter = {}

    if (status) filter.status = status
    if (category) filter.category = category
    if (fundingType) filter.fundingType = fundingType

    const projects = await Project.find(filter)
      .populate('entrepreneur', 'firstName lastName email')
      .sort({ createdAt: -1 })

    // Batch-fetch KYC records and attach credit score to each project
    const entrepreneurIds = [...new Set(projects.map(p => p.entrepreneur?._id).filter(Boolean))]
    const kycList = await KycVerification.find({ user: { $in: entrepreneurIds } }).lean()
    const kycMap = Object.fromEntries(kycList.map(k => [k.user.toString(), k]))

    const data = projects.map(p => {
      const kyc = kycMap[p.entrepreneur?._id?.toString()]
      const { score, breakdown } = computeCreditScore(p, kyc)
      return { ...p.toObject(), creditScore: score, creditBreakdown: breakdown }
    })

    res.status(200).json({ success: true, count: data.length, data })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('entrepreneur', 'firstName lastName email phoneNumber')
      .populate('investors.user', 'firstName lastName')

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }

    const kyc = await KycVerification.findOne({ user: project.entrepreneur._id }).lean()
    const { score, breakdown } = computeCreditScore(project, kyc)
    const data = { ...project.toObject(), creditScore: score, creditBreakdown: breakdown }

    res.status(200).json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Entrepreneur)
const createProject = async (req, res, next) => {
  try {
    // Only admin can bypass KYC check
    if (req.user.role !== 'admin') {
      const kyc = await KycVerification.findOne({ user: req.user.id, status: 'approved' })
      if (!kyc) {
        return res.status(403).json({
          success: false,
          message: 'KYC verification required. Please complete identity verification before submitting a project.',
          kycRequired: true,
        })
      }
    }

    req.body.entrepreneur = req.user.id
    const project = await Project.create(req.body)
    res.status(201).json({ success: true, data: project })
  } catch (error) {
    next(error)
  }
}

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Entrepreneur/Admin)
const updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      })
    }

    if (
      project.entrepreneur.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project',
      })
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({ success: true, data: project })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Entrepreneur/Admin)
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      })
    }

    if (
      project.entrepreneur.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project',
      })
    }

    await Comment.deleteMany({ project: project._id })
    await project.deleteOne()
    res.status(200).json({ success: true, data: {} })
  } catch (error) {
    next(error)
  }
}

// @desc    Get comments for a project
// @route   GET /api/projects/:id/comments
// @access  Public
const getProjectComments = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      })
    }

    const comments = await Comment.find({ project: req.params.id })
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Add comment to a project
// @route   POST /api/projects/:id/comments
// @access  Private
const addProjectComment = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      })
    }

    const trimmedText = String(req.body.text || '').trim()

    if (!trimmedText) {
      return res.status(400).json({
        success: false,
        message: 'Comment cannot be empty',
      })
    }

    const userName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Anonymous User'

    const comment = await Comment.create({
      project: project._id,
      user: req.user._id,
      userName,
      text: trimmedText,
    })

    const populatedComment = await Comment.findById(comment._id).populate(
      'user',
      'firstName lastName'
    )

    res.status(201).json({ success: true, data: populatedComment })
  } catch (error) {
    next(error)
  }
}

// @desc    Get latest public comments
// @route   GET /api/comments/latest
// @access  Public
const getLatestComments = async (req, res, next) => {
  try {
    const comments = await Comment.aggregate([
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          as: 'projectData',
        },
      },
      {
        $unwind: '$projectData',
      },
      {
        $match: {
          'projectData.status': { $in: ['approved', 'active', 'completed', 'funded'] },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $limit: 6,
      },
      {
        $project: {
          _id: 1,
          text: 1,
          userName: 1,
          user: 1,
          project: 1,
          createdAt: 1,
        },
      },
    ])

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Approve or reject a project
// @route   PUT /api/projects/:id/status
// @access  Private (Admin)
const updateProjectStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body

    const allowed = ['approved', 'rejected', 'active', 'completed']
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowed.join(', ')}`,
      })
    }

    const project = await Project.findById(req.params.id).populate(
      'entrepreneur',
      'firstName lastName email'
    )

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }

    project.status = status
    if (status === 'rejected' && rejectionReason) {
      project.rejectionReason = rejectionReason
    }
    await project.save()

    if (status === 'approved') {
      try {
        await sendProjectApprovalEmail(project.entrepreneur.email, project.title)
      } catch (emailErr) {
        console.error('Failed to send approval email:', emailErr.message)
      }
    }
    if (status === 'rejected') {
      try {
        await sendProjectRejectionEmail(project.entrepreneur.email, project.title, rejectionReason)
      } catch (emailErr) {
        console.error('Failed to send rejection email:', emailErr.message)
      }
    }

    res.status(200).json({ success: true, data: project })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  updateProjectStatus,
  getProjectComments,
  addProjectComment,
  getLatestComments,
}
