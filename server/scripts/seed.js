/**
 * Seed Script - Creates default admin user
 * Run this once to create initial admin account
 * 
 * Usage: node scripts/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { User, Employee } = require('../models');
const path = require('path');

// Load .env from server directory
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hrms_db';

async function seed() {
  try {
    // Connect to MongoDB
    console.log('Attempting to connect to MongoDB...');
    console.log(`Connection string: ${MONGO_URI.replace(/:[^:@]+@/, ':****@')}`); // Hide password
    
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB successfully!');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@company.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@company.com');
      console.log('Password: password123');
      process.exit(0);
    }

    // Create admin employee
    const adminEmployee = await Employee.create({
      name: 'Admin User',
      email: 'admin@company.com',
      phone: '123-456-7890',
      department: 'IT',
      role: 'Administrator',
      salary: 100000,
      joiningDate: new Date()
    });

    // Create admin user account
    const adminUser = await User.create({
      email: 'admin@company.com',
      password: 'password123', // Will be hashed automatically
      role: 'admin',
      employeeId: adminEmployee._id,
      isActive: true
    });

    console.log('\n✅ Default admin user created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('   Email: admin@company.com');
    console.log('   Password: password123');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    console.log('\n');

    // Also create a manager and employee for testing
    const managerEmployee = await Employee.create({
      name: 'John Manager',
      email: 'manager@company.com',
      phone: '123-456-7891',
      department: 'HR',
      role: 'Manager',
      salary: 80000,
      joiningDate: new Date()
    });

    await User.create({
      email: 'manager@company.com',
      password: 'password123',
      role: 'manager',
      employeeId: managerEmployee._id,
      isActive: true
    });

    const employee = await Employee.create({
      name: 'Jane Employee',
      email: 'employee@company.com',
      phone: '123-456-7892',
      department: 'IT',
      role: 'Developer',
      salary: 60000,
      joiningDate: new Date()
    });

    await User.create({
      email: 'employee@company.com',
      password: 'password123',
      role: 'employee',
      employeeId: employee._id,
      isActive: true
    });

    console.log('✅ Test users created:');
    console.log('   Manager: manager@company.com / password123');
    console.log('   Employee: employee@company.com / password123');
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();

