const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { protect } = require('../middleware/auth')

const router = express.Router()

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = path.basename(file.originalname, ext).replace(/\s+/g, '_')
    cb(null, `${name}_${Date.now()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.png', '.jpg', '.jpeg']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) cb(null, true)
    else cb(new Error('Only PDF, Word, PowerPoint and image files are allowed'))
  },
})

// POST /api/upload  — upload a single document
router.post('/', protect, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' })
  const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`
  res.status(200).json({ success: true, url: fileUrl, filename: req.file.originalname })
})

module.exports = router
