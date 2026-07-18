import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import adminService from '../services/adminService';

interface Complaint {
  id: number;
  complaintNumber: string;
  citizenName: string;
  departmentName: string;
  categoryName: string;
  priority: string;
  status: string;
  createdAt: string;
}

const AdminComplaints: React.FC = () => {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const loadComplaints = async () => {
  try {
    const response = await adminService.getComplaints();

    console.log("Complaints:", response);

    setComplaints(response);
  } catch (error) {
    console.error("Failed to load complaints:", error);
    setComplaints([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadComplaints();
  }, []);

  return (
    <Layout>
      <div className="dashboard-header">
        <h1>Complaint Management</h1>
        <p>View and manage all complaints.</p>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Complaint No</th>
              <th>Citizen</th>
              <th>Department</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {complaints.map((complaint) => (
              <tr key={complaint.id}>
                <td>{complaint.complaintNumber}</td>
                <td>{complaint.citizenName}</td>
                <td>{complaint.departmentName}</td>
                <td>{complaint.categoryName}</td>
                <td>{complaint.priority}</td>
                <td>{complaint.status}</td>
                <td>
                  {new Date(complaint.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      navigate(`/admin/complaints/${complaint.id}`)
                    }
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
};

export default AdminComplaints;