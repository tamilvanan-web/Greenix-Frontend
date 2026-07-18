import api from './api';

export interface CreateComplaintData {
  categoryId: number;
  description: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
}

export interface UpdateStatusData {
  status: number;
  comments?: string;
  imageUrl?: string;
}

export interface AssignWorkerData {
  workerId: string;
  priority: number;
  notes?: string;
}

export interface FeedbackData {
  rating: number;
  comments?: string;
}

export interface ReportFilters {
  status?: number;
  priority?: number;
  categoryId?: number;
  startDate?: string;
  endDate?: string;
}

const complaintService = {
  // Submit Grievance (Citizen)
  async createComplaint(data: CreateComplaintData) {
    const res = await api.post('/v1/complaints', data);
    return res.data;
  },

  // Get Detail Summary (All roles, restricted by role constraints in controller)
  async getComplaintById(id: number) {
    const res = await api.get(`/v1/complaints/${id}`);
    return res.data;
  },

  // Get Citizen Grievance Logs
  async getCitizenHistory() {
    const res = await api.get('/v1/complaints/citizen');
    return res.data;
  },

  // Get Officer Triage queue
  async getOfficerQueue() {
    const res = await api.get('/v1/complaints/officer');
    return res.data;
  },

  // Get Worker Assignments
  async getWorkerTasks() {
    const res = await api.get('/v1/complaints/worker');
    return res.data;
  },

  // Get Worker Localized Tasks (Sorted by Proximity)
  async getWorkerTasksLocalized(lat: number, lon: number) {
    const res = await api.get(`/v1/complaints/worker/localized?latitude=${lat}&longitude=${lon}`);
    return res.data;
  },

  // Transition States (Worker / Officer)
  async updateStatus(id: number, data: UpdateStatusData) {
    const res = await api.put(`/v1/complaints/${id}/status`, data);
    return res.data;
  },

  // Assign Workers (Officer)
  async assignWorker(id: number, data: AssignWorkerData) {
    const res = await api.post(`/v1/complaints/${id}/assign`, data);
    return res.data;
  },

  // Submit Feedback & Rating reviews (Citizen)
  async submitFeedback(id: number, data: FeedbackData) {
    const res = await api.post(`/v1/complaints/${id}/feedback`, data);
    return res.data;
  },

  // Upload Photograph Proofs (Returns uploaded url)
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/v1/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // Fetch KPI dashboard summary aggregates
  async getDashboardSummary() {
    const res = await api.get('/v1/dashboard/summary');
    return res.data;
  },

  // Download filtered CSV Audit Reports
  async exportCsvReport(filters: ReportFilters) {
    const params = new URLSearchParams();
    if (filters.status !== undefined) params.append('status', filters.status.toString());
    if (filters.priority !== undefined) params.append('priority', filters.priority.toString());
    if (filters.categoryId !== undefined) params.append('categoryId', filters.categoryId.toString());
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const res = await api.get(`/v1/reports/export/csv?${params.toString()}`, {
      responseType: 'blob', // Download binary blob file
    });
    return res.data;
  },
};

export default complaintService;
