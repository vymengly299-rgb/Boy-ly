import { api, apiRequest } from './api';

const userService = {
  // Get user profile
  getProfile: async () => {
    return await apiRequest('GET', '/users/profile');
  },

  // Update profile
  updateProfile: async (profileData) => {
    return await apiRequest('PUT', '/users/profile', profileData);
  },

  // Update profile image
  updateProfileImage: async (imageUrl) => {
    return await apiRequest('PUT', '/users/profile-image', { profileImage: imageUrl });
  },

  // Get preferences
  getPreferences: async () => {
    return await apiRequest('GET', '/users/preferences');
  },

  // Update preferences
  updatePreferences: async (preferences) => {
    return await apiRequest('PUT', '/users/preferences', preferences);
  },

  // Get watchlist
  getWatchlist: async () => {
    return await apiRequest('GET', '/users/watchlist');
  },

  // Add to watchlist
  addToWatchlist: async (signalId) => {
    return await apiRequest('POST', '/users/watchlist', { signalId });
  },

  // Remove from watchlist
  removeFromWatchlist: async (signalId) => {
    return await apiRequest('DELETE', `/users/watchlist/${signalId}`);
  },

  // Get favorites
  getFavorites: async () => {
    return await apiRequest('GET', '/users/favorites');
  },

  // Add to favorites
  addToFavorites: async (symbol, name, market = 'crypto') => {
    return await apiRequest('POST', '/users/favorites', { symbol, name, market });
  },

  // Remove from favorites
  removeFromFavorites: async (symbol) => {
    return await apiRequest('DELETE', `/users/favorites/${symbol}`);
  },

  // Get bookmarks
  getBookmarks: async () => {
    return await apiRequest('GET', '/users/bookmarks');
  },

  // Add bookmark
  addBookmark: async (newsId) => {
    return await apiRequest('POST', `/users/bookmarks/${newsId}`);
  },

  // Remove bookmark
  removeBookmark: async (newsId) => {
    return await apiRequest('DELETE', `/users/bookmarks/${newsId}`);
  },

  // Get activity
  getActivity: async () => {
    return await apiRequest('GET', '/users/activity');
  },

  // Get notifications
  getNotifications: async () => {
    return await apiRequest('GET', '/users/notifications');
  },

  // Mark notification as read
  markNotificationAsRead: async (id) => {
    return await apiRequest('PUT', `/users/notifications/${id}/read`);
  },

  // Mark all notifications as read
  markAllNotificationsAsRead: async () => {
    return await apiRequest('PUT', '/users/notifications/read-all');
  },

  // Get API keys
  getApiKeys: async () => {
    return await apiRequest('GET', '/users/api-keys');
  },

  // Create API key
  createApiKey: async (name, permissions = ['read']) => {
    return await apiRequest('POST', '/users/api-keys', { name, permissions });
  },

  // Delete API key
  deleteApiKey: async (keyId) => {
    return await apiRequest('DELETE', `/users/api-keys/${keyId}`);
  },

  // Get dashboard
  getDashboard: async () => {
    return await apiRequest('GET', '/users/dashboard');
  },

  // Get dashboard signals
  getDashboardSignals: async (limit = 10) => {
    return await apiRequest('GET', `/users/dashboard/signals?limit=${limit}`);
  },

  // Get dashboard news
  getDashboardNews: async (limit = 10) => {
    return await apiRequest('GET', `/users/dashboard/news?limit=${limit}`);
  },

  // Get dashboard alerts
  getDashboardAlerts: async (limit = 10) => {
    return await apiRequest('GET', `/users/dashboard/alerts?limit=${limit}`);
  }
};

export { userService };
