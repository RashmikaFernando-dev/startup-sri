const mongoose = require('mongoose')

const auditLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'KYC_APPROVED',
        'KYC_REJECTED',
        'PROJECT_APPROVED',
        'PROJECT_REJECTED',
        'PROJECT_STATUS_CHANGED',
        'PROJECT_DELETED',
        'USER_SUSPENDED',
        'USER_REACTIVATED',
        'USER_ROLE_CHANGED',
      ],
    },
    targetType: {
      type: String,
      required: true,
      enum: ['KYC', 'Project', 'User'],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    // Human-readable label so the log is readable without extra DB lookups
    targetLabel: {
      type: String,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
)

// Index for fast admin queries by date range and action type
auditLogSchema.index({ createdAt: -1 })
auditLogSchema.index({ action: 1 })
auditLogSchema.index({ admin: 1 })

module.exports = mongoose.model('AuditLog', auditLogSchema)
