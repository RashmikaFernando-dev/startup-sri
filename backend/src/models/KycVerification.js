const mongoose = require('mongoose')

const kycVerificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one KYC record per user
    },
    // Personal details
    nic: {
      type: String,
      required: [true, 'NIC number is required'],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    // Document URLs (stored as base64 strings or file paths)
    nicFrontImage: {
      type: String,
      required: [true, 'NIC front image is required'],
    },
    nicBackImage: {
      type: String,
      required: [true, 'NIC back image is required'],
    },
    proofOfAddressImage: {
      type: String,
      required: [true, 'Proof of address is required'],
    },
    businessRegImage: {
      type: String,
      default: null,
    },
    // Review
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    submissionCount: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('KycVerification', kycVerificationSchema)
