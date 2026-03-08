import client from './apiClient';

export const authApi = {
  login: async (credentials) => {
    const response = await client.post('/auth/login', credentials);
    return response.data; // { token, id, name, email, role, school }
  },

  registerDonor: async (donorData) => {
    // donorData: { name, email, password }
    const response = await client.post('/auth/register/donor', donorData);
    return response.data;
  },

  verifyEmail: async (verificationData) => {
    // verificationData: { email, code }
    const response = await client.post('/auth/verify', verificationData);
    return response.data;
  },

  // Register other users (ZEO only) - reusing similar endpoint or same if generic
  registerUser: async (userData) => {
    // Admin creates user (ZEO -> Principal/Teacher)
    const response = await client.post('/auth/admin/create-user', userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await client.delete(`/auth/users/${userId}`);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await client.get('/auth/me');
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await client.put('/auth/change-password', passwordData);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await client.post('/auth/forgotpassword', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await client.put(`/auth/resetpassword/${token}`, { password });
    return response.data;
  },

  activateAccount: async (data) => {
    const response = await client.post('/auth/activate-account', data);
    return response.data;
  },
};
