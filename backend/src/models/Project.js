const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema(
  {
    entrepreneur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Software', 'Hardware', 'SaaS', 'Mobile App', 'Web Platform', 'AI/ML', 'Other'],
    },
    fundingType: {
      type: String,
      required: [true, 'Funding type is required'],
      enum: ['microloan', 'equity'],
    },
    fundingGoal: {
      type: Number,
      required: [true, 'Funding goal is required'],
      min: [100000, 'Minimum funding goal is LKR 100,000'],
      max: [5000000, 'Maximum funding goal is LKR 5,000,000'],
    },
    currentFunding: {
      type: Number,
      default: 0,
    },
    interestRate: {
      type: Number,
      min: 0,
      max: 30,
    },
    equityOffered: {
      type: Number,
      min: 0,
      max: 100,
    },
    duration: {
      type: Number,
      min: 1,
      max: 60,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'funded', 'active', 'completed'],
      default: 'pending',
    },
    documents: {
      businessPlan: String,
      financialProjections: String,
      productDemo: String,
    },
    milestones: [
      {
        title: String,
        description: String,
        amount: Number,
        completed: { type: Boolean, default: false },
      },
    ],
    investors: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        amount: Number,
        type: { type: String, enum: ['loan', 'equity'] },
        date: { type: Date, default: Date.now },
      },
    ],
    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
)

module.exports = mongoose.model('Project', projectSchema)
