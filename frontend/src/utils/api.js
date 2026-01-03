/**
 * API Utility Module
 * Handles all API calls to the backend using axios
 */
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api', // Uses proxy from vite.config.js
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Auth API endpoints
 */
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me')
};

/**
 * Employee API endpoints
 */
export const employeeAPI = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  getStats: () => api.get('/employees/stats/overview')
};

/**
 * Attendance API endpoints
 */
export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', { params }),
  getById: (id) => api.get(`/attendance/${id}`),
  mark: (data) => api.post('/attendance', data),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  delete: (id) => api.delete(`/attendance/${id}`),
  getStats: (params) => api.get('/attendance/stats/summary', { params })
};

/**
 * Leave API endpoints
 */
export const leaveAPI = {
  getAll: (params) => api.get('/leave', { params }),
  getById: (id) => api.get(`/leave/${id}`),
  apply: (data) => api.post('/leave', data),
  approve: (id, data) => api.put(`/leave/${id}/approve`, data),
  update: (id, data) => api.put(`/leave/${id}`, data),
  cancel: (id) => api.delete(`/leave/${id}`),
  getStats: (params) => api.get('/leave/stats/summary', { params })
};

/**
 * Payroll API endpoints
 */
export const payrollAPI = {
  getAll: (params) => api.get('/payroll', { params }),
  getById: (id) => api.get(`/payroll/${id}`),
  getByEmployee: (employeeId, params) => api.get(`/payroll/employee/${employeeId}`, { params }),
  generate: (data) => api.post('/payroll', data),
  update: (id, data) => api.put(`/payroll/${id}`, data),
  delete: (id) => api.delete(`/payroll/${id}`),
  getStats: (params) => api.get('/payroll/stats/summary', { params })
};

export default api;

