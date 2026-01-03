const mongoose = require('mongoose');

/**
 * Employee Schema
 * Stores employee information
 */
const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Employee name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    trim: true
  },
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
    default: 0,
    min: 0
  },
  joiningDate: {
    type: Date,
    required: [true, 'Joining date is required'],
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
employeeSchema.index({ email: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ isActive: 1 });

module.exports = mongoose.model('Employee', employeeSchema);
