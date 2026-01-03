/**
 * Leave Management Page Component
 * Handles leave applications and approvals
 */
import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiX, FiCheck, FiXCircle, FiCalendar } from 'react-icons/fi';
import { leaveAPI, employeeAPI } from '../utils/api';
import { hasAnyRole, getUser } from '../utils/auth';
import './LeaveManagement.css';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [filters, setFilters] = useState({
    employeeId: '',
    status: '',
    type: ''
  });
  const [formData, setFormData] = useState({
    employeeId: '',
    type: 'casual',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [approveData, setApproveData] = useState({
    status: 'approved',
    remarks: ''
  });

  const user = getUser();
  const canApprove = hasAnyRole(['admin', 'manager']);
  const isManager = hasAnyRole(['admin', 'manager']);

  useEffect(() => {
    fetchEmployees();
    fetchLeaves();
  }, [filters]);

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAll({ limit: 1000 });
      setEmployees(response.data.employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.employeeId) params.employeeId = filters.employeeId;
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;

      const response = await leaveAPI.getAll(params);
      setLeaves(response.data.leaves);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      alert('Failed to fetch leave applications');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await leaveAPI.apply(formData);
      alert('Leave application submitted successfully');
      setShowModal(false);
      resetForm();
      fetchLeaves();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit leave application');
    }
  };

  const handleApprove = async () => {
    try {
      await leaveAPI.approve(selectedLeave.id, approveData);
      alert(`Leave application ${approveData.status} successfully`);
      setShowApproveModal(false);
      setSelectedLeave(null);
      resetApproveForm();
      fetchLeaves();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to process leave application');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this leave application?')) return;

    try {
      await leaveAPI.cancel(id);
      alert('Leave application cancelled successfully');
      fetchLeaves();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel leave');
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: user?.employee?.id?.toString() || '',
      type: 'casual',
      startDate: '',
      endDate: '',
      reason: ''
    });
  };

  const resetApproveForm = () => {
    setApproveData({
      status: 'approved',
      remarks: ''
    });
  };

  const openApproveModal = (leave) => {
    setSelectedLeave(leave);
    setShowApproveModal(true);
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      pending: 'badge-warning',
      approved: 'badge-success',
      rejected: 'badge-danger',
      cancelled: 'badge-secondary'
    };
    return statusMap[status] || 'badge-secondary';
  };

  const getTypeBadgeClass = (type) => {
    return 'badge-info';
  };

  return (
    <div className="leave-management">
      <div className="page-header">
        <h2>Leave Management</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          <FiPlus /> Apply for Leave
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        {isManager && (
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
        )}
        <select
          className="form-select"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          className="form-select"
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="sick">Sick</option>
          <option value="casual">Casual</option>
          <option value="annual">Annual</option>
          <option value="emergency">Emergency</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Leaves Table */}
      {loading ? (
        <div className="loading">Loading leave applications...</div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    No leave applications found
                  </td>
                </tr>
              ) : (
                leaves.map(leave => (
                  <tr key={leave.id}>
                    <td>{leave.employee?.name || '-'}</td>
                    <td>
                      <span className={`badge ${getTypeBadgeClass(leave.type)}`}>
                        {leave.type.toUpperCase()}
                      </span>
                    </td>
                    <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                    <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                    <td>{leave.days}</td>
                    <td>{leave.reason || '-'}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(leave.status)}`}>
                        {leave.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {leave.status === 'pending' && canApprove && (
                        <button
                          className="btn-icon btn-success"
                          onClick={() => openApproveModal(leave)}
                          title="Approve/Reject"
                        >
                          <FiCheck />
                        </button>
                      )}
                      {leave.status === 'pending' && leave.employeeId === user?.employee?.id && (
                        <button
                          className="btn-icon btn-danger"
                          onClick={() => handleCancel(leave.id)}
                          title="Cancel"
                        >
                          <FiXCircle />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Apply for Leave</h3>
              <button className="btn-icon" onClick={() => { setShowModal(false); resetForm(); }}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              {isManager && (
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
              )}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Leave Type *</label>
                  <select
                    className="form-select"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="sick">Sick</option>
                    <option value="casual">Casual</option>
                    <option value="annual">Annual</option>
                    <option value="emergency">Emergency</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Days</label>
                  <input
                    type="text"
                    className="form-input"
                    value={
                      formData.startDate && formData.endDate
                        ? Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) + 1
                        : ''
                    }
                    disabled
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Reason</label>
                <textarea
                  className="form-input"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => { setShowModal(false); resetForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approve/Reject Modal */}
      {showApproveModal && selectedLeave && (
        <div className="modal-overlay" onClick={() => { setShowApproveModal(false); setSelectedLeave(null); resetApproveForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Process Leave Application</h3>
              <button className="btn-icon" onClick={() => { setShowApproveModal(false); setSelectedLeave(null); resetApproveForm(); }}>
                <FiX />
              </button>
            </div>
            <div className="leave-details">
              <p><strong>Employee:</strong> {selectedLeave.employee?.name}</p>
              <p><strong>Type:</strong> {selectedLeave.type}</p>
              <p><strong>Period:</strong> {new Date(selectedLeave.startDate).toLocaleDateString()} - {new Date(selectedLeave.endDate).toLocaleDateString()}</p>
              <p><strong>Days:</strong> {selectedLeave.days}</p>
              <p><strong>Reason:</strong> {selectedLeave.reason || '-'}</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleApprove(); }}>
              <div className="form-group">
                <label className="form-label">Decision *</label>
                <select
                  className="form-select"
                  value={approveData.status}
                  onChange={(e) => setApproveData({ ...approveData, status: e.target.value })}
                  required
                >
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Remarks</label>
                <textarea
                  className="form-input"
                  value={approveData.remarks}
                  onChange={(e) => setApproveData({ ...approveData, remarks: e.target.value })}
                  rows="3"
                  placeholder="Optional remarks..."
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => { setShowApproveModal(false); setSelectedLeave(null); resetApproveForm(); }}>
                  Cancel
                </button>
                <button type="submit" className={`btn ${approveData.status === 'approved' ? 'btn-success' : 'btn-danger'}`}>
                  {approveData.status === 'approved' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;

