const express = require('express')
const dotenv = require('dotenv')
const path = require('path')
const cors = require('cors')

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const helmet = require('helmet')
const compression = require('compression')
const mongoSanitize = require('express-mongo-sanitize')
const rateLimit = require('express-rate-limit')
const connectDB = require('./config/database')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const projectRoutes = require('./routes/projectRoutes')
const investmentRoutes = require('./routes/investmentRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const adminRoutes = require('./routes/adminRoutes')
const kycRoutes = require('./routes/kycRoutes')
const commentRoutes = require('./routes/commentRoutes')
const feedbackRoutes = require('./routes/feedbackRoutes')
const uploadRoutes = require('./routes/uploadRoutes')
const statsRoutes = require('./routes/statsRoutes')
const { errorHandler } = require('./middleware/errorHandler')

const app = express()
const PORT = process.env.PORT || 5000

// Connect to Database
connectDB()

// Security Middleware
app.use(helmet())
app.use(mongoSanitize())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
})
app.use('/api/', limiter)

// CORS
app.use(
  cors({
    origin: ['http://localhost:3000'],
    credentials: true,
  })
)

// Body Parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Serve uploaded files
app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')))

// Compression
app.use(compression())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/investments', investmentRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/kyc', kycRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/feedback', feedbackRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/stats', statsRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' })
})

// Error Handler
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})

module.exports = app
