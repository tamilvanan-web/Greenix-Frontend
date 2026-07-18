import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import complaintService from '../services/complaintService';
import type { UpdateStatusData } from '../services/complaintService';
import { Eye, Navigation, Upload, Briefcase, Play, CheckCircle, Clock } from 'lucide-react';
import '../styles/global.css';
import '../styles/components.css';
import '../styles/dashboards.css';

interface WorkerTask {
  id: number;
  complaintNumber: string;
  categoryName: string;
  status: string;
  priority: string;
  createdAt: string;
  distanceInKm?: number; // returned by localized query
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
}

const WorkerDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<WorkerTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLocalized, setIsLocalized] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  
  // Detail & Action State
  const [selectedTask, setSelectedTask] = useState<ComplaintDetail | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Transition form State
  const [comments, setComments] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await complaintService.getWorkerTasks();
      if (res.success) {
        setTasks(res.data);
        setIsLocalized(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasksLocalized = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setCoords({ lat, lon });
        
        try {
          // Trigger localized proximity search
          const res = await complaintService.getWorkerTasksLocalized(lat, lon);
          if (res.success) {
            setTasks(res.data);
            setIsLocalized(true);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      },
      () => {
        alert('Failed to retrieve location coordinates. Reverting to standard task feed.');
        fetchTasks();
      }
    );
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleViewDetails = async (id: number) => {
    setDetailLoading(true);
    setDetailModalOpen(true);
    setSelectedTask(null);
    setActionError('');
    setActionSuccess('');
    setComments('');
    setImageUrl('');
    setImageFile(null);

    try {
      const res = await complaintService.getComplaintById(id);
      if (res.success) {
        setSelectedTask(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setUploading(true);
      setActionError('');

      try {
        const res = await complaintService.uploadImage(file);
        if (res.success) {
          setImageUrl(res.data.imageUrl);
        } else {
          setActionError('Failed to upload image.');
        }
      } catch (err: any) {
        setActionError(err.response?.data?.errors?.[0] || 'Image upload error (5MB limit, JPG/PNG only).');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleUpdateStatus = async (targetStatus: number) => {
    if (!selectedTask) return;
    setActionError('');
    setActionSuccess('');

    // Enforce BR-02: Completion photograph required to resolve
    if (targetStatus === 4 && !imageUrl) { // 3 = Resolved
      setActionError('Validation failed. A completion photograph is mandatory to mark a complaint as resolved.');
      return;
    }

    setSubmitting(true);
    const data: UpdateStatusData = {
      status: targetStatus,
      comments: comments.trim() || undefined,
      imageUrl: imageUrl || undefined,
    };

    try {
      const res = await complaintService.updateStatus(selectedTask.id, data);
      if (res.success) {
        setActionSuccess('Status updated successfully!');
        setTimeout(async () => {
          setDetailModalOpen(false);
          if (isLocalized && coords) {
            // Re-fetch localized tasks
            const locRes = await complaintService.getWorkerTasksLocalized(coords.lat, coords.lon);
            if (locRes.success) setTasks(locRes.data);
          } else {
            fetchTasks();
          }
        }, 1500);
      } else {
        setActionError(res.errors?.[0] || 'Failed to update status.');
      }
    } catch (err: any) {
      setActionError(err.response?.data?.errors?.[0] || 'Failed to update status.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter(t => t.status === 'WorkInProgress').length;
  const assignedTasks = tasks.filter(t => t.status === 'Assigned').length;

  return (
    <Layout>
      <div className="flex-between dashboard-header">
        <div>
          <h1 className="dashboard-title">Worker Task Operations</h1>
          <p className="dashboard-subtitle">Manage assignments, locate tasks, and submit completion photographic evidence</p>
        </div>
        <div>
          {isLocalized ? (
            <button className="btn btn-secondary" onClick={fetchTasks}>
              Show All Assignments
            </button>
          ) : (
            <button className="btn btn-primary" onClick={fetchTasksLocalized}>
              <Navigation size={16} />
              Sort by Proximity
            </button>
          )}
        </div>
      </div>

      {/* Metric KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <Briefcase size={24} />
          </div>
          <div className="kpi-info">
            <h4>Total Assigned Tasks</h4>
            <div className="kpi-value">{totalTasks}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <Clock size={24} />
          </div>
          <div className="kpi-info">
            <h4>Assigned (Pending Start)</h4>
            <div className="kpi-value">{assignedTasks}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
            <Play size={24} />
          </div>
          <div className="kpi-info">
            <h4>Work In Progress</h4>
            <div className="kpi-value">{inProgressTasks}</div>
          </div>
        </div>
      </div>

      {/* Assigned list */}
      <div className="dashboard-section">
        <h2 className="section-title">My Assignment Feeds {isLocalized && '(Proximity Sorted)'}</h2>
        
        {loading ? (
          <div className="loading-wrapper">
            <div className="spinner"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            No active assignments found. Good job!
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Priority</th>
                  {isLocalized && <th>Distance</th>}
                  <th>Assigned Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.complaintNumber}</td>
                    <td>{t.categoryName}</td>
                    <td>
                      <span className={`badge badge-${t.status.toLowerCase()}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        fontWeight: 600, 
                        color: t.priority === 'High' ? '#ef4444' : t.priority === 'Medium' ? '#f59e0b' : '#64748b' 
                      }}>
                        {t.priority}
                      </span>
                    </td>
                    {isLocalized && (
                      <td style={{ fontWeight: 600, color: '#2563eb' }}>
                        {t.distanceInKm !== undefined ? `${t.distanceInKm} km` : 'Calculating...'}
                      </td>
                    )}
                    <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleViewDetails(t.id)}>
                        <Eye size={14} />
                        View Task
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action modal */}
      {detailModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 className="modal-title">Grievance Action Panel</h3>
            </div>

            {detailLoading ? (
              <div className="loading-wrapper">
                <div className="spinner"></div>
              </div>
            ) : selectedTask ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>TICKET NUMBER</div>
                    <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{selectedTask.complaintNumber}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textAlign: 'right' }}>STATUS</div>
                    <span className={`badge badge-${selectedTask.status.toLowerCase()}`}>{selectedTask.status}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>GPS COORDINATES</h4>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2563eb' }}>
                      Lat: {selectedTask.latitude}, Lon: {selectedTask.longitude}
                    </p>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>PRIORITY LEVEL</h4>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{selectedTask.priority}</p>
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>CITIZEN GRIEVANCE DESCRIPTION</h4>
                  <p style={{ fontSize: '0.9375rem' }}>{selectedTask.description}</p>
                </div>

                {selectedTask.images.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>ATTESTED ATTACHMENTS</h4>
                    <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                      {selectedTask.images.map((img, i) => (
                        <div key={i} style={{ flexShrink: 0 }}>
                          <img 
                            src={img.imageUrl.startsWith('http') ? img.imageUrl : `http://localhost:5000${img.imageUrl}`} 
                            alt={img.imageType} 
                            style={{ width: '140px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                          />
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', marginTop: '0.25rem', textTransform: 'capitalize' }}>
                            {img.imageType === 'Submission' ? 'Report Photo' : 'Completion Photo'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Operation forms: Start Work or Resolve Work */}
                {(selectedTask.status === 'Assigned' || selectedTask.status === 'WorkInProgress') && (
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: '#0f172a' }}>Update Work Progression</h4>

                    {actionError && (
                      <div className="auth-alert auth-alert-danger">
                        <span>{actionError}</span>
                      </div>
                    )}
                    {actionSuccess && (
                      <div className="auth-alert auth-alert-success">
                        <span>{actionSuccess}</span>
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label" htmlFor="comments">Progress Comments / Remarks</label>
                      <input
                        id="comments"
                        type="text"
                        className="form-control"
                        placeholder="e.g. Initiating patching work..."
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                      />
                    </div>

                    {selectedTask.status === 'WorkInProgress' && (
                      <div className="form-group">
                        <label className="form-label">Mandatory Work Completion Photo (BR-02)</label>
                        <div className="upload-zone" onClick={() => document.getElementById('workImageUpload')?.click()}>
                          <Upload className="upload-icon" size={24} style={{ margin: '0 auto 0.5rem' }} />
                          <div>{uploading ? 'Uploading Photo...' : imageFile ? imageFile.name : 'Click to upload completion photo (JPG/PNG)'}</div>
                          <input
                            id="workImageUpload"
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleImageChange}
                          />
                          {imageUrl && <img src={imageUrl} alt="Uploaded completion proof preview" className="upload-preview" />}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                      {selectedTask.status === 'Assigned' && (
                        <button 
                         onClick={() => handleUpdateStatus(3)} // 3 = WorkInProgress
                          className="btn btn-primary" 
                          style={{ flex: 1, display: 'flex', gap: '0.5rem', justifyContent: 'center' }}
                          disabled={submitting}
                        >
                          <Play size={16} />
                          Start Work (In Progress)
                        </button>
                      )}


                      {selectedTask.status === 'WorkInProgress' && (
  <button
    onClick={() => handleUpdateStatus(4)}
    className="btn btn-success"
    style={{
      flex: 1,
      display: 'flex',
      gap: '0.5rem',
      justifyContent: 'center'
    }}
    disabled={submitting || uploading || !imageUrl}
  >
    <CheckCircle size={16} />
    Complete Work (Mark Resolved)
  </button>
)}






                
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div style={{ marginBottom: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600, marginBottom: '1rem' }}>COMPLAINT HISTORY</h4>
                  <div className="timeline">
                    {selectedTask.statusHistories.map((history, index) => (
                      <div className="timeline-item" key={index}>
                        <div className="timeline-dot"></div>
                        <div className="timeline-header">
                          <span className="timeline-status" style={{ color: '#0f172a' }}>{history.status}</span>
                          <span className="timeline-time">{new Date(history.changedAt).toLocaleString()}</span>
                        </div>
                        <p className="timeline-comment">{history.comments}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Failed to load details.</div>
            )}

            <div className="modal-footer" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setDetailModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default WorkerDashboard;
