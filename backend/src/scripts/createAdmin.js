/**
 * Run once to seed an admin user:
 *   node src/scripts/createAdmin.js
 */
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') })

const mongoose = require('mongoose')
const User = require('../models/User')

async function run() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')

  const existing = await User.findOne({ email: 'admin@startupsri.lk' })
  if (existing) {
    console.log('Admin already exists:', existing.email)
    process.exit(0)
  }

  const admin = await User.create({
    firstName: 'Admin',
    lastName: 'StarupSri',
    email: 'admin@startupsri.lk',
    password: 'Admin@1234',
    role: 'admin',
    isActive: true,
    isVerified: true,
  })

  console.log('✅ Admin user created:')
  console.log('   Email   :', admin.email)
  console.log('   Password: Admin@1234')
  console.log('   Role    :', admin.role)
  process.exit(0)
}

run().catch(err => { console.error(err); process.exit(1) })
