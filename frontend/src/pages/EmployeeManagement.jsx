/**
 * Employee Management Page Component
 * Handles CRUD operations for employees
 */
import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import { employeeAPI } from '../utils/api';
import { hasAnyRole } from '../utils/auth';
import './EmployeeManagement.css';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ department: '', role: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    salary: '',
    joiningDate: ''
  });

  const canEdit = hasAnyRole(['admin', 'manager']);

  useEffect(() => {
    fetchEmployees();
  }, [searchTerm, filters]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filters.department) params.department = filters.department;
      if (filters.role) params.role = filters.role;

      const response = await employeeAPI.getAll(params);
      setEmployees(response.data.employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      alert('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await employeeAPI.update(editingEmployee.id, formData);
        alert('Employee updated successfully');
      } else {
        await employeeAPI.create(formData);
        alert('Employee created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchEmployees();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    try {
      await employeeAPI.delete(id);
      alert('Employee deleted successfully');
      fetchEmployees();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete employee');
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone || '',
      department: employee.department,
      role: employee.role,
      salary: employee.salary,
      joiningDate: employee.joiningDate
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: '',
      role: '',
      salary: '',
      joiningDate: ''
    });
    setEditingEmployee(null);
  };

  const departments = [...new Set(employees.map(emp => emp.department))];
  const roles = [...new Set(employees.map(emp => emp.role))];

  return (
    <div className="employee-management">
      <div className="page-header">
        <h2>Employee Management</h2>
        {canEdit && (
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
            <FiPlus /> Add Employee
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="filters-section">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
          />
        </div>
        <select
          className="form-select"
          value={filters.department}
          onChange={(e) => setFilters({ ...filters, department: e.target.value })}
        >
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
        <select
          className="form-select"
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
        >
          <option value="">All Roles</option>
          {roles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      {/* Employees Table */}
      {loading ? (
        <div className="loading">Loading employees...</div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Department</th>
                <th>Role</th>
                <th>Salary</th>
                <th>Joining Date</th>
                {canEdit && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 8 : 7} className="text-center">
                    No employees found
                  </td>
                </tr>
              ) : (
                employees.map(employee => (
                  <tr key={employee.id}>
                    <td>{employee.name}</td>
                    <td>{employee.email}</td>
                    <td>{employee.phone || '-'}</td>
                    <td>{employee.department}</td>
                    <td>{employee.role}</td>
                    <td>₹{parseFloat(employee.salary).toLocaleString()}</td>
                    <td>{new Date(employee.joiningDate).toLocaleDateString()}</td>
                    {canEdit && (
                      <td>
                        <button
                          className="btn-icon"
                          onClick={() => handleEdit(employee)}
                          title="Edit"
                        >
                          <FiEdit />
                        </button>
                        <button
                          className="btn-icon btn-danger"
                          onClick={() => handleDelete(employee.id)}
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
              <h3>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h3>
              <button className="btn-icon" onClick={() => { setShowModal(false); resetForm(); }}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Salary *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Joining Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => { setShowModal(false); resetForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingEmployee ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;

