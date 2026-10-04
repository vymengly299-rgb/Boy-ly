import { api, apiRequest } from './api';

const signalService = {
  // Get all signals
  getAllSignals: async (params = {}) => {
    return await apiRequest('GET', '/signals', params);
  },

  // Get signal by ID
  getSignalById: async (id) => {
    return await apiRequest('GET', `/signals/${id}`);
  },

  // Get signals by symbol
  getSignalsBySymbol: async (symbol, params = {}) => {
    return await apiRequest('GET', `/signals/symbol/${symbol}`, params);
  },

  // Get signals by market
  getSignalsByMarket: async (market, params = {}) => {
    return await apiRequest('GET', `/signals/market/${market}`, params);
  },

  // Get signals by category
  getSignalsByCategory: async (category, params = {}) => {
    return await apiRequest('GET', `/signals/category/${category}`, params);
  },

  // Get latest signals
  getLatestSignals: async (limit = 5) => {
    return await apiRequest('GET', `/signals/latest?limit=${limit}`);
  },

  // Get featured signals
  getFeaturedSignals: async (limit = 5) => {
    return await apiRequest('GET', `/signals/featured?limit=${limit}`);
  },

  // Get AI signals
  getAISignals: async (params = {}) => {
    return await apiRequest('GET', '/signals/ai/signals', params);
  },

  // Create signal (Admin only)
  createSignal: async (signalData) => {
    return await apiRequest('POST', '/signals', signalData);
  },

  // Update signal (Admin only)
  updateSignal: async (id, signalData) => {
    return await apiRequest('PUT', `/signals/${id}`, signalData);
  },

  // Delete signal (Admin only)
  deleteSignal: async (id) => {
    return await apiRequest('DELETE', `/signals/${id}`);
  },

  // Verify signal (Admin only)
  verifySignal: async (id) => {
    return await apiRequest('POST', `/signals/${id}/verify`);
  },

  // Expire signal (Admin only)
  expireSignal: async (id) => {
    return await apiRequest('POST', `/signals/${id}/expire`);
  },

  // Bulk create signals (Admin only)
  bulkCreateSignals: async (signals) => {
    return await apiRequest('POST', '/signals/bulk-create', { signals });
  },

  // Add to watchlist
  addToWatchlist: async (signalId) => {
    return await apiRequest('POST', '/signals/watchlist', { signalId });
  },

  // Get watchlist
  getWatchlist: async () => {
    return await apiRequest('GET', '/signals/watchlist');
  },

  // Remove from watchlist
  removeFromWatchlist: async (signalId) => {
    return await apiRequest('DELETE', `/signals/watchlist/${signalId}`);
  },

  // Search signals
  searchSignals: async (query, params = {}) => {
    return await apiRequest('GET', '/signals/search', { q: query, ...params });
  }
};

export { signalService };
