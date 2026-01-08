import api from './api';

const donationService = {
  createDonation: async (donationData) => {
    const response = await api.post('/donations', donationData);
    return response.data;
  },

  getDonations: async (page = 1, limit = 10, bloodType = '') => {
    const params = new URLSearchParams({ page, limit });
    if (bloodType) params.append('bloodType', bloodType);
    const response = await api.get(`/donations?${params}`);
    return response.data;
  },

  getMyDonations: async () => {
    const response = await api.get('/donations/my-donations');
    return response.data;
  },

  getDonationHistory: async (page = 1, limit = 10) => {
    const response = await api.get(`/donations/history?page=${page}&limit=${limit}`);
    return response.data;
  },

  getDonationById: async (id) => {
    const response = await api.get(`/donations/${id}`);
    return response.data;
  },

  deleteDonation: async (id) => {
    const response = await api.delete(`/donations/${id}`);
    return response.data;
  },

  fulfillDonation: async (id) => {
    const response = await api.post(`/donations/${id}/fulfill`);
    return response.data;
  },

  getReceiptData: async (id) => {
    const response = await api.get(`/donations/receipt/${id}`);
    return response.data;
  }
};

export default donationService;
