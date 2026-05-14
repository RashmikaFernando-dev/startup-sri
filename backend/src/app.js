const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const mongoSanitize = require('express-mongo-sanitize')
const rateLimit = require('express-rate-limit')

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
const notificationRoutes = require('./routes/notificationRoutes')
const auditLogRoutes = require('./routes/auditLogRoutes')
const { errorHandler } = require('./middleware/errorHandler')

const app = express()

app.use(helmet())
app.use(mongoSanitize())

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { success: false, message: 'Too many attempts from this IP, please try again after 15 minutes.' },
  skipSuccessfulRequests: true,
})

const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many payment requests, please try again later.' },
})

// Skip rate limiting in test environment so tests don't throttle themselves
if (process.env.NODE_ENV !== 'test') {
  app.use('/api/', generalLimiter)
  app.use('/api/auth/login', authLimiter)
  app.use('/api/auth/register', authLimiter)
  app.use('/api/auth/forgot-password', authLimiter)
  app.use('/api/payments/hash', paymentLimiter)
}

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000']

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')))
app.use(compression())

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
app.use('/api/notifications', notificationRoutes)
app.use('/api/audit-logs', auditLogRoutes)

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' })
})

app.use(errorHandler)

module.exports = app
