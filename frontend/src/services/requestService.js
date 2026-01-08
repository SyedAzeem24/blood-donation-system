import api from './api';

const requestService = {
  createRequest: async (requestData) => {
    const response = await api.post('/requests', requestData);
    return response.data;
  },

  getRequests: async (page = 1, limit = 10, bloodType = '', requestType = '') => {
    const params = new URLSearchParams({ page, limit });
    if (bloodType) params.append('bloodType', bloodType);
    if (requestType) params.append('requestType', requestType);
    const response = await api.get(`/requests?${params}`);
    return response.data;
  },

  getMyRequests: async () => {
    const response = await api.get('/requests/my-requests');
    return response.data;
  },

  getRequestById: async (id) => {
    const response = await api.get(`/requests/${id}`);
    return response.data;
  },

  updateRequestStatus: async (id, status) => {
    const response = await api.put(`/requests/${id}/status`, { status });
    return response.data;
  },

  deleteRequest: async (id) => {
    const response = await api.delete(`/requests/${id}`);
    return response.data;
  }
};

export default requestService;
