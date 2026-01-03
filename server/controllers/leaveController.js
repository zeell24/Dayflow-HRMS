const { Leave, Employee, User } = require('../models');

/**
 * Calculate number of days between two dates
 */
const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end day
  return diffDays;
};

/**
 * Apply for leave
 * POST /api/leave
 */
exports.applyLeave = async (req, res) => {
  try {
    const { employeeId, type, startDate, endDate, reason } = req.body;

    // Validate dates
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Calculate number of days
    const days = calculateDays(startDate, endDate);

    const leave = await Leave.create({
      employeeId,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      days,
      reason,
      status: 'pending'
    });

    const leaveWithEmployee = await Leave.findById(leave._id)
      .populate('employeeId', 'name email department')
      .lean();

    res.status(201).json({
      message: 'Leave application submitted successfully',
      leave: {
        ...leaveWithEmployee,
        id: leaveWithEmployee._id,
        employee: leaveWithEmployee.employeeId
      }
    });
  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({ message: 'Failed to apply for leave', error: error.message });
  }
};

/**
 * Get all leave applications with filters
 * GET /api/leave
 */
exports.getAllLeaves = async (req, res) => {
  try {
    const { employeeId, status, type, startDate, endDate, page = 1, limit = 50 } = req.query;

    const query = {};

    if (employeeId) {
      query.employeeId = employeeId;
    }

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      query.$or = [
        {
          startDate: { $gte: start, $lte: end }
        },
        {
          endDate: { $gte: start, $lte: end }
        }
      ];
    }

    const skip = (page - 1) * limit;

    const [leaves, total] = await Promise.all([
      Leave.find(query)
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .sort({ createdAt: -1 })
        .populate('employeeId', 'name email department')
        .populate('approvedBy', 'name email')
        .lean(),
      Leave.countDocuments(query)
    ]);

    const formattedLeaves = leaves.map(leave => ({
      ...leave,
      id: leave._id,
      employee: leave.employeeId,
      approver: leave.approvedBy
    }));

    res.json({
      leaves: formattedLeaves,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({ message: 'Failed to fetch leaves', error: error.message });
  }
};

/**
 * Get leave by ID
 * GET /api/leave/:id
 */
exports.getLeaveById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employeeId', 'name email department')
      .populate('approvedBy', 'name email')
      .lean();

    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    res.json({
      ...leave,
      id: leave._id,
      employee: leave.employeeId,
      approver: leave.approvedBy
    });
  } catch (error) {
    console.error('Get leave error:', error);
    res.status(500).json({ message: 'Failed to fetch leave', error: error.message });
  }
};

/**
 * Approve or reject leave
 * PUT /api/leave/:id/approve
 */
exports.approveLeave = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const approverUserId = req.user.userId; // Get from authenticated user

    // Find approver user to get employee ID
    const approverUser = await User.findById(approverUserId);
    
    if (!approverUser || !approverUser.employeeId) {
      return res.status(404).json({ message: 'Approver not found' });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Leave application has already been processed' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be either approved or rejected' });
    }

    leave.status = status;
    leave.approvedBy = approverUser.employeeId;
    if (remarks) leave.remarks = remarks;

    await leave.save();

    const updatedLeave = await Leave.findById(leave._id)
      .populate('employeeId', 'name email department')
      .populate('approvedBy', 'name email')
      .lean();

    res.json({
      message: `Leave application ${status} successfully`,
      leave: {
        ...updatedLeave,
        id: updatedLeave._id,
        employee: updatedLeave.employeeId,
        approver: updatedLeave.approvedBy
      }
    });
  } catch (error) {
    console.error('Approve leave error:', error);
    res.status(500).json({ message: 'Failed to process leave application', error: error.message });
  }
};

/**
 * Update leave application (only if pending)
 * PUT /api/leave/:id
 */
exports.updateLeave = async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot update leave that has been processed' });
    }

    // Recalculate days if dates changed
    let days = leave.days;
    if (startDate && endDate) {
      if (new Date(endDate) < new Date(startDate)) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }
      days = calculateDays(startDate, endDate);
    } else if (startDate) {
      days = calculateDays(startDate, leave.endDate);
    } else if (endDate) {
      days = calculateDays(leave.startDate, endDate);
    }

    if (type) leave.type = type;
    if (startDate) leave.startDate = new Date(startDate);
    if (endDate) leave.endDate = new Date(endDate);
    if (reason !== undefined) leave.reason = reason;
    leave.days = days;

    await leave.save();

    res.json({
      message: 'Leave application updated successfully',
      leave: {
        ...leave.toObject(),
        id: leave._id
      }
    });
  } catch (error) {
    console.error('Update leave error:', error);
    res.status(500).json({ message: 'Failed to update leave', error: error.message });
  }
};

/**
 * Cancel leave application
 * DELETE /api/leave/:id
 */
exports.cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel pending leave applications' });
    }

    leave.status = 'cancelled';
    await leave.save();

    res.json({ message: 'Leave application cancelled successfully' });
  } catch (error) {
    console.error('Cancel leave error:', error);
    res.status(500).json({ message: 'Failed to cancel leave', error: error.message });
  }
};

/**
 * Get leave statistics
 * GET /api/leave/stats/summary
 */
exports.getLeaveStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Total leaves
    const totalLeaves = await Leave.countDocuments(query);

    // Count by status
    const byStatus = await Leave.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Count by type
    const byType = await Leave.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalLeaves,
      byStatus: byStatus.map(s => ({
        status: s._id,
        count: s.count
      })),
      byType: byType.map(t => ({
        type: t._id,
        count: t.count
      }))
    });
  } catch (error) {
    console.error('Get leave stats error:', error);
    res.status(500).json({ message: 'Failed to fetch leave statistics', error: error.message });
  }
};
