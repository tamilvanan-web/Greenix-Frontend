import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import adminService from '../services/adminService';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  complaintCount: number;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

const loadUsers = async () => {
  try {
    const response = await adminService.getUsers();

    console.log(response);

    setUsers(response);
  } catch (error) {
    console.error("Failed to load users:", error);
    setUsers([]);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <Layout>
      <div className="dashboard-header">
        <h1>User Management</h1>
        <p>Manage all Greenix users.</p>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Complaints</th>
            </tr>
          </thead>

          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.isActive ? 'Active' : 'Inactive'}</td>
                <td>{user.complaintCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
};

export default Users;