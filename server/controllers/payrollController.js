const { Payroll, Employee } = require('../models');

/**
 * Generate or get payroll for an employee for a specific month/year
 * POST /api/payroll
 */
exports.generatePayroll = async (req, res) => {
  try {
    const { employeeId, month, year, basicSalary, allowances, deductions, overtime, bonuses } = req.body;

    // Validate month
    if (month < 1 || month > 12) {
      return res.status(400).json({ message: 'Month must be between 1 and 12' });
    }

    // Get employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if payroll already exists
    let payroll = await Payroll.findOne({
      employeeId,
      month,
      year: year || new Date().getFullYear()
    });

    const baseSalary = basicSalary || employee.salary || 0;
    const totalAllowances = allowances || 0;
    const totalDeductions = deductions || 0;
    const totalOvertime = overtime || 0;
    const totalBonuses = bonuses || 0;
    
    // Calculate net salary
    const netSalary = parseFloat(baseSalary) + 
                      parseFloat(totalAllowances) + 
                      parseFloat(totalOvertime) + 
                      parseFloat(totalBonuses) - 
                      parseFloat(totalDeductions);

    if (payroll) {
      // Update existing payroll
      payroll.basicSalary = baseSalary;
      payroll.allowances = totalAllowances;
      payroll.deductions = totalDeductions;
      payroll.overtime = totalOvertime;
      payroll.bonuses = totalBonuses;
      payroll.netSalary = netSalary;
      await payroll.save();
    } else {
      // Create new payroll
      payroll = await Payroll.create({
        employeeId,
        month,
        year: year || new Date().getFullYear(),
        basicSalary: baseSalary,
        allowances: totalAllowances,
        deductions: totalDeductions,
        overtime: totalOvertime,
        bonuses: totalBonuses,
        netSalary,
        status: 'pending'
      });
    }

    const payrollWithEmployee = await Payroll.findById(payroll._id)
      .populate('employeeId', 'name email department')
      .lean();

    res.status(201).json({
      message: 'Payroll generated successfully',
      payroll: {
        ...payrollWithEmployee,
        id: payrollWithEmployee._id,
        employee: payrollWithEmployee.employeeId
      }
    });
  } catch (error) {
    console.error('Generate payroll error:', error);
    res.status(500).json({ message: 'Failed to generate payroll', error: error.message });
  }
};

/**
 * Get all payroll records with filters
 * GET /api/payroll
 */
exports.getAllPayroll = async (req, res) => {
  try {
    const { employeeId, month, year, status, page = 1, limit = 50 } = req.query;

    const query = {};

    if (employeeId) {
      query.employeeId = employeeId;
    }

    if (month) {
      query.month = parseInt(month);
    }

    if (year) {
      query.year = parseInt(year);
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [payrolls, total] = await Promise.all([
      Payroll.find(query)
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .sort({ year: -1, month: -1 })
        .populate('employeeId', 'name email department')
        .lean(),
      Payroll.countDocuments(query)
    ]);

    const formattedPayrolls = payrolls.map(payroll => ({
      ...payroll,
      id: payroll._id,
      employee: payroll.employeeId
    }));

    res.json({
      payroll: formattedPayrolls,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get payroll error:', error);
    res.status(500).json({ message: 'Failed to fetch payroll', error: error.message });
  }
};

/**
 * Get payroll by ID
 * GET /api/payroll/:id
 */
exports.getPayrollById = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate('employeeId', 'name email department')
      .lean();

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    res.json({
      ...payroll,
      id: payroll._id,
      employee: payroll.employeeId
    });
  } catch (error) {
    console.error('Get payroll error:', error);
    res.status(500).json({ message: 'Failed to fetch payroll', error: error.message });
  }
};

/**
 * Update payroll
 * PUT /api/payroll/:id
 */
exports.updatePayroll = async (req, res) => {
  try {
    const { basicSalary, allowances, deductions, overtime, bonuses, status, paymentDate } = req.body;

    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    // Recalculate net salary if financial fields changed
    let netSalary = payroll.netSalary;
    if (basicSalary !== undefined || allowances !== undefined || deductions !== undefined || 
        overtime !== undefined || bonuses !== undefined) {
      const base = basicSalary !== undefined ? basicSalary : payroll.basicSalary;
      const allow = allowances !== undefined ? allowances : payroll.allowances;
      const deduct = deductions !== undefined ? deductions : payroll.deductions;
      const over = overtime !== undefined ? overtime : payroll.overtime;
      const bonus = bonuses !== undefined ? bonuses : payroll.bonuses;

      netSalary = parseFloat(base) + parseFloat(allow) + parseFloat(over) + parseFloat(bonus) - parseFloat(deduct);
    }

    if (basicSalary !== undefined) payroll.basicSalary = basicSalary;
    if (allowances !== undefined) payroll.allowances = allowances;
    if (deductions !== undefined) payroll.deductions = deductions;
    if (overtime !== undefined) payroll.overtime = overtime;
    if (bonuses !== undefined) payroll.bonuses = bonuses;
    payroll.netSalary = netSalary;
    if (status) payroll.status = status;
    if (paymentDate) payroll.paymentDate = new Date(paymentDate);

    await payroll.save();

    res.json({
      message: 'Payroll updated successfully',
      payroll: {
        ...payroll.toObject(),
        id: payroll._id
      }
    });
  } catch (error) {
    console.error('Update payroll error:', error);
    res.status(500).json({ message: 'Failed to update payroll', error: error.message });
  }
};

/**
 * Delete payroll
 * DELETE /api/payroll/:id
 */
exports.deletePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndDelete(req.params.id);
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    res.json({ message: 'Payroll deleted successfully' });
  } catch (error) {
    console.error('Delete payroll error:', error);
    res.status(500).json({ message: 'Failed to delete payroll', error: error.message });
  }
};

/**
 * Get employee's salary details
 * GET /api/payroll/employee/:employeeId
 */
exports.getEmployeePayroll = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { year } = req.query;

    const query = { employeeId };
    if (year) {
      query.year = parseInt(year);
    }

    const payrolls = await Payroll.find(query)
      .sort({ year: -1, month: -1 })
      .populate('employeeId', 'name email department')
      .lean();

    const formattedPayrolls = payrolls.map(payroll => ({
      ...payroll,
      id: payroll._id,
      employee: payroll.employeeId
    }));

    res.json(formattedPayrolls);
  } catch (error) {
    console.error('Get employee payroll error:', error);
    res.status(500).json({ message: 'Failed to fetch employee payroll', error: error.message });
  }
};

/**
 * Get payroll statistics
 * GET /api/payroll/stats/summary
 */
exports.getPayrollStats = async (req, res) => {
  try {
    const { year, month } = req.query;

    const query = {};
    if (year) {
      query.year = parseInt(year);
    }
    if (month) {
      query.month = parseInt(month);
    }

    const totalPayrolls = await Payroll.countDocuments(query);

    // Total payroll amount using aggregation
    const totalAmountResult = await Payroll.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: '$netSalary' }
        }
      }
    ]);

    const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].total : 0;

    // Count by status
    const byStatus = await Payroll.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalPayrolls,
      totalAmount: totalAmount || 0,
      byStatus: byStatus.map(s => ({
        status: s._id,
        count: s.count
      }))
    });
  } catch (error) {
    console.error('Get payroll stats error:', error);
    res.status(500).json({ message: 'Failed to fetch payroll statistics', error: error.message });
  }
};
