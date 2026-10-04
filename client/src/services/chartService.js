import { api, apiRequest } from './api';

const chartService = {
  // Get chart data for symbol
  getChartData: async (symbol, params = {}) => {
    return await apiRequest('GET', `/charts/${symbol}`, params);
  },

  // Get indicators for symbol
  getIndicators: async (symbol, params = {}) => {
    return await apiRequest('GET', `/charts/${symbol}/indicators`, params);
  },

  // Get technical analysis for symbol
  getTechnicalAnalysis: async (symbol, params = {}) => {
    return await apiRequest('GET', `/charts/${symbol}/technical-analysis`, params);
  },

  // Get market data
  getMarketData: async (market, params = {}) => {
    return await apiRequest('GET', `/charts/markets/${market}`, params);
  },

  // Get historical data
  getHistoricalData: async (symbol, params = {}) => {
    return await apiRequest('GET', `/charts/history/${symbol}`, params);
  },

  // Create chart data (Admin only)
  createChartData: async (symbol, chartData) => {
    return await apiRequest('POST', `/charts/${symbol}`, chartData);
  },

  // Update chart data (Admin only)
  updateChartData: async (symbol, chartData) => {
    return await apiRequest('PUT', `/charts/${symbol}`, chartData);
  },

  // Delete chart data (Admin only)
  deleteChartData: async (symbol) => {
    return await apiRequest('DELETE', `/charts/${symbol}`);
  },

  // Bulk update chart data (Admin only)
  bulkUpdateChartData: async (chartDataList) => {
    return await apiRequest('POST', '/charts/bulk-update', { chartDataList });
  },

  // Add to favorites
  addToFavorites: async (symbol, name, market = 'crypto') => {
    return await apiRequest('POST', '/charts/favorites', { symbol, name, market });
  },

  // Get favorites
  getFavorites: async () => {
    return await apiRequest('GET', '/charts/favorites');
  },

  // Remove from favorites
  removeFromFavorites: async (symbol) => {
    return await apiRequest('DELETE', `/charts/favorites/${symbol}`);
  }
};

export { chartService };
