import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  User,
  LogOut,
  Leaf,
  Activity
} from 'lucide-react';

import '../styles/global.css';
import '../styles/components.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/login');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const getDashboardPath = () => {
    if (!user) return '/login';

    switch (user.role) {
      case 'Administrator':
        return '/admin';
      case 'GovernmentOfficer':
        return '/officer';
      case 'FieldWorker':
        return '/worker';
      default:
        return '/citizen';
    }
  };

  return (
    <>
      <div className="layout-container">

        {/* Sidebar */}
        <aside className="sidebar">

          <div className="sidebar-logo">
            <Leaf size={24} color="#7fd8a0" strokeWidth={2.2} />
            <span>Greenix</span>
          </div>

          <nav style={{ flex: 1 }}>
            <ul className="sidebar-menu">

              {/* Dashboard */}
              <li className="sidebar-item">
                <NavLink
                  to={getDashboardPath()}
                  className={({ isActive }) =>
                    isActive ? 'active' : ''
                  }
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </NavLink>
              </li>

              {/* Administrator Menu */}
              {user?.role === 'Administrator' && (
                <>
                  <li className="sidebar-item">
                    <NavLink
                      to="/admin/complaints"
                      className={({ isActive }) =>
                        isActive ? 'active' : ''
                      }
                    >
                      <Activity size={18} />
                      <span>Complaints</span>
                    </NavLink>
                  </li>

                  <li className="sidebar-item">
                    <NavLink
                      to="/admin/users"
                      className={({ isActive }) =>
                        isActive ? 'active' : ''
                      }
                    >
                      <User size={18} />
                      <span>Users</span>
                    </NavLink>
                  </li>
                </>
              )}

              {/* Profile */}
              <li className="sidebar-item">
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    isActive ? 'active' : ''
                  }
                >
                  <User size={18} />
                  <span>My Profile</span>
                </NavLink>
              </li>

            </ul>
          </nav>

          {/* Footer */}
          <div className="sidebar-footer">

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}
            >
              <div className="avatar-circle">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>

              <div style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}
                >
                  {user?.fullName}
                </div>

                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#9fb6a8'
                  }}
                >
                  {user?.role === 'GovernmentOfficer'
                    ? 'Officer'
                    : user?.role === 'FieldWorker'
                    ? 'Worker'
                    : user?.role}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <LogOut size={16} />
              Logout
            </button>

          </div>

        </aside>

        {/* Main Content */}
        <main className="main-content">
          {children}
        </main>

      </div>

      {/* Logout Confirmation */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <h2 className="modal-title">Confirm logout</h2>

            <p
              style={{
                marginTop: '15px',
                marginBottom: '25px',
                color: 'var(--text-secondary)'
              }}
            >
              Are you sure you want to log out?
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '15px'
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={cancelLogout}
              >
                No
              </button>

              <button
                className="btn btn-primary"
                onClick={confirmLogout}
              >
                Yes, logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Layout;