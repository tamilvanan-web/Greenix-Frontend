import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import complaintService from '../services/complaintService';
import type { AssignWorkerData, UpdateStatusData } from '../services/complaintService';
import { Eye, UserCheck, ShieldAlert, Clock, CheckSquare } from 'lucide-react';
import '../styles/global.css';
import '../styles/components.css';
import '../styles/dashboards.css';

interface ComplaintItem {
  id: number;
  complaintNumber: string;
  categoryName: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
}

interface DetailHistoryItem {
  status: string;
  comments: string;
  changedById: string;
  changedAt: string;
}

interface ComplaintDetail {
  id: number;
  complaintNumber: string;
  categoryName: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  latitude: number;
  longitude: number;
  citizenName: string;
  images: Array<{ imageUrl: string; imageType: string }>;
  statusHistories: DetailHistoryItem[];
  hasFeedback: boolean;
}

const STATUS_META: Record<string, { cls: string; label: string }> = {
  submitted: { cls: 'badge-submitted', label: 'Submitted' },
  assigned: { cls: 'badge-assigned', label: 'Assigned' },
  workinprogress: { cls: 'badge-progress', label: 'Work In Progress' },
  inprogress: { cls: 'badge-progress', label: 'In Progress' },
  resolved: { cls: 'badge-resolved', label: 'Resolved' },
  closed: { cls: 'badge-closed', label: 'Closed' },
  rejected: { cls: 'badge-rejected', label: 'Rejected' },
  pendingreview: { cls: 'badge-review', label: 'Pending Review' },
  review: { cls: 'badge-review', label: 'Review' },
};

const getStatusMeta = (status: string) => {
  const key = status.toLowerCase().replace(/[\s_-]/g, '');
  return STATUS_META[key] || { cls: 'badge-closed', label: status };
};

const getPriorityClass = (priority: string) => {
  const key = priority.toLowerCase();
  if (key === 'critical') return 'priority-critical';
  if (key === 'high') return 'priority-high';
  if (key === 'medium') return 'priority-medium';
  return 'priority-low';
};

const getCategoryClass = (category: string) => {
  const key = category.toLowerCase();
  if (key.includes('road') || key.includes('highway')) return 'category-roads';
  if (key.includes('sanitation') || key.includes('waste')) return 'category-sanitation';
  if (key.includes('water') || key.includes('sewage')) return 'category-water';
  if (key.includes('electrical') || key.includes('lighting')) return 'category-electrical';
  return 'category-default';
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const meta = getStatusMeta(status);
  return <span className={`badge ${meta.cls}`}>{meta.label}</span>;
};

