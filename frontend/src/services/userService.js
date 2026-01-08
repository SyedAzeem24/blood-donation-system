import api from './api';

const userService = {
  checkEligibility: async () => {
    const response = await api.get('/users/eligibility');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  }
};

export default userService;
