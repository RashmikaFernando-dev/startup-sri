const express = require('express')
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectComments,
  addProjectComment,
  getLatestComments,
} = require('../controllers/projectController')
const { protect, authorize } = require('../middleware/auth')

const router = express.Router()

router
  .route('/')
  .get(getProjects)
  .post(protect, authorize('entrepreneur', 'admin'), createProject)

router
  .route('/:id')
  .get(getProject)
  .put(protect, authorize('entrepreneur', 'admin'), updateProject)
  .delete(protect, authorize('entrepreneur', 'admin'), deleteProject)

router.route('/comments/latest').get(getLatestComments)

router.route('/:id/comments').get(getProjectComments).post(protect, addProjectComment)

module.exports = router
