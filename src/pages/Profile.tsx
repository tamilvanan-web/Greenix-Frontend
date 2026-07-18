import React from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Building2 } from 'lucide-react';
import '../styles/global.css';
import '../styles/dashboards.css';

const Profile: React.FC = () => {
  const { user } = useAuth();

  const getDepartmentName = (id?: number) => {
    if (id === 1) return 'Roads & Highways';
    if (id === 2) return 'Sanitation & Waste';
    if (id === 3) return 'Water & Sewage';
    if (id === 4) return 'Electrical & Lighting';
    return 'General Municipal Administration';
  };

  return (
    <Layout>
      <div className="dashboard-header">
        <h1 className="dashboard-title">User Profile</h1>
        <p className="dashboard-subtitle">Manage your personal settings and credential contexts</p>
      </div>

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="profile-name">{user?.fullName}</h2>
            <p className="profile-role">Role: {user?.role}</p>
          </div>
        </div>

        <div className="profile-info-list">
          <div className="profile-info-row">
            <div className="profile-info-icon"><User size={19} /></div>
            <div>
              <div className="profile-info-label">Account ID</div>
              <div className="profile-info-value">{user?.id}</div>
            </div>
          </div>

          <div className="profile-info-row">
            <div className="profile-info-icon"><Mail size={19} /></div>
            <div>
              <div className="profile-info-label">Email address</div>
              <div className="profile-info-value">{user?.email}</div>
            </div>
          </div>

          <div className="profile-info-row">
            <div className="profile-info-icon"><Shield size={19} /></div>
            <div>
              <div className="profile-info-label">System access role</div>
              <div className="profile-info-value" style={{ textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>

          {(user?.role === 'GovernmentOfficer' || user?.role === 'FieldWorker') && (
            <div className="profile-info-row">
              <div className="profile-info-icon"><Building2 size={19} /></div>
              <div>
                <div className="profile-info-label">Assigned department</div>
                <div className="profile-info-value">{getDepartmentName(user.departmentId)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;