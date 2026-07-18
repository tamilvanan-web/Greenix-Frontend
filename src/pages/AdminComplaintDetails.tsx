import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import adminService from '../services/adminService';

interface Complaint {
  id: number;
  complaintNumber: string;
  citizenName: string;
  citizenEmail: string;
  departmentName: string;
  categoryName: string;
  description: string;
  priority: string;
  status: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}


const AdminComplaintDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [status, setStatus] = useState(0);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    loadComplaint();
  }, []);


  const loadComplaint = async () => {
  try {
    const response = await adminService.getComplaint(Number(id));

    console.log("Complaint Details:", response);

    setComplaint(response);
  } catch (err) {
    console.error("Failed to load complaint:", err);
    setComplaint(null);
  } finally {
    setLoading(false);
  }
};
    const updateStatus = async () => {
    try {
      await adminService.updateComplaintStatus(Number(id), status);

      alert('Complaint status updated successfully.');

      navigate('/admin/complaints');
    } catch (err) {
      alert('Failed to update complaint status.');
    }
  };

    if (loading) {
    return (
      <Layout>
        <h2>Loading...</h2>
      </Layout>
    );
  }

  if (!complaint) {
    return (
      <Layout>
        <h2>Complaint not found.</h2>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard-header">
        <h1>Complaint Details</h1>
      </div>

      <div className="dashboard-section">

        <p><strong>Complaint No:</strong> {complaint.complaintNumber}</p>

        <p><strong>Citizen:</strong> {complaint.citizenName}</p>

        <p><strong>Email:</strong> {complaint.citizenEmail}</p>

        <p><strong>Department:</strong> {complaint.departmentName}</p>

        <p><strong>Category:</strong> {complaint.categoryName}</p>

        <p><strong>Description:</strong> {complaint.description}</p>

        <p><strong>Priority:</strong> {complaint.priority}</p>

        <p><strong>Status:</strong> {complaint.status}</p>

        <p><strong>Latitude:</strong> {complaint.latitude}</p>

        <p><strong>Longitude:</strong> {complaint.longitude}</p>

        <p><strong>Created:</strong> {complaint.createdAt}</p>

        <hr />

        <h3>Update Status</h3>

        <select
          className="form-control"
          value={status}
          onChange={(e) => setStatus(Number(e.target.value))}
        >
          <option value={0}>Submitted</option>
          <option value={1}>Assigned</option>
          <option value={2}>Work In Progress</option>
          <option value={3}>Resolved</option>
          <option value={4}>Closed</option>
          <option value={5}>Rejected</option>
          <option value={6}>Under Review</option>
        </select>

        <br />

        <button
          className="btn btn-primary"
          onClick={updateStatus}
        >
          Update Status
        </button>

      </div>
    </Layout>
  );
};

export default AdminComplaintDetails;