import { api, apiRequest } from './api';

const alertService = {
  // Get all alerts
  getAllAlerts: async (headers = {}) => {
    return await apiRequest('GET', '/alerts', {}, headers);
  },

  // Get alert by ID
  getAlertById: async (id, headers = {}) => {
    return await apiRequest('GET', `/alerts/${id}`, {}, headers);
  },

  // Create alert
  createAlert: async (alertData, headers = {}) => {
    return await apiRequest('POST', '/alerts', alertData, headers);
  },

  // Update alert
  updateAlert: async (id, alertData, headers = {}) => {
    return await apiRequest('PUT', `/alerts/${id}`, alertData, headers);
  },

  // Delete alert
  deleteAlert: async (id, headers = {}) => {
    return await apiRequest('DELETE', `/alerts/${id}`, {}, headers);
  },

  // Trigger alert manually
  triggerAlert: async (id, headers = {}) => {
    return await apiRequest('POST', `/alerts/${id}/trigger`, {}, headers);
  },

  // Get active alerts
  getActiveAlerts: async (headers = {}) => {
    return await apiRequest('GET', '/alerts/active', {}, headers);
  },

  // Get triggered alerts
  getTriggeredAlerts: async (headers = {}) => {
    return await apiRequest('GET', '/alerts/triggered', {}, headers);
  },

  // Create price alert
  createPriceAlert: async (alertData, headers = {}) => {
    return await apiRequest('POST', '/alerts/price', alertData, headers);
  },

  // Get price alerts
  getPriceAlerts: async (headers = {}) => {
    return await apiRequest('GET', '/alerts/price', {}, headers);
  },

  // Create signal alert
  createSignalAlert: async (alertData, headers = {}) => {
    return await apiRequest('POST', '/alerts/signal', alertData, headers);
  },

  // Get signal alerts
  getSignalAlerts: async (headers = {}) => {
    return await apiRequest('GET', '/alerts/signal', {}, headers);
  },

  // Create news alert
  createNewsAlert: async (alertData, headers = {}) => {
    return await apiRequest('POST', '/alerts/news', alertData, headers);
  },

  // Get news alerts
  getNewsAlerts: async (headers = {}) => {
    return await apiRequest('GET', '/alerts/news', {}, headers);
  },

  // Get notification preferences
  getNotificationPreferences: async (headers = {}) => {
    return await apiRequest('GET', '/alerts/preferences', {}, headers);
  },

  // Update notification preferences
  updateNotificationPreferences: async (preferences, headers = {}) => {
    return await apiRequest('PUT', '/alerts/preferences', preferences, headers);
  }
};

export { alertService };
