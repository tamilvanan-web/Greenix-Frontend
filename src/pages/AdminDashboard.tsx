import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import complaintService from '../services/complaintService';
import type { ReportFilters } from '../services/complaintService';
import { Download, BarChart3, Activity, Clock } from 'lucide-react';
import '../styles/global.css';
import '../styles/components.css';
import '../styles/dashboards.css';

interface DashboardMetrics {
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  closedComplaints: number;
  averageResolutionTimeHours: number;
  averageRating: number;
  categoryCounts: Array<{ categoryName: string; count: number }>;
  statusCounts: Array<{ statusName: string; count: number }>;
  priorityCounts: Array<{ priorityName: string; count: number }>;
}

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // CSV Filter State
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  const fetchMetrics = async () => {
    try {
      const res = await complaintService.getDashboardSummary();
      if (res.success) {
        setMetrics({
    totalComplaints: res.data.totalComplaints ?? 0,
    pendingComplaints: res.data.pendingComplaints ?? 0,
    resolvedComplaints: res.data.resolvedComplaints ?? 0,
    closedComplaints: res.data.closedComplaints ?? 0,
    averageResolutionTimeHours: res.data.averageResolutionTimeHours ?? 0,
    averageRating: res.data.averageRating ?? 0,

    categoryCounts: res.data.categoryCounts ?? [],
    statusCounts: res.data.statusCounts ?? [],
    priorityCounts: res.data.priorityCounts ?? []
});
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleExportCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    setExportError('');
    setExporting(true);

    const filters: ReportFilters = {
      status: status ? parseInt(status) : undefined,
      priority: priority ? parseInt(priority) : undefined,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    try {
      const blob = await complaintService.exportCsvReport(filters);
      // Trigger browser file download
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Greenix_Audit_Report_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err: any) {
      setExportError('Failed to generate report export. Ensure backend server is running.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Layout>
      <div className="dashboard-header">
        <h1 className="dashboard-title">City Executive Analytics</h1>
        <p className="dashboard-subtitle">Monitor city-wide performance metrics, track resolution times, and export audit reports</p>
      </div>

      {loading ? (
        <div className="loading-wrapper">
          <div className="spinner"></div>
        </div>
      ) : metrics ? (
        <div>
          {/* Executive KPI Stats */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                <Activity size={24} />
              </div>
              <div className="kpi-info">
                <h4>City Total Grievances</h4>
                <div className="kpi-value">{metrics.totalComplaints}</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-wrapper" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
                <Clock size={24} />
              </div>
              <div className="kpi-info">
                <h4>Avg Resolution Speed</h4>
                <div className="kpi-value">
                  {metrics.averageResolutionTimeHours > 0 
                    ? `${metrics.averageResolutionTimeHours.toFixed(1)} hrs` 
                    : 'N/A'}
                </div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                <BarChart3 size={24} />
              </div>
              <div className="kpi-info">
                <h4>Avg Satisfaction Rating</h4>
                <div className="kpi-value">
                  {metrics.averageRating > 0 
                    ? `${metrics.averageRating.toFixed(1)} / 5.0` 
                    : 'No reviews'}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Category Statistics */}
            <div className="dashboard-section" style={{ marginBottom: 0 }}>
              <h2 className="section-title">Grievances by Category</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {metrics.categoryCounts.map((cat, i) => {
                  const percentage = metrics.totalComplaints > 0 ? (cat.count / metrics.totalComplaints) * 100 : 0;
                  return (
                    <div key={i}>
                      <div className="flex-between" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 500 }}>{cat.categoryName}</span>
                        <span style={{ color: '#64748b' }}>{cat.count} complaints</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${percentage}%`, height: '100%', background: '#2563eb', borderRadius: '4px' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Statistics */}
            <div className="dashboard-section" style={{ marginBottom: 0 }}>
              <h2 className="section-title">Grievances by Status</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {metrics.statusCounts.map((stat, i) => {
                  const percentage = metrics.totalComplaints > 0 ? (stat.count / metrics.totalComplaints) * 100 : 0;
                  return (
                    <div key={i}>
                      <div className="flex-between" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 500 }}>{stat.statusName}</span>
                        <span style={{ color: '#64748b' }}>{stat.count}</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${percentage}%`, height: '100%', background: '#10b981', borderRadius: '4px' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CSV Export Panel */}
          <div className="dashboard-section">
            <h2 className="section-title">
              <Download size={18} color="#2563eb" />
              Export Audit Reports
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Select audit filters below to export city complaints data as a CSV spreadsheet.
            </p>

            {exportError && (
              <div className="auth-alert auth-alert-danger">
                <span>{exportError}</span>
              </div>
            )}

            <form onSubmit={handleExportCsv} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', alignItems: 'end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="exportStatus">Status</label>
                <select id="exportStatus" className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">All Statuses</option>
                  <option value="0">Submitted</option>
                  <option value="1">Assigned</option>
                  <option value="2">Work In Progress</option>
                  <option value="3">Resolved</option>
                  <option value="4">Closed</option>
                  <option value="5">Rejected</option>
                  <option value="6">Under Review</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="exportPriority">Priority</label>
                <select id="exportPriority" className="form-control" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="">All Priorities</option>
                  <option value="0">Low</option>
                  <option value="1">Medium</option>
                  <option value="2">High</option>
                  <option value="3">Critical</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="exportCategory">Category</label>
                <select id="exportCategory" className="form-control" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">All Categories</option>
                  <option value="1">Roads & Highways</option>
                  <option value="2">Sanitation & Waste</option>
                  <option value="3">Water & Sewage</option>
                  <option value="4">Electrical & Lighting</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="exportStart">Start Date</label>
                <input
                  id="exportStart"
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="exportEnd">End Date</label>
                <input
                  id="exportEnd"
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }} disabled={exporting}>
                <Download size={16} />
                {exporting ? 'Exporting...' : 'Export CSV'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
          Failed to load analytics summaries.
        </div>
      )}
    </Layout>
  );
};

export default AdminDashboard;
