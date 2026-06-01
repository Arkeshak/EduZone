import client from './apiClient'; // Our custom Axios instance with auth headers

/**
 * AUTHENTICATION SERVICE
 * 
 * Purpose: Centralizes all API calls related to user accounts and identity.
 */
export const authApi = {
  // Logs the user in and returns JWT tokens
  login: async (credentials) => {
    const response = await client.post('/auth/login', credentials);
    return response.data;
  },

  // Creates a new donor account (unverified)
  registerDonor: async (donorData) => {
    const response = await client.post('/auth/register/donor', donorData);
    return response.data;
  },

  // Verifies the 6-digit email code from registration
  verifyEmail: async (verificationData) => {
    const response = await client.post('/auth/verify', verificationData);
    return response.data;
  },

  // Admin/ZEO only: Creates teacher or principal accounts
  registerUser: async (userData) => {
    const response = await client.post('/auth/admin/create-user', userData);
    return response.data;
  },

  // Admin/ZEO only: Deactivates or removes a user account
  deleteUser: async (userId) => {
    const response = await client.delete(`/auth/users/${userId}`);
    return response.data;
  },

  // Fetches current user profile from the token
  getCurrentUser: async () => {
    const response = await client.get('/auth/me');
    return response.data;
  },

  // Updates password for currently logged-in user
  changePassword: async (passwordData) => {
    const response = await client.put('/auth/change-password', passwordData);
    return response.data;
  },

  // Triggers password reset email to be sent
  forgotPassword: async (email) => {
    const response = await client.post('/auth/forgotpassword', { email });
    return response.data;
  },

  // Sets a new password using the token sent via email
  resetPassword: async (token, password) => {
    const response = await client.put(`/auth/resetpassword/${token}`, { password });
    return response.data;
  },

  // Finalizes account activation after OTP check
  activateAccount: async (data) => {
    const response = await client.post('/auth/activate-account', data);
    return response.data;
  },
};
