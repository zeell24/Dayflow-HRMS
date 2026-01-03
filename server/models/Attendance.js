const mongoose = require('mongoose');

/**
 * Attendance Schema
 * Tracks employee attendance records
 */
const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half_day'],
    default: 'present'
  },
  checkIn: {
    type: String, // Store as string in HH:mm format
    default: null
  },
  checkOut: {
    type: String, // Store as string in HH:mm format
    default: null
  },
  remarks: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate attendance for same employee and date
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

// Indexes for better query performance
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ status: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
