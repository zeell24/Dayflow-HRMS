/**
 * Main App Component
 * Handles routing and authentication
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './utils/auth';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeManagement from './pages/EmployeeManagement';
import AttendanceManagement from './pages/AttendanceManagement';
import LeaveManagement from './pages/LeaveManagement';
import PayrollManagement from './pages/PayrollManagement';
import Layout from './components/Layout';

/**
 * Private Route Component
 * Protects routes that require authentication
 */
const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

/**
 * Public Route Component
 * Redirects authenticated users away from public pages (like login)
 */
const PublicRoute = ({ children }) => {
  return !isAuthenticated() ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

        {/* Protected Routes */}
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="employees" element={<EmployeeManagement />} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="leave" element={<LeaveManagement />} />
          <Route path="payroll" element={<PayrollManagement />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;

