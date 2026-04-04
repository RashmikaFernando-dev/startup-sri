const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI

    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables')
    }

    const conn = await mongoose.connect(mongoUri)

    await mongoose.connection.db.admin().command({ ping: 1 })

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}

module.exports = connectDB
