-- Sample Data for HRMS Database
-- Insert sample employees, users, and related data for testing

USE hrms_db;

-- Insert sample employees
INSERT INTO employees (name, email, phone, department, role, salary, joiningDate) VALUES
('John Doe', 'john.doe@company.com', '123-456-7890', 'IT', 'Senior Developer', 75000.00, '2022-01-15'),
('Jane Smith', 'jane.smith@company.com', '123-456-7891', 'HR', 'HR Manager', 80000.00, '2021-06-01'),
('Mike Johnson', 'mike.johnson@company.com', '123-456-7892', 'IT', 'Developer', 60000.00, '2023-03-10'),
('Sarah Williams', 'sarah.williams@company.com', '123-456-7893', 'Finance', 'Accountant', 55000.00, '2022-09-20'),
('David Brown', 'david.brown@company.com', '123-456-7894', 'IT', 'Tech Lead', 90000.00, '2020-11-05'),
('Emily Davis', 'emily.davis@company.com', '123-456-7895', 'Marketing', 'Marketing Manager', 70000.00, '2022-04-12'),
('Robert Wilson', 'robert.wilson@company.com', '123-456-7896', 'IT', 'Developer', 62000.00, '2023-07-01'),
('Lisa Anderson', 'lisa.anderson@company.com', '123-456-7897', 'HR', 'HR Assistant', 45000.00, '2023-02-14');

-- Insert sample users (passwords are hashed versions of 'password123')
-- In production, these would be properly hashed with bcrypt
-- For testing: password = 'password123' (already hashed in the application)
-- Admin user
INSERT INTO users (email, password, role, employeeId, isActive) VALUES
('admin@company.com', '$2a$10$rOzJ8XvF5vWJ8qY8vF5vW.eJ8XvF5vWJ8qY8vF5vW.eJ8XvF5vWJ8q', 'admin', 
 (SELECT id FROM employees WHERE email = 'jane.smith@company.com'), TRUE);

-- Manager user
INSERT INTO users (email, password, role, employeeId, isActive) VALUES
('john.doe@company.com', '$2a$10$rOzJ8XvF5vWJ8qY8vF5vW.eJ8XvF5vWJ8qY8vF5vW.eJ8XvF5vWJ8q', 'manager',
 (SELECT id FROM employees WHERE email = 'john.doe@company.com'), TRUE);

-- Employee users (Note: In production, use proper bcrypt hashes)
INSERT INTO users (email, password, role, employeeId, isActive) VALUES
('mike.johnson@company.com', '$2a$10$rOzJ8XvF5vWJ8qY8vF5vW.eJ8XvF5vWJ8qY8vF5vW.eJ8XvF5vWJ8q', 'employee',
 (SELECT id FROM employees WHERE email = 'mike.johnson@company.com'), TRUE),
('sarah.williams@company.com', '$2a$10$rOzJ8XvF5vWJ8qY8vF5vW.eJ8XvF5vWJ8qY8vF5vW.eJ8XvF5vWJ8q', 'employee',
 (SELECT id FROM employees WHERE email = 'sarah.williams@company.com'), TRUE);

-- Insert sample attendance records (last 30 days for a few employees)
-- For John Doe (ID: 1)
INSERT INTO attendance (employeeId, date, status, checkIn, checkOut) VALUES
(1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'present', '09:00:00', '18:00:00'),
(1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'present', '09:15:00', '17:45:00'),
(1, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'late', '10:00:00', '18:30:00'),
(1, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'present', '09:00:00', '18:00:00'),
(1, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'present', '09:05:00', '17:50:00');

-- For Mike Johnson (ID: 3)
INSERT INTO attendance (employeeId, date, status, checkIn, checkOut) VALUES
(3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'present', '09:00:00', '18:00:00'),
(3, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'absent', NULL, NULL),
(3, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'present', '09:10:00', '18:00:00'),
(3, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'present', '09:00:00', '18:00:00'),
(3, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'half_day', '09:00:00', '13:00:00');

-- Insert sample leave applications
INSERT INTO leaves (employeeId, type, startDate, endDate, days, reason, status) VALUES
(3, 'sick', DATE_ADD(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 3, 'Medical appointment', 'pending'),
(4, 'casual', DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 12 DAY), 3, 'Personal work', 'pending'),
(1, 'annual', DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_SUB(CURDATE(), INTERVAL 5 DAY), 6, 'Vacation', 'approved'),
(3, 'casual', DATE_SUB(CURDATE(), INTERVAL 15 DAY), DATE_SUB(CURDATE(), INTERVAL 14 DAY), 2, 'Family event', 'approved');

-- Insert sample payroll records
INSERT INTO payroll (employeeId, month, year, basicSalary, allowances, deductions, overtime, bonuses, netSalary, status) VALUES
(1, MONTH(CURDATE()), YEAR(CURDATE()), 75000.00, 5000.00, 2000.00, 1000.00, 0, 79000.00, 'processed'),
(3, MONTH(CURDATE()), YEAR(CURDATE()), 60000.00, 3000.00, 1500.00, 500.00, 0, 62000.00, 'pending'),
(4, MONTH(CURDATE()), YEAR(CURDATE()), 55000.00, 2500.00, 1200.00, 0, 1000.00, 57300.00, 'processed'),
(1, MONTH(CURDATE()) - 1, YEAR(CURDATE()), 75000.00, 5000.00, 2000.00, 0, 2000.00, 80000.00, 'paid');

-- Note: 
-- - Default password for all users is 'password123' (should be hashed properly in production)
-- - Update the password hashes in production by registering users through the API
-- - Adjust dates as needed based on current date

