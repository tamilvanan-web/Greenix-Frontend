import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import complaintService from '../services/complaintService';
import type { CreateComplaintData } from '../services/complaintService';
import { Plus, MapPin, Upload, Clock, CheckCircle, HelpCircle, Eye } from 'lucide-react';
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

const CitizenDashboard: React.FC = () => {
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  
  // Submit Form State
  const [categoryId, setCategoryId] = useState('1');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Detail State
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // Feedback Form State
  const [rating, setRating] = useState(5);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  const fetchComplaints = async () => {
    try {
      const res = await complaintService.getCitizenHistory();
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
    fetchComplaints();
  }, []);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
        },
        () => {
          setFormError('Failed to access location services. Please input coordinates manually.');
        }
      );
    } else {
      setFormError('Geolocation is not supported by this browser.');
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setUploading(true);
      setFormError('');
      
      try {
        const res = await complaintService.uploadImage(file);
        if (res.success) {
          setImageUrl(res.data.imageUrl);
        } else {
          setFormError('Failed to upload image.');
        }
      } catch (err: any) {
        setFormError(err.response?.data?.errors?.[0] || 'Image upload error (5MB limit, JPG/PNG only).');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!latitude || !longitude) {
      setFormError('GPS coordinates are mandatory to verify municipal bounds.');
      return;
    }

    const data: CreateComplaintData = {
      categoryId: parseInt(categoryId),
      description,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      imageUrl: imageUrl || undefined,
    };

    try {
      const res = await complaintService.createComplaint(data);
      if (res.success) {
        setModalOpen(false);
        // Clear inputs
        setDescription('');
        setLatitude('');
        setLongitude('');
        setImageUrl('');
        setImageFile(null);
        fetchComplaints();
      } else {
        setFormError(res.errors?.[0] || 'Submission failed.');
      }
    } catch (err: any) {
      setFormError(err.response?.data?.errors?.[0] || 'Submission blocked. Coordinates might be outside municipal boundaries.');
    }
  };

  const handleViewDetails = async (id: number) => {
    setDetailLoading(true);
    setDetailModalOpen(true);
    setSelectedComplaint(null);
    setFeedbackError('');
    setFeedbackSuccess('');
    
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

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError('');
    setFeedbackSuccess('');

    if (!selectedComplaint) return;

    try {
      const res = await complaintService.submitFeedback(selectedComplaint.id, {
        rating,
        comments: feedbackComments,
      });

      if (res.success) {
        setFeedbackSuccess(res.message || 'Feedback submitted successfully.');
        setTimeout(() => {
          setDetailModalOpen(false);
          fetchComplaints();
        }, 1500);
      } else {
        setFeedbackError(res.errors?.[0] || 'Feedback submission failed.');
      }
    } catch (err: any) {
      setFeedbackError(err.response?.data?.errors?.[0] || 'Failed to submit feedback.');
    }
  };

  const totalCount = complaints.length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
  const pendingCount = totalCount - resolvedCount;

  return (
    <Layout>
      <div className="flex-between dashboard-header">
        <div>
          <h1 className="dashboard-title">Citizen Grievance Panel</h1>
          <p className="dashboard-subtitle">Report community issues, upload details, and rate resolution works</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          Report Grievance
        </button>
      </div>

      {/* Metric KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <HelpCircle size={24} />
          </div>
          <div className="kpi-info">
            <h4>Total Grievances</h4>
            <div className="kpi-value">{totalCount}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <Clock size={24} />
          </div>
          <div className="kpi-info">
            <h4>Pending Resolution</h4>
            <div className="kpi-value">{pendingCount}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
            <CheckCircle size={24} />
          </div>
          <div className="kpi-info">
            <h4>Resolved Grievances</h4>
            <div className="kpi-value">{resolvedCount}</div>
          </div>
        </div>
      </div>

      {/* Complaint Log Grid */}
      <div className="dashboard-section">
        <h2 className="section-title">My Filed Grievances</h2>
        
        {loading ? (
          <div className="loading-wrapper">
            <div className="spinner"></div>
          </div>
        ) : complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            No filed complaints found. Click the button above to report a grievance.
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
                    <td style={{ fontWeight: 600 }}>{c.complaintNumber}</td>
                    <td>{c.categoryName}</td>
                    <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.description}
                    </td>
                    <td>
                      <span className={`badge badge-${c.status.toLowerCase()}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        fontWeight: 600, 
                        color: c.priority === 'High' ? '#ef4444' : c.priority === 'Medium' ? '#f59e0b' : '#64748b' 
                      }}>
                        {c.priority}
                      </span>
                    </td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleViewDetails(c.id)}>
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report Grievance Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h3 className="modal-title">File Civic Grievance</h3>
            </div>
            
            {formError && (
              <div className="auth-alert auth-alert-danger">
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitComplaint}>
              <div className="form-group">
                <label className="form-label" htmlFor="categoryId">Category</label>
                <select
                  id="categoryId"
                  className="form-control"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="1">Roads & Highways (Potholes, repairs)</option>
                  <option value="2">Sanitation & Waste (Trash, cleaning)</option>
                  <option value="3">Water & Sewage (Pipe leaks, blockages)</option>
                  <option value="4">Electrical & Lighting (Streetlight issues)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Grievance Description</label>
                <textarea
                  id="description"
                  className="form-control"
                  rows={3}
                  placeholder="Provide details about the issue..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="latitude">Latitude</label>
                  <input
                    id="latitude"
                    type="number"
                    step="0.000001"
                    className="form-control"
                    placeholder="e.g. 13.082680"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="longitude">Longitude</label>
                  <input
                    id="longitude"
                    type="number"
                    step="0.000001"
                    className="form-control"
                    placeholder="e.g. 80.270718"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}
                onClick={handleGetCurrentLocation}
              >
                <MapPin size={16} />
                Get Current Coordinates (GPS)
              </button>

              <div className="form-group">
                <label className="form-label">Attach Photo Evidence</label>
                <div className="upload-zone" onClick={() => document.getElementById('imageUpload')?.click()}>
                  <Upload className="upload-icon" size={24} style={{ margin: '0 auto 0.5rem' }} />
                  <div>{uploading ? 'Uploading Photo...' : imageFile ? imageFile.name : 'Click to upload proof photo (JPG/PNG)'}</div>
                  <input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                  {imageUrl && <img src={imageUrl} alt="Uploaded evidence preview" className="upload-preview" />}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>Submit Complaint</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details & Timeline Modal */}
      {detailModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 className="modal-title">Grievance Details</h3>
            </div>

            {detailLoading ? (
              <div className="loading-wrapper">
                <div className="spinner"></div>
              </div>
            ) : selectedComplaint ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>TICKET NUMBER</div>
                    <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{selectedComplaint.complaintNumber}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textAlign: 'right' }}>STATUS</div>
                    <span className={`badge badge-${selectedComplaint.status.toLowerCase()}`}>{selectedComplaint.status}</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>DESCRIPTION</h4>
                  <p style={{ fontSize: '0.9375rem', whiteSpace: 'pre-line' }}>{selectedComplaint.description}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>GPS LOCATION</h4>
                    <p style={{ fontSize: '0.875rem' }}>Lat: {selectedComplaint.latitude}, Lon: {selectedComplaint.longitude}</p>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>REPORTED ON</h4>
                    <p style={{ fontSize: '0.875rem' }}>{new Date(selectedComplaint.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {/* Photo Evidence attachments panel */}
                {selectedComplaint.images.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>PHOTO EVIDENCE</h4>
                    <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                      {selectedComplaint.images.map((img, i) => (
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

                {/* Timeline Feed Section */}
                <div style={{ marginBottom: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600, marginBottom: '1rem' }}>LIFECYCLE TIMELINE</h4>
                  <div className="timeline">
                    {selectedComplaint.statusHistories.map((history, index) => (
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

                {/* Submit Feedback if Resolved and no feedback exists */}
                {selectedComplaint.status === 'Resolved' && !selectedComplaint.hasFeedback && (
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: '#0f172a' }}>Grievance Work Feedback</h4>
                    
                    {feedbackError && (
                      <div className="auth-alert auth-alert-danger">
                        <span>{feedbackError}</span>
                      </div>
                    )}
                    {feedbackSuccess && (
                      <div className="auth-alert auth-alert-success">
                        <span>{feedbackSuccess}</span>
                      </div>
                    )}

                    <form onSubmit={handleSubmitFeedback}>
                      <div className="form-group">
                        <label className="form-label">Work Rating</label>
                        <div className="star-rating">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`star ${star <= rating ? 'active' : ''}`}
                              onClick={() => setRating(star)}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        {rating <= 2 && (
                          <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 500, marginTop: '0.25rem' }}>
                            Note: Rating &lt;= 2 stars will automatically reopen this complaint for review.
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="feedbackComments">Feedback Review Comments</label>
                        <textarea
                          id="feedbackComments"
                          className="form-control"
                          rows={2}
                          placeholder="Tell us what you think about the resolution..."
                          value={feedbackComments}
                          onChange={(e) => setFeedbackComments(e.target.value)}
                        />
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Submit Feedback
                      </button>
                    </form>
                  </div>
                )}
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

export default CitizenDashboard;
