import { api, apiRequest } from './api';

const adminService = {
  // User management
  getAllUsers: async (params = {}) => {
    return await apiRequest('GET', '/admin/users', params);
  },

  getUserById: async (id) => {
    return await apiRequest('GET', `/admin/users/${id}`);
  },

  activateUser: async (id) => {
    return await apiRequest('PUT', `/admin/users/${id}/activate`);
  },

  deactivateUser: async (id) => {
    return await apiRequest('PUT', `/admin/users/${id}/deactivate`);
  },

  makeAdmin: async (id) => {
    return await apiRequest('PUT', `/admin/users/${id}/make-admin`);
  },

  removeAdmin: async (id) => {
    return await apiRequest('PUT', `/admin/users/${id}/remove-admin`);
  },

  deleteUser: async (id) => {
    return await apiRequest('DELETE', `/admin/users/${id}`);
  },

  // Dashboard statistics
  getDashboardStats: async () => {
    return await apiRequest('GET', '/admin/stats');
  },

  getSignalStats: async (params = {}) => {
    return await apiRequest('GET', '/admin/stats/signals', params);
  },

  getUserStats: async (params = {}) => {
    return await apiRequest('GET', '/admin/stats/users', params);
  },

  getNewsStats: async (params = {}) => {
    return await apiRequest('GET', '/admin/stats/news', params);
  },

  // Content management
  getAllSignalsAdmin: async (params = {}) => {
    return await apiRequest('GET', '/admin/content/signals', params);
  },

  getAllNewsAdmin: async (params = {}) => {
    return await apiRequest('GET', '/admin/content/news', params);
  },

  getAllChartDataAdmin: async (params = {}) => {
    return await apiRequest('GET', '/admin/content/charts', params);
  },

  // System management
  getSystemLogs: async () => {
    return await apiRequest('GET', '/admin/system/logs');
  },

  getSystemHealth: async () => {
    return await apiRequest('GET', '/admin/system/health');
  },

  createBackup: async () => {
    return await apiRequest('POST', '/admin/system/backup');
  },

  clearCache: async () => {
    return await apiRequest('POST', '/admin/system/clear-cache');
  },

  // Settings
  getSettings: async () => {
    return await apiRequest('GET', '/admin/settings');
  },

  updateSettings: async (settings) => {
    return await apiRequest('PUT', '/admin/settings', settings);
  },

  // Notifications
  broadcastNotification: async (notification) => {
    return await apiRequest('POST', '/admin/notifications/broadcast', notification);
  },

  getNotifications: async () => {
    return await apiRequest('GET', '/admin/notifications');
  },

  // AI Management
  getAISignals: async (params = {}) => {
    return await apiRequest('GET', '/admin/ai/signals', params);
  },

  generateAISignals: async (data) => {
    return await apiRequest('POST', '/admin/ai/generate-signals', data);
  },

  analyzeMarket: async (data) => {
    return await apiRequest('POST', '/admin/ai/analyze-market', data);
  },

  // Reports
  getActivityReport: async (params = {}) => {
    return await apiRequest('GET', '/admin/reports/activity', params);
  },

  getUserReport: async (params = {}) => {
    return await apiRequest('GET', '/admin/reports/users', params);
  },

  getSignalReport: async (params = {}) => {
    return await apiRequest('GET', '/admin/reports/signals', params);
  }
};

export { adminService };
