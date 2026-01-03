const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * Payroll Routes
 * Base path: /api/payroll
 */

// Public stats (can be made protected if needed)
router.get('/stats/summary', payrollController.getPayrollStats);

// All payroll routes require authentication
router.use(authenticate);

// Get all payroll records
router.get('/', payrollController.getAllPayroll);

// Get payroll by ID
router.get('/:id', payrollController.getPayrollById);

// Get employee's payroll history
router.get('/employee/:employeeId', payrollController.getEmployeePayroll);

// Generate payroll (admin/manager only)
router.post('/', authorize('admin', 'manager'), payrollController.generatePayroll);

// Update payroll (admin/manager only)
router.put('/:id', authorize('admin', 'manager'), payrollController.updatePayroll);

// Delete payroll (admin only)
router.delete('/:id', authorize('admin'), payrollController.deletePayroll);

module.exports = router;

