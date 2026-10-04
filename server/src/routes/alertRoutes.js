const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { protect } = require('../middleware/authMiddleware');

// All alert routes require authentication
router.use(protect);

// User alert routes
router.get('/', alertController.getAllAlerts);
router.get('/:id', alertController.getAlertById);
router.post('/', alertController.createAlert);
router.put('/:id', alertController.updateAlert);
router.delete('/:id', alertController.deleteAlert);
router.post('/:id/trigger', alertController.triggerAlert);
router.get('/active', alertController.getActiveAlerts);
router.get('/triggered', alertController.getTriggeredAlerts);

// Price alert specific routes
router.post('/price', alertController.createPriceAlert);
router.get('/price', alertController.getPriceAlerts);

// Signal alert specific routes
router.post('/signal', alertController.createSignalAlert);
router.get('/signal', alertController.getSignalAlerts);

// News alert specific routes
router.post('/news', alertController.createNewsAlert);
router.get('/news', alertController.getNewsAlerts);

// Notification preferences
router.get('/preferences', alertController.getNotificationPreferences);
router.put('/preferences', alertController.updateNotificationPreferences);

module.exports = router;
