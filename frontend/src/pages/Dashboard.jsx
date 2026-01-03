/**
 * Dashboard Page Component
 * Shows overview statistics and charts
 */
import React, { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiClock, 
  FiCalendar, 
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown
} from 'react-icons/fi';
import { employeeAPI, attendanceAPI, leaveAPI, payrollAPI } from '../utils/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    employees: null,
    attendance: null,
    leaves: null,
    payroll: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [empRes, attRes, leaveRes, payrollRes] = await Promise.all([
        employeeAPI.getStats(),
        attendanceAPI.getStats(),
        leaveAPI.getStats(),
        payrollAPI.getStats()
      ]);

      setStats({
        employees: empRes.data,
        attendance: attRes.data,
        leaves: leaveRes.data,
        payroll: payrollRes.data
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const attendanceChartData = stats.attendance?.dailyAttendance || [];
  const leaveStatusData = stats.leaves?.byStatus || [];
  const attendanceStatusData = stats.attendance?.byStatus || [];

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  return (
    <div className="dashboard">
      <h2>Dashboard Overview</h2>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#dbeafe' }}>
            <FiUsers style={{ color: '#2563eb' }} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Employees</div>
            <div className="stat-value">{stats.employees?.totalEmployees || 0}</div>
            <div className="stat-subtitle">{stats.employees?.totalDepartments || 0} Departments</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#d1fae5' }}>
            <FiClock style={{ color: '#10b981' }} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Attendance Records</div>
            <div className="stat-value">{stats.attendance?.totalRecords || 0}</div>
            <div className="stat-subtitle">This Period</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7' }}>
            <FiCalendar style={{ color: '#f59e0b' }} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Leave Applications</div>
            <div className="stat-value">{stats.leaves?.totalLeaves || 0}</div>
            <div className="stat-subtitle">Total</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e0e7ff' }}>
            <FiDollarSign style={{ color: '#6366f1' }} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Payroll</div>
            <div className="stat-value">₹{(stats.payroll?.totalAmount || 0).toLocaleString()}</div>
            <div className="stat-subtitle">{stats.payroll?.totalPayrolls || 0} Records</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Attendance Chart */}
        <div className="chart-card">
          <h3>Daily Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#2563eb" name="Attendance Count" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Leave Status Pie Chart */}
        <div className="chart-card">
          <h3>Leave Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={leaveStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {leaveStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance Status Bar Chart */}
        <div className="chart-card">
          <h3>Attendance Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attendanceStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#2563eb" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Distribution */}
        {stats.employees?.byDepartment && stats.employees.byDepartment.length > 0 && (
          <div className="chart-card">
            <h3>Employees by Department</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.employees.byDepartment}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#10b981" name="Employees" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

