/**
 * Shared test setup — runs before every test file.
 *
 * What it does:
 *  1. Starts a temporary MongoDB server in memory (not your real database)
 *  2. Connects Mongoose to it
 *  3. After each individual test, wipes all collections so tests don't affect each other
 *  4. After all tests finish, disconnects and stops the in-memory server
 */

const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test_jwt_secret_key'
process.env.JWT_EXPIRE = '1d'

let mongoServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  await mongoose.connect(uri)
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

afterEach(async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
})
