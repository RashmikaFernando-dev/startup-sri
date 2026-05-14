const User = require('../models/User')
const Notification = require('../models/Notification')

/**
 * Creates an in-app notification for every admin user.
 * Fire-and-forget — never throws.
 */
async function notifyAdmins(message, type = 'info') {
  try {
    const admins = await User.find({ role: 'admin' }).select('_id').lean()
    if (!admins.length) return
    await Notification.insertMany(
      admins.map(a => ({ user: a._id, message, type }))
    )
  } catch (err) {
    console.error('notifyAdmins error:', err.message)
  }
}

module.exports = notifyAdmins
