import { api, apiRequest } from './api';

const newsService = {
  // Get all news
  getAllNews: async (params = {}) => {
    return await apiRequest('GET', '/news', params);
  },

  // Get news by ID
  getNewsById: async (id) => {
    return await apiRequest('GET', `/news/${id}`);
  },

  // Get news by category
  getNewsByCategory: async (category, params = {}) => {
    return await apiRequest('GET', `/news/category/${category}`, params);
  },

  // Get news by market
  getNewsByMarket: async (market, params = {}) => {
    return await apiRequest('GET', `/news/market/${market}`, params);
  },

  // Get latest news
  getLatestNews: async (limit = 5) => {
    return await apiRequest('GET', `/news/latest?limit=${limit}`);
  },

  // Get featured news
  getFeaturedNews: async (limit = 5) => {
    return await apiRequest('GET', `/news/featured?limit=${limit}`);
  },

  // Get breaking news
  getBreakingNews: async (limit = 5) => {
    return await apiRequest('GET', `/news/breaking?limit=${limit}`);
  },

  // Search news
  searchNews: async (query, params = {}) => {
    return await apiRequest('GET', '/news/search', { q: query, ...params });
  },

  // Create news (Admin only)
  createNews: async (newsData) => {
    return await apiRequest('POST', '/news', newsData);
  },

  // Update news (Admin only)
  updateNews: async (id, newsData) => {
    return await apiRequest('PUT', `/news/${id}`, newsData);
  },

  // Delete news (Admin only)
  deleteNews: async (id) => {
    return await apiRequest('DELETE', `/news/${id}`);
  },

  // Feature news (Admin only)
  featureNews: async (id) => {
    return await apiRequest('POST', `/news/${id}/feature`);
  },

  // Unfeature news (Admin only)
  unfeatureNews: async (id) => {
    return await apiRequest('POST', `/news/${id}/unfeature`);
  },

  // Bookmark news
  bookmarkNews: async (newsId) => {
    return await apiRequest('POST', `/news/bookmark/${newsId}`);
  },

  // Get bookmarked news
  getBookmarkedNews: async () => {
    return await apiRequest('GET', '/news/bookmarks');
  },

  // Remove bookmark
  removeBookmark: async (newsId) => {
    return await apiRequest('DELETE', `/news/bookmark/${newsId}`);
  }
};

export { newsService };
