import { api, apiRequest } from './api';

const authService = {
  // Register user
  register: async (userData) => {
    return await apiRequest('POST', '/auth/register', userData);
  },

  // Login user
  login: async (email, password) => {
    return await apiRequest('POST', '/auth/login', { email, password });
  },

  // Logout user
  logout: async () => {
    return await apiRequest('POST', '/auth/logout');
  },

  // Forgot password
  forgotPassword: async (email) => {
    return await apiRequest('POST', '/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token, password) => {
    return await apiRequest('POST', `/auth/reset-password/${token}`, { password });
  },

  // Verify email
  verifyEmail: async (token) => {
    return await apiRequest('POST', `/auth/verify-email/${token}`);
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    return await apiRequest('POST', '/auth/refresh-token', { refreshToken });
  },

  // Get current user
  getMe: async () => {
    return await apiRequest('GET', '/auth/me');
  },

  // Update password
  updatePassword: async (currentPassword, newPassword) => {
    return await apiRequest('PUT', '/auth/update-password', { currentPassword, newPassword });
  },

  // Update profile
  updateProfile: async (profileData) => {
    return await apiRequest('PUT', '/auth/update-profile', profileData);
  },

  // Google authentication
  googleAuth: async (credential) => {
    return await apiRequest('POST', '/auth/google', { token: credential });
  },

  // Enable two-factor authentication
  enableTwoFactorAuth: async () => {
    return await apiRequest('POST', '/auth/enable-2fa');
  },

  // Verify two-factor authentication
  verifyTwoFactorAuth: async (code) => {
    return await apiRequest('POST', '/auth/verify-2fa', { code });
  },

  // Disable two-factor authentication
  disableTwoFactorAuth: async (code) => {
    return await apiRequest('POST', '/auth/disable-2fa', { code });
  }
};

export { authService };
