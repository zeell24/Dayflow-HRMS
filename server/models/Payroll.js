const mongoose = require('mongoose');

/**
 * Payroll Schema
 * Manages employee payroll records
 */
const payrollSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee ID is required']
  },
  month: {
    type: Number,
    required: [true, 'Month is required'],
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: 2020,
    max: 2100
  },
  basicSalary: {
    type: Number,
    required: [true, 'Basic salary is required'],
    default: 0,
    min: 0
  },
  allowances: {
    type: Number,
    default: 0,
    min: 0
  },
  deductions: {
    type: Number,
    default: 0,
    min: 0
  },
  overtime: {
    type: Number,
    default: 0,
    min: 0
  },
  bonuses: {
    type: Number,
    default: 0,
    min: 0
  },
  netSalary: {
    type: Number,
    required: [true, 'Net salary is required'],
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'paid'],
    default: 'pending'
  },
  paymentDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate payroll for same employee, month, year
payrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

// Indexes for better query performance
payrollSchema.index({ month: 1, year: 1 });
payrollSchema.index({ status: 1 });

module.exports = mongoose.model('Payroll', payrollSchema);
