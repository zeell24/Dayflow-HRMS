const { Attendance, Employee } = require('../models');

/**
 * Mark attendance for an employee
 * POST /api/attendance
 */
exports.markAttendance = async (req, res) => {
  try {
    const { employeeId, date, status, checkIn, checkOut, remarks } = req.body;

    // Use current date if not provided
    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0); // Set to start of day

    // Check if attendance already exists for this date
    const existing = await Attendance.findOne({
      employeeId,
      date: attendanceDate
    });

    if (existing) {
      // Update existing attendance
      if (status) existing.status = status;
      if (checkIn !== undefined) existing.checkIn = checkIn;
      if (checkOut !== undefined) existing.checkOut = checkOut;
      if (remarks !== undefined) existing.remarks = remarks;
      
      await existing.save();

      const populated = await Attendance.findById(existing._id)
        .populate('employeeId', 'name email department')
        .lean();

      return res.json({
        message: 'Attendance updated successfully',
        attendance: {
          ...populated,
          id: populated._id,
          employee: populated.employeeId
        }
      });
    }

    // Create new attendance record
    const attendance = await Attendance.create({
      employeeId,
      date: attendanceDate,
      status: status || 'present',
      checkIn,
      checkOut,
      remarks
    });

    const populated = await Attendance.findById(attendance._id)
      .populate('employeeId', 'name email department')
      .lean();

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance: {
        ...populated,
        id: populated._id,
        employee: populated.employeeId
      }
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Failed to mark attendance', error: error.message });
  }
};

/**
 * Get all attendance records with filters
 * GET /api/attendance
 */
exports.getAllAttendance = async (req, res) => {
  try {
    const { employeeId, startDate, endDate, status, page = 1, limit = 50 } = req.query;

    const query = {};

    if (employeeId) {
      query.employeeId = employeeId;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate) };
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [attendance, total] = await Promise.all([
      Attendance.find(query)
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .sort({ date: -1, createdAt: -1 })
        .populate('employeeId', 'name email department')
        .lean(),
      Attendance.countDocuments(query)
    ]);

    const formattedAttendance = attendance.map(att => ({
      ...att,
      id: att._id,
      employee: att.employeeId
    }));

    res.json({
      attendance: formattedAttendance,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Failed to fetch attendance', error: error.message });
  }
};

/**
 * Get attendance by ID
 * GET /api/attendance/:id
 */
exports.getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('employeeId', 'name email department')
      .lean();

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json({
      ...attendance,
      id: attendance._id,
      employee: attendance.employeeId
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Failed to fetch attendance', error: error.message });
  }
};

/**
 * Update attendance
 * PUT /api/attendance/:id
 */
exports.updateAttendance = async (req, res) => {
  try {
    const { status, checkIn, checkOut, remarks } = req.body;

    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    if (status) attendance.status = status;
    if (checkIn !== undefined) attendance.checkIn = checkIn;
    if (checkOut !== undefined) attendance.checkOut = checkOut;
    if (remarks !== undefined) attendance.remarks = remarks;

    await attendance.save();

    const populated = await Attendance.findById(attendance._id)
      .populate('employeeId', 'name email department')
      .lean();

    res.json({
      message: 'Attendance updated successfully',
      attendance: {
        ...populated,
        id: populated._id,
        employee: populated.employeeId
      }
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ message: 'Failed to update attendance', error: error.message });
  }
};

/**
 * Delete attendance
 * DELETE /api/attendance/:id
 */
exports.deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json({ message: 'Attendance deleted successfully' });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({ message: 'Failed to delete attendance', error: error.message });
  }
};

/**
 * Get attendance statistics/summary
 * GET /api/attendance/stats/summary
 */
exports.getAttendanceStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Default to current month if dates not provided
    const start = startDate 
      ? new Date(startDate) 
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate 
      ? new Date(endDate) 
      : new Date();

    const query = {
      date: {
        $gte: start,
        $lte: end
      }
    };

    // Total attendance records
    const totalRecords = await Attendance.countDocuments(query);

    // Count by status
    const byStatus = await Attendance.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Daily attendance count
    const dailyAttendance = await Attendance.aggregate([
      { $match: query },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      period: { 
        startDate: start.toISOString().split('T')[0], 
        endDate: end.toISOString().split('T')[0] 
      },
      totalRecords,
      byStatus: byStatus.map(s => ({
        status: s._id,
        count: s.count
      })),
      dailyAttendance: dailyAttendance.map(d => ({
        date: d._id,
        count: d.count
      }))
    });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({ message: 'Failed to fetch attendance statistics', error: error.message });
  }
};
