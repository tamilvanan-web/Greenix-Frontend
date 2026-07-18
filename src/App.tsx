import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

import CitizenDashboard from './pages/CitizenDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import WorkerDashboard from './pages/WorkerDashboard';

import AdminDashboard from './pages/AdminDashboard';
import AdminComplaints from './pages/AdminComplaints';
import Users from './pages/Users';

import './index.css';
import AdminComplaintDetails from './pages/AdminComplaintDetails';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Citizen Routes */}
          <Route
            path="/citizen"
            element={
              <ProtectedRoute allowedRoles={['Citizen']}>
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />

          {/* Government Officer Routes */}
          <Route
            path="/officer"
            element={
              <ProtectedRoute allowedRoles={['GovernmentOfficer']}>
                <OfficerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Field Worker Routes */}
          <Route
            path="/worker"
            element={
              <ProtectedRoute allowedRoles={['FieldWorker']}>
                <WorkerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Administrator Dashboard */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['Administrator']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Administrator Complaints */}
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute allowedRoles={['Administrator']}>
                <AdminComplaints />
              </ProtectedRoute>
            }
          />

          {/* Administrator Users */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['Administrator']}>
                <Users />
              </ProtectedRoute>
            }
          />

          {/* Shared Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
  path="/admin/complaints/:id"
  element={
    <ProtectedRoute allowedRoles={['Administrator']}>
      <AdminComplaintDetails />
    </ProtectedRoute>
  }
/>

          {/* Default Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;