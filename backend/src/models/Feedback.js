const mongoose = require('mongoose')

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: [true, 'Feedback text is required'],
      trim: true,
      maxlength: [1000, 'Feedback cannot exceed 1000 characters'],
    },
    role: {
      type: String,
      enum: ['investor', 'entrepreneur'],
      required: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Feedback', feedbackSchema)
