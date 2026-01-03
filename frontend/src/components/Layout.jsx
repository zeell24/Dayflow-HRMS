/**
 * Layout Component
 * Main layout wrapper with sidebar navigation
 */
import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiClock, 
  FiCalendar, 
  FiDollarSign, 
  FiMenu, 
  FiX,
  FiLogOut,
  FiUser
} from 'react-icons/fi';
import { getUser, logout } from '../utils/auth';
import './Layout.css';

const Layout = () => {
  const location = useLocation();
  const user = getUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/employees', icon: FiUsers, label: 'Employees' },
    { path: '/attendance', icon: FiClock, label: 'Attendance' },
    { path: '/leave', icon: FiCalendar, label: 'Leave Management' },
    { path: '/payroll', icon: FiDollarSign, label: 'Payroll' }
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>HRMS</h2>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(false)}>
            <FiX />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <FiUser />
            <div>
              <div className="user-name">{user?.employee?.name || user?.email}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <button className="mobile-menu-toggle" onClick={() => setSidebarOpen(true)}>
            <FiMenu />
          </button>
          <h1>HRMS - Human Resource Management System</h1>
        </header>

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="overlay" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

export default Layout;

