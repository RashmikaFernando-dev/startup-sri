const express = require('express')
const { getLatestComments } = require('../controllers/projectController')

const router = express.Router()

router.get('/latest', getLatestComments)

module.exports = router