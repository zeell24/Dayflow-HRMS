const jwt = require('jsonwebtoken');
const { User, Employee } = require('../models');

/**
 * Generate JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Register a new user/employee
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { email, password, role, name, phone, department, salary, joiningDate } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create employee first
    const employee = await Employee.create({
      name,
      email,
      phone,
      department,
      role: role || 'employee',
      salary: salary || 0,
      joiningDate: joiningDate || new Date()
    });

    // Create user account
    const user = await User.create({
      email,
      password,
      role: role || 'employee',
      employeeId: employee._id
    });

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        employee: {
          id: employee._id,
          name: employee.name,
          department: employee.department
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user with employee details
    const user = await User.findOne({ email, isActive: true })
      .populate('employeeId', 'name email department role');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        employee: user.employeeId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('employeeId', 'name email phone department role salary joiningDate');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        employee: user.employeeId
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Failed to fetch user profile', error: error.message });
  }
};