const OfficerDashboard: React.FC = () => {
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintDetail | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const [workerId, setWorkerId] = useState('');
  const [priority, setPriority] = useState('2');
  const [notes, setNotes] = useState('');
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');
  const [assigning, setAssigning] = useState(false);

  const [closeComments, setCloseComments] = useState('');
  const [closeError, setCloseError] = useState('');
  const [closeSuccess, setCloseSuccess] = useState('');
  const [closing, setClosing] = useState(false);

  const fetchQueue = async () => {
    try {
      const res = await complaintService.getOfficerQueue();
      if (res.success) {
        setComplaints(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleViewDetails = async (id: number) => {
    setDetailLoading(true);
    setDetailModalOpen(true);
    setSelectedComplaint(null);
    setAssignError('');
    setAssignSuccess('');
    setCloseError('');
    setCloseSuccess('');
    setWorkerId('');
    setNotes('');
    setCloseComments('');

    try {
      const res = await complaintService.getComplaintById(id);
      if (res.success) {
        setSelectedComplaint(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAssignWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssignError('');
    setAssignSuccess('');

    if (!selectedComplaint) return;
    if (!workerId.trim()) {
      setAssignError('Worker User ID is required.');
      return;
    }

    setAssigning(true);
    const data: AssignWorkerData = {
      workerId: workerId.trim(),
      priority: parseInt(priority),
      notes: notes.trim() || undefined,
    };

    try {
      const res = await complaintService.assignWorker(selectedComplaint.id, data);
      if (res.success) {
        setAssignSuccess('Worker assigned successfully!');
        setTimeout(async () => {
          const detailRes = await complaintService.getComplaintById(selectedComplaint.id);
          if (detailRes.success) setSelectedComplaint(detailRes.data);
          fetchQueue();
        }, 1500);
      } else {
        setAssignError(res.errors?.[0] || 'Assignment failed.');
      }
    } catch (err: any) {
      setAssignError(err.response?.data?.errors?.[0] || 'Assignment failed. Check if worker ID is valid and in your department.');
    } finally {
      setAssigning(false);
    }
  };

  const handleCloseTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setCloseError('');
    setCloseSuccess('');

    if (!selectedComplaint) return;
    setClosing(true);

    const data: UpdateStatusData = {
      status: 4,
      comments: closeComments.trim() || 'Complaint verified and closed by officer.',
    };

    try {
      const res = await complaintService.updateStatus(selectedComplaint.id, data);
      if (res.success) {
        setCloseSuccess('Complaint closed successfully!');
        setTimeout(() => {
          setDetailModalOpen(false);
          fetchQueue();
        }, 1500);
      } else {
        setCloseError(res.errors?.[0] || 'Failed to close complaint.');
      }
    } catch (err: any) {
      setCloseError(err.response?.data?.errors?.[0] || 'Failed to close complaint. Ensure it has been resolved first.');
    } finally {
      setClosing(false);
    }
  };

  const totalCount = complaints.length;
  const activeCount = complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed' && c.status !== 'Rejected').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <Layout>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Officer Triage Queue</h1>
        <p className="dashboard-subtitle">Assign work tasks, set priority levels, and close resolved grievances</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper tone-info">
            <ShieldAlert size={24} />
          </div>
          <div className="kpi-info">
            <h4>Total Department Tasks</h4>
            <div className="kpi-value">{totalCount}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper tone-warning">
            <Clock size={24} />
          </div>
          <div className="kpi-info">
            <h4>Active Grievances</h4>
            <div className="kpi-value">{activeCount}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper tone-success">
            <CheckSquare size={24} />
          </div>
          <div className="kpi-info">
            <h4>Resolved Pending Closure</h4>
            <div className="kpi-value">{resolvedCount}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2 className="section-title">Department Triage Queue</h2>

        {loading ? (
          <div className="loading-wrapper">
            <div className="spinner"></div>
          </div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            No complaints in queue for your department.
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Reported Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id}>
                    <td className="table-ticket-cell">{c.complaintNumber}</td>
                    <td>
                      <span className={`category-badge ${getCategoryClass(c.categoryName)}`}>
                        {c.categoryName}
                      </span>
                    </td>
                    <td
                      className={`table-desc-cell${!c.description ? ' is-empty' : ''}`}
                      title={c.description || undefined}
                    >
                      {c.description || 'No description provided'}
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td>
                      <span className={getPriorityClass(c.priority)}>
                        {c.priority}
                      </span>
                    </td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleViewDetails(c.id)}>
                        <Eye size={14} />
                        Triage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detailModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 className="modal-title">Grievance Triage Panel</h3>
            </div>

            {detailLoading ? (
              <div className="loading-wrapper">
                <div className="spinner"></div>
              </div>
            ) : selectedComplaint ? (
              <div>
                <div className="detail-summary-bar">
                  <div>
                    <div className="detail-label">Ticket number</div>
                    <div className="detail-value-lg">{selectedComplaint.complaintNumber}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="detail-label">Status</div>
                    <StatusBadge status={selectedComplaint.status} />
                  </div>
                </div>

                <div className="detail-grid-2">
                  <div>
                    <h4 className="detail-label">Citizen</h4>
                    <p className="detail-value">{selectedComplaint.citizenName}</p>
                  </div>
                  <div>
                    <h4 className="detail-label">GPS position</h4>
                    <p className="detail-value">Lat: {selectedComplaint.latitude}, Lon: {selectedComplaint.longitude}</p>
                  </div>
                </div>

                <div className="detail-block">
                  <h4 className="detail-label">Description</h4>
                  <p className="detail-value">{selectedComplaint.description || 'No description provided.'}</p>
                </div>

                {selectedComplaint.images.length > 0 && (
                  <div className="detail-block">
                    <h4 className="detail-label" style={{ marginBottom: '0.5rem' }}>Attachments</h4>
                    <div className="attachment-list">
                      {selectedComplaint.images.map((img, i) => (
                        <div key={i} className="attachment-item">
                          <img
                            src={img.imageUrl.startsWith('http') ? img.imageUrl : `http://localhost:5000${img.imageUrl}`}
                            alt={img.imageType}
                            className="attachment-thumb"
                          />
                          <div className="attachment-caption">
                            {img.imageType === 'Submission' ? 'Report Photo' : 'Completion Photo'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedComplaint.status === 'Submitted' || selectedComplaint.status === 'Assigned') && (
                  <div className="detail-section">
                    <h4 className="detail-section-title">
                      <UserCheck size={18} />
                      Assign Field Worker
                    </h4>

                    {assignError && (
                      <div className="alert-banner alert-danger">
                        <span>{assignError}</span>
                      </div>
                    )}
                    {assignSuccess && (
                      <div className="alert-banner alert-success">
                        <span>{assignSuccess}</span>
                      </div>
                    )}

                    <form onSubmit={handleAssignWorker}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="workerId">Worker User ID</label>
                        <input
                          id="workerId"
                          type="text"
                          className="form-control"
                          placeholder="Paste worker GUID (e.g. 5fca7821-...)"
                          value={workerId}
                          onChange={(e) => setWorkerId(e.target.value)}
                          required
                        />
                        <div className="form-hint">
                          Note: The worker must belong to your department (BR-05).
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="priority">Task Priority</label>
                        <select
                          id="priority"
                          className="form-control"
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                        >
                          <option value="1">Low</option>
                          <option value="2">Medium</option>
                          <option value="3">High</option>
                          <option value="4">Critical</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="notes">Assignment Instructions / Notes</label>
                        <input
                          id="notes"
                          type="text"
                          className="form-control"
                          placeholder="e.g. Dispatching for potholes repair..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={assigning}>
                        {assigning ? 'Assigning...' : 'Assign Field Crew'}
                      </button>
                    </form>
                  </div>
                )}

                {selectedComplaint.status === 'Resolved' && (
                  <div className="detail-section">
                    <h4 className="detail-section-title">
                      <CheckSquare size={18} />
                      Verify & Close Ticket
                    </h4>

                    {closeError && (
                      <div className="alert-banner alert-danger">
                        <span>{closeError}</span>
                      </div>
                    )}
                    {closeSuccess && (
                      <div className="alert-banner alert-success">
                        <span>{closeSuccess}</span>
                      </div>
                    )}

                    <form onSubmit={handleCloseTicket}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="closeComments">Closure Comments</label>
                        <textarea
                          id="closeComments"
                          className="form-control"
                          rows={2}
                          placeholder="Grievance verified resolved. Closing ticket..."
                          value={closeComments}
                          onChange={(e) => setCloseComments(e.target.value)}
                        />
                      </div>

                      <button type="submit" className="btn btn-success" style={{ width: '100%' }} disabled={closing}>
                        {closing ? 'Closing...' : 'Close Complaint'}
                      </button>
                    </form>
                  </div>
                )}

                <div className="detail-section">
                  <h4 className="detail-label" style={{ marginBottom: '1rem' }}>Complaint History</h4>
                  <div className="timeline">
                    {selectedComplaint.statusHistories.map((history, index) => (
                      <div className="timeline-item" key={index}>
                        <div className="timeline-dot"></div>
                        <div className="timeline-header">
                          <span className="timeline-status">{getStatusMeta(history.status).label}</span>
                          <span className="timeline-time">{new Date(history.changedAt).toLocaleString()}</span>
                        </div>
                        <p className="timeline-comment">{history.comments}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">Failed to load details.</div>
            )}

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setDetailModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default OfficerDashboard;