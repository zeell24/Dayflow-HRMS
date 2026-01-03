/**
 * Attendance Management Page Component
 * Handles marking and viewing attendance
 */
import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiX, FiCalendar } from 'react-icons/fi';
import { attendanceAPI, employeeAPI } from '../utils/api';
import { hasAnyRole } from '../utils/auth';
import './AttendanceManagement.css';

const AttendanceManagement = () => {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [filters, setFilters] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    status: ''
  });
  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    checkIn: '',
    checkOut: '',
    remarks: ''
  });

  const canEdit = hasAnyRole(['admin', 'manager']);

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
  }, [filters]);

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAll({ limit: 1000 });
      setEmployees(response.data.employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.employeeId) params.employeeId = filters.employeeId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.status) params.status = filters.status;

      const response = await attendanceAPI.getAll(params);
      setAttendance(response.data.attendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      alert('Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAttendance) {
        await attendanceAPI.update(editingAttendance.id, formData);
        alert('Attendance updated successfully');
      } else {
        await attendanceAPI.mark(formData);
        alert('Attendance marked successfully');
      }
      setShowModal(false);
      resetForm();
      fetchAttendance();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) return;

    try {
      await attendanceAPI.delete(id);
      alert('Attendance record deleted successfully');
      fetchAttendance();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete attendance');
    }
  };

  const handleEdit = (record) => {
    setEditingAttendance(record);
    setFormData({
      employeeId: record.employeeId,
      date: record.date,
      status: record.status,
      checkIn: record.checkIn || '',
      checkOut: record.checkOut || '',
      remarks: record.remarks || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      date: new Date().toISOString().split('T')[0],
      status: 'present',
      checkIn: '',
      checkOut: '',
      remarks: ''
    });
    setEditingAttendance(null);
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      present: 'badge-success',
      absent: 'badge-danger',
      late: 'badge-warning',
      half_day: 'badge-info'
    };
    return statusMap[status] || 'badge-secondary';
  };

  return (
    <div className="attendance-management">
      <div className="page-header">
        <h2>Attendance Management</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          <FiPlus /> Mark Attendance
        </button>
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
        <input
          type="date"
          className="form-input"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          placeholder="Start Date"
        />
        <input
          type="date"
          className="form-input"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          placeholder="End Date"
        />
        <select
          className="form-select"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
          <option value="half_day">Half Day</option>
        </select>
      </div>

      {/* Attendance Table */}
      {loading ? (
        <div className="loading">Loading attendance records...</div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Remarks</th>
                {canEdit && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 7 : 6} className="text-center">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                attendance.map(record => (
                  <tr key={record.id}>
                    <td>{record.employee?.name || '-'}</td>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(record.status)}`}>
                        {record.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>{record.checkIn || '-'}</td>
                    <td>{record.checkOut || '-'}</td>
                    <td>{record.remarks || '-'}</td>
                    {canEdit && (
                      <td>
                        <button
                          className="btn-icon"
                          onClick={() => handleEdit(record)}
                          title="Edit"
                        >
                          <FiEdit />
                        </button>
                        <button
                          className="btn-icon btn-danger"
                          onClick={() => handleDelete(record.id)}
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
              <h3>{editingAttendance ? 'Edit Attendance' : 'Mark Attendance'}</h3>
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
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status *</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    required
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="half_day">Half Day</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Check In</label>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.checkIn}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Check Out</label>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.checkOut}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Remarks</label>
                <textarea
                  className="form-input"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => { setShowModal(false); resetForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingAttendance ? 'Update' : 'Mark'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;

