const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// All user routes require authentication
router.use(protect);

// User profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/profile-image', userController.updateProfileImage);

// User preferences routes
router.get('/preferences', userController.getPreferences);
router.put('/preferences', userController.updatePreferences);

// User watchlist routes
router.get('/watchlist', userController.getWatchlist);
router.post('/watchlist', userController.addToWatchlist);
router.delete('/watchlist/:signalId', userController.removeFromWatchlist);

// User favorites routes
router.get('/favorites', userController.getFavorites);
router.post('/favorites', userController.addToFavorites);
router.delete('/favorites/:symbol', userController.removeFromFavorites);

// User bookmarks routes
router.get('/bookmarks', userController.getBookmarks);
router.post('/bookmarks/:newsId', userController.addBookmark);
router.delete('/bookmarks/:newsId', userController.removeBookmark);

// User activity routes
router.get('/activity', userController.getActivity);
router.get('/notifications', userController.getNotifications);
router.put('/notifications/:id/read', userController.markNotificationAsRead);
router.put('/notifications/read-all', userController.markAllNotificationsAsRead);

// User API keys routes
router.get('/api-keys', userController.getApiKeys);
router.post('/api-keys', userController.createApiKey);
router.delete('/api-keys/:keyId', userController.deleteApiKey);

// User dashboard routes
router.get('/dashboard', userController.getDashboard);
router.get('/dashboard/signals', userController.getDashboardSignals);
router.get('/dashboard/news', userController.getDashboardNews);
router.get('/dashboard/alerts', userController.getDashboardAlerts);

module.exports = router;
