import api from './api';

const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getUsers: async (page = 1, limit = 10, role = '') => {
    const params = new URLSearchParams({ page, limit });
    if (role) params.append('role', role);
    const response = await api.get(`/admin/users?${params}`);
    return response.data;
  },

  getAllPosts: async (page = 1, limit = 10, type = '') => {
    const params = new URLSearchParams({ page, limit });
    if (type) params.append('type', type);
    const response = await api.get(`/admin/all-posts?${params}`);
    return response.data;
  },

  deletePost: async (type, id) => {
    const response = await api.delete(`/admin/post/${type}/${id}`);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/user/${id}`);
    return response.data;
  },

  updatePost: async (type, id, data) => {
    const response = await api.put(`/admin/post/${type}/${id}`, data);
    return response.data;
  }
};

export default adminService;
