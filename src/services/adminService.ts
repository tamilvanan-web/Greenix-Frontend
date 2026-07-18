import api from './api';

const adminService = {
  // Get all users
  async getUsers() {
    const response = await api.get('/v1/admin/users');
    return response.data;
  },

  // Get all complaints
  async getComplaints() {
    const response = await api.get('/v1/admin/complaints');
    return response.data;
  },

  // Get complaint details
  async getComplaint(id: number) {
    const response = await api.get(`/v1/admin/complaints/${id}`);
    return response.data;
  },

  // Update complaint status
  async updateComplaintStatus(id: number, status: number) {
    const response = await api.put(
      `/v1/admin/complaints/${id}/status`,
      { status }
    );

    return response.data;
  }
};

export default adminService;