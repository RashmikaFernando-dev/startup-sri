const Project = require('../models/Project')
const User = require('../models/User')
const { sendProjectApprovalEmail } = require('../utils/emailService')

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

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    })
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
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      })
    }

    res.status(200).json({ success: true, data: project })
  } catch (error) {
    next(error)
  }
}

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Entrepreneur)
const createProject = async (req, res, next) => {
  try {
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

    await project.deleteOne()
    res.status(200).json({ success: true, data: {} })
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

    // Send email notification to the entrepreneur
    if (status === 'approved') {
      try {
        await sendProjectApprovalEmail(
          project.entrepreneur.email,
          project.title
        )
      } catch (emailErr) {
        console.error('Failed to send approval email:', emailErr.message)
      }
    }

    res.status(200).json({ success: true, data: project })
  } catch (error) {
    next(error)
  }
}

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject, updateProjectStatus }
