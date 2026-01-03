const { Employee, User } = require('../models');

/**
 * Get all employees with optional search and filter
 * GET /api/employees
 */
exports.getAllEmployees = async (req, res) => {
  try {
    const { search, department, role, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    
    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by department
    if (department) {
      query.department = department;
    }
    
    // Filter by role
    if (role) {
      query.role = role;
    }

    const skip = (page - 1) * limit;

    const employees = await Employee.find(query)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ createdAt: -1 })
      .lean();

    const total = await Employee.countDocuments(query);

    // Get users for employees
    const employeeIds = employees.map(emp => emp._id);
    const users = await User.find({ 
      employeeId: { $in: employeeIds },
      isActive: true 
    }).select('email role isActive employeeId').lean();

    // Create a map of employeeId to user
    const userMap = {};
    users.forEach(user => {
      userMap[user.employeeId.toString()] = {
        id: user._id,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      };
    });

    // Format response to include user info
    const employeesWithUser = employees.map(emp => ({
      ...emp,
      id: emp._id,
      user: userMap[emp._id.toString()] || null
    }));

    res.json({
      employees: employeesWithUser,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Failed to fetch employees', error: error.message });
  }
};

/**
 * Get single employee by ID
 * GET /api/employees/:id
 */
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'email role isActive',
        model: User
      })
      .lean();

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      ...employee,
      id: employee._id
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'Failed to fetch employee', error: error.message });
  }
};

/**
 * Create new employee
 * POST /api/employees
 */
exports.createEmployee = async (req, res) => {
  try {
    const { name, email, phone, department, role, salary, joiningDate } = req.body;

    // Check if employee with email already exists
    const existing = await Employee.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Employee with this email already exists' });
    }

    const employee = await Employee.create({
      name,
      email,
      phone,
      department,
      role,
      salary: salary || 0,
      joiningDate: joiningDate || new Date()
    });

    res.status(201).json({
      message: 'Employee created successfully',
      employee: {
        ...employee.toObject(),
        id: employee._id
      }
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Failed to create employee', error: error.message });
  }
};

/**
 * Update employee
 * PUT /api/employees/:id
 */
exports.updateEmployee = async (req, res) => {
  try {
    const { name, email, phone, department, role, salary, joiningDate, isActive } = req.body;

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if email is being changed and already exists
    if (email && email !== employee.email) {
      const existing = await Employee.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: 'Employee with this email already exists' });
      }
    }

    // Update fields
    if (name) employee.name = name;
    if (email) employee.email = email;
    if (phone !== undefined) employee.phone = phone;
    if (department) employee.department = department;
    if (role) employee.role = role;
    if (salary !== undefined) employee.salary = salary;
    if (joiningDate) employee.joiningDate = joiningDate;
    if (isActive !== undefined) employee.isActive = isActive;

    await employee.save();

    res.json({
      message: 'Employee updated successfully',
      employee: {
        ...employee.toObject(),
        id: employee._id
      }
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Failed to update employee', error: error.message });
  }
};

/**
 * Delete employee
 * DELETE /api/employees/:id
 */
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Also delete associated user account if exists
    await User.findOneAndDelete({ employeeId: employee._id });

    await Employee.findByIdAndDelete(req.params.id);

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Failed to delete employee', error: error.message });
  }
};

/**
 * Get employee statistics
 * GET /api/employees/stats/overview
 */
exports.getEmployeeStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments({ isActive: true });
    
    // Get distinct departments
    const departments = await Employee.distinct('department', { isActive: true });
    const totalDepartments = departments.length;

    // Count by department
    const byDepartment = await Employee.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalEmployees,
      totalDepartments,
      byDepartment: byDepartment.map(d => ({
        department: d._id,
        count: d.count
      }))
    });
  } catch (error) {
    console.error('Get employee stats error:', error);
    res.status(500).json({ message: 'Failed to fetch employee statistics', error: error.message });
  }
};
