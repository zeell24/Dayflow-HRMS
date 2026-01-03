const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * Attendance Routes
 * Base path: /api/attendance
 */

// Public stats (can be made protected if needed)
router.get('/stats/summary', attendanceController.getAttendanceStats);

// All attendance routes require authentication
router.use(authenticate);

// Get all attendance records
router.get('/', attendanceController.getAllAttendance);

// Get single attendance record
router.get('/:id', attendanceController.getAttendanceById);

// Mark attendance (employees can mark their own, managers/admins can mark any)
router.post('/', attendanceController.markAttendance);

// Update attendance (admin/manager only)
router.put('/:id', authorize('admin', 'manager'), attendanceController.updateAttendance);

// Delete attendance (admin only)
router.delete('/:id', authorize('admin'), attendanceController.deleteAttendance);

module.exports = router;

