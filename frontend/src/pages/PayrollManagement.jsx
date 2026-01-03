/**
 * Payroll Management Page Component
 * Handles payroll generation and viewing
 */
import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiX, FiDollarSign } from 'react-icons/fi';
import { payrollAPI, employeeAPI } from '../utils/api';
import { hasAnyRole } from '../utils/auth';
import './PayrollManagement.css';

const PayrollManagement = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [filters, setFilters] = useState({
    employeeId: '',
    month: '',
    year: new Date().getFullYear().toString(),
    status: ''
  });
  const [formData, setFormData] = useState({
    employeeId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: '',
    allowances: 0,
    deductions: 0,
    overtime: 0,
    bonuses: 0
  });

  const canEdit = hasAnyRole(['admin', 'manager']);

  useEffect(() => {
    fetchEmployees();
    fetchPayrolls();
  }, [filters]);

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAll({ limit: 1000 });
      setEmployees(response.data.employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.employeeId) params.employeeId = filters.employeeId;
      if (filters.month) params.month = filters.month;
      if (filters.year) params.year = filters.year;
      if (filters.status) params.status = filters.status;

      const response = await payrollAPI.getAll(params);
      setPayrolls(response.data.payroll);
    } catch (error) {
      console.error('Error fetching payrolls:', error);
      alert('Failed to fetch payroll records');
    } finally {
      setLoading(false);
    }
  };

  const calculateNetSalary = () => {
    const basic = parseFloat(formData.basicSalary) || 0;
    const allowances = parseFloat(formData.allowances) || 0;
    const deductions = parseFloat(formData.deductions) || 0;
    const overtime = parseFloat(formData.overtime) || 0;
    const bonuses = parseFloat(formData.bonuses) || 0;
    return basic + allowances + overtime + bonuses - deductions;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        netSalary: calculateNetSalary()
      };

      if (editingPayroll) {
        await payrollAPI.update(editingPayroll.id, data);
        alert('Payroll updated successfully');
      } else {
        await payrollAPI.generate(data);
        alert('Payroll generated successfully');
      }
      setShowModal(false);
      resetForm();
      fetchPayrolls();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payroll record?')) return;

    try {
      await payrollAPI.delete(id);
      alert('Payroll record deleted successfully');
      fetchPayrolls();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete payroll');
    }
  };

  const handleEdit = (payroll) => {
    setEditingPayroll(payroll);
    setFormData({
      employeeId: payroll.employeeId,
      month: payroll.month,
      year: payroll.year,
      basicSalary: payroll.basicSalary,
      allowances: payroll.allowances,
      deductions: payroll.deductions,
      overtime: payroll.overtime,
      bonuses: payroll.bonuses
    });
    setShowModal(true);
  };

  const handleEmployeeSelect = (employeeId) => {
    const employee = employees.find(emp => emp.id === parseInt(employeeId));
    if (employee) {
      setFormData({
        ...formData,
        employeeId,
        basicSalary: employee.salary
      });
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      basicSalary: '',
      allowances: 0,
      deductions: 0,
      overtime: 0,
      bonuses: 0
    });
    setEditingPayroll(null);
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      pending: 'badge-warning',
      processed: 'badge-info',
      paid: 'badge-success'
    };
    return statusMap[status] || 'badge-secondary';
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="payroll-management">
      <div className="page-header">
        <h2>Payroll Management</h2>
        {canEdit && (
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
            <FiPlus /> Generate Payroll
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="filters-section">
        <select
          className="form-select"
          value={filters.employeeId}
          onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
        >
          <option value="">All Employees</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>
        <select
          className="form-select"
          value={filters.month}
          onChange={(e) => setFilters({ ...filters, month: e.target.value })}
        >
          <option value="">All Months</option>
          {months.map((month, index) => (
            <option key={index} value={index + 1}>{month}</option>
          ))}
        </select>
        <input
          type="number"
          className="form-input"
          value={filters.year}
          onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          placeholder="Year"
          min="2020"
          max="2100"
        />
        <select
          className="form-select"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="processed">Processed</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {/* Payroll Table */}
      {loading ? (
        <div className="loading">Loading payroll records...</div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Month/Year</th>
                <th>Basic Salary</th>
                <th>Allowances</th>
                <th>Deductions</th>
                <th>Overtime</th>
                <th>Bonuses</th>
                <th>Net Salary</th>
                <th>Status</th>
                {canEdit && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {payrolls.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 10 : 9} className="text-center">
                    No payroll records found
                  </td>
                </tr>
              ) : (
                payrolls.map(payroll => (
                  <tr key={payroll.id}>
                    <td>{payroll.employee?.name || '-'}</td>
                    <td>{months[payroll.month - 1]} {payroll.year}</td>
                    <td>₹{parseFloat(payroll.basicSalary).toLocaleString()}</td>
                    <td>₹{parseFloat(payroll.allowances).toLocaleString()}</td>
                    <td>₹{parseFloat(payroll.deductions).toLocaleString()}</td>
                    <td>₹{parseFloat(payroll.overtime).toLocaleString()}</td>
                    <td>₹{parseFloat(payroll.bonuses).toLocaleString()}</td>
                    <td><strong>₹{parseFloat(payroll.netSalary).toLocaleString()}</strong></td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(payroll.status)}`}>
                        {payroll.status.toUpperCase()}
                      </span>
                    </td>
                    {canEdit && (
                      <td>
                        <button
                          className="btn-icon"
                          onClick={() => handleEdit(payroll)}
                          title="Edit"
                        >
                          <FiEdit />
                        </button>
                        <button
                          className="btn-icon btn-danger"
                          onClick={() => handleDelete(payroll.id)}
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingPayroll ? 'Edit Payroll' : 'Generate Payroll'}</h3>
              <button className="btn-icon" onClick={() => { setShowModal(false); resetForm(); }}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Employee *</label>
                <select
                  className="form-select"
                  value={formData.employeeId}
                  onChange={(e) => handleEmployeeSelect(e.target.value)}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} - ₹{parseFloat(emp.salary).toLocaleString()}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Month *</label>
                  <select
                    className="form-select"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                    required
                  >
                    {months.map((month, index) => (
                      <option key={index} value={index + 1}>{month}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Year *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    required
                    min="2020"
                    max="2100"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Basic Salary *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={formData.basicSalary}
                    onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Allowances</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={formData.allowances}
                    onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Deductions</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={formData.deductions}
                    onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Overtime</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={formData.overtime}
                    onChange={(e) => setFormData({ ...formData, overtime: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Bonuses</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={formData.bonuses}
                  onChange={(e) => setFormData({ ...formData, bonuses: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Net Salary</label>
                <input
                  type="text"
                  className="form-input"
                  value={`₹${calculateNetSalary().toLocaleString()}`}
                  disabled
                  style={{ backgroundColor: '#f8fafc' }}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => { setShowModal(false); resetForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPayroll ? 'Update' : 'Generate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollManagement;

