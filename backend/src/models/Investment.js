const mongoose = require('mongoose')

const investmentSchema = new mongoose.Schema(
  {
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Investment amount is required'],
      min: [25000, 'Minimum investment is LKR 25,000'],
    },
    type: {
      type: String,
      required: true,
      enum: ['loan', 'equity'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'refunded'],
      default: 'pending',
    },
    paymentIntentId: {
      type: String,
    },
    repaymentSchedule: [
      {
        dueDate: Date,
        amount: Number,
        status: {
          type: String,
          enum: ['pending', 'paid', 'overdue'],
          default: 'pending',
        },
        paidDate: Date,
      },
    ],
  },
  { timestamps: true }
)

module.exports = mongoose.model('Investment', investmentSchema)
