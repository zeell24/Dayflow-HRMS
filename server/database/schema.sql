-- HRMS Database Schema
-- This file contains the SQL schema for the HRMS database
-- Run this script in MySQL to create the database and tables

-- Create database (uncomment if needed)
-- CREATE DATABASE IF NOT EXISTS hrms_db;
-- USE hrms_db;

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS payroll;
DROP TABLE IF EXISTS leaves;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS employees;

-- Create Employees table
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  department VARCHAR(50) NOT NULL,
  role VARCHAR(50) NOT NULL,
  salary DECIMAL(10, 2) NOT NULL DEFAULT 0,
  joiningDate DATE NOT NULL DEFAULT (CURRENT_DATE),
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_department (department),
  INDEX idx_isActive (isActive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Users table (for authentication)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'employee') NOT NULL DEFAULT 'employee',
  employeeId INT UNIQUE,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_email (email),
  INDEX idx_employeeId (employeeId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employeeId INT NOT NULL,
  date DATE NOT NULL DEFAULT (CURRENT_DATE),
  status ENUM('present', 'absent', 'late', 'half_day') NOT NULL DEFAULT 'present',
  checkIn TIME,
  checkOut TIME,
  remarks TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE KEY unique_employee_date (employeeId, date),
  INDEX idx_employeeId (employeeId),
  INDEX idx_date (date),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Leaves table
CREATE TABLE IF NOT EXISTS leaves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employeeId INT NOT NULL,
  type ENUM('sick', 'casual', 'annual', 'emergency', 'other') NOT NULL DEFAULT 'casual',
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  days INT NOT NULL,
  reason TEXT,
  status ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
  approvedBy INT,
  remarks TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (approvedBy) REFERENCES employees(id) ON DELETE SET NULL,
  INDEX idx_employeeId (employeeId),
  INDEX idx_status (status),
  INDEX idx_type (type),
  INDEX idx_dates (startDate, endDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Payroll table
CREATE TABLE IF NOT EXISTS payroll (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employeeId INT NOT NULL,
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  year INT NOT NULL,
  basicSalary DECIMAL(10, 2) NOT NULL DEFAULT 0,
  allowances DECIMAL(10, 2) DEFAULT 0,
  deductions DECIMAL(10, 2) DEFAULT 0,
  overtime DECIMAL(10, 2) DEFAULT 0,
  bonuses DECIMAL(10, 2) DEFAULT 0,
  netSalary DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status ENUM('pending', 'processed', 'paid') DEFAULT 'pending',
  paymentDate DATE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE KEY unique_employee_month_year (employeeId, month, year),
  INDEX idx_employeeId (employeeId),
  INDEX idx_month_year (month, year),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

