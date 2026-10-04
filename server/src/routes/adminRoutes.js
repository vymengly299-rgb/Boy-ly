const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, isSuperAdmin, isAdmin } = require('../middleware/authMiddleware');

// All admin routes require authentication and admin privileges
router.use(protect);
router.use(isAdmin);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id/activate', adminController.activateUser);
router.put('/users/:id/deactivate', adminController.deactivateUser);
router.put('/users/:id/make-admin', adminController.makeAdmin);
router.put('/users/:id/remove-admin', adminController.removeAdmin);
router.delete('/users/:id', adminController.deleteUser);

// Dashboard statistics
router.get('/stats', adminController.getDashboardStats);
router.get('/stats/signals', adminController.getSignalStats);
router.get('/stats/users', adminController.getUserStats);
router.get('/stats/news', adminController.getNewsStats);

// Content management
router.get('/content/signals', adminController.getAllSignalsAdmin);
router.get('/content/news', adminController.getAllNewsAdmin);
router.get('/content/charts', adminController.getAllChartDataAdmin);

// System management
router.get('/system/logs', adminController.getSystemLogs);
router.get('/system/health', adminController.getSystemHealth);
router.post('/system/backup', isSuperAdmin, adminController.createBackup);
router.post('/system/clear-cache', adminController.clearCache);

// Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', isSuperAdmin, adminController.updateSettings);

// Notifications
router.post('/notifications/broadcast', adminController.broadcastNotification);
router.get('/notifications', adminController.getNotifications);

// AI Management
router.get('/ai/signals', adminController.getAISignals);
router.post('/ai/generate-signals', adminController.generateAISignals);
router.post('/ai/analyze-market', adminController.analyzeMarket);

// Reports
router.get('/reports/activity', adminController.getActivityReport);
router.get('/reports/users', adminController.getUserReport);
router.get('/reports/signals', adminController.getSignalReport);

module.exports = router;
