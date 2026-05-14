const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const connectDB = require('./config/database')
const app = require('./app')

const PORT = process.env.PORT || 5000

connectDB()

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})

module.exports = app
