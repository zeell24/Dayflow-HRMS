const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * Leave Routes
 * Base path: /api/leave
 */

// Public stats (can be made protected if needed)
router.get('/stats/summary', leaveController.getLeaveStats);

// All leave routes require authentication
router.use(authenticate);

// Get all leave applications
router.get('/', leaveController.getAllLeaves);

// Get single leave application
router.get('/:id', leaveController.getLeaveById);

// Apply for leave
router.post('/', leaveController.applyLeave);

// Approve/reject leave (admin/manager only)
router.put('/:id/approve', authorize('admin', 'manager'), leaveController.approveLeave);

// Update leave (only if pending)
router.put('/:id', leaveController.updateLeave);

// Cancel leave
router.delete('/:id', leaveController.cancelLeave);

module.exports = router;

