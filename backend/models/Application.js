const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'rejected'],
      default: 'applied',
    },
    coverLetter: {
      type: String,
      maxlength: [1000, 'Cover letter cannot exceed 1000 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

// Prevent duplicate applications
ApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
