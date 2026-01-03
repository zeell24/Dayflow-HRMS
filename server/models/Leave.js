const mongoose = require('mongoose');

/**
 * Leave Schema
 * Manages employee leave requests
 */
const leaveSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee ID is required']
  },
  type: {
    type: String,
    enum: ['sick', 'casual', 'annual', 'emergency', 'other'],
    default: 'casual'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  days: {
    type: Number,
    required: [true, 'Number of days is required'],
    min: 1
  },
  reason: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },
  remarks: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
leaveSchema.index({ employeeId: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ type: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Leave', leaveSchema);
