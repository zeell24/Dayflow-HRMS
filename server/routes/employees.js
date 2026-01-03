const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * Employee Routes
 * Base path: /api/employees
 */

// Public stats (can be made protected if needed)
router.get('/stats/overview', employeeController.getEmployeeStats);

// All employee routes require authentication
router.use(authenticate);

// Get all employees (search, filter, pagination)
router.get('/', employeeController.getAllEmployees);

// Get single employee
router.get('/:id', employeeController.getEmployeeById);

// Create employee (admin/manager only)
router.post('/', authorize('admin', 'manager'), employeeController.createEmployee);

// Update employee (admin/manager only)
router.put('/:id', authorize('admin', 'manager'), employeeController.updateEmployee);

// Delete employee (admin only)
router.delete('/:id', authorize('admin'), employeeController.deleteEmployee);

module.exports = router;

