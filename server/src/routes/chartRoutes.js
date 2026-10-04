const express = require('express');
const router = express.Router();
const chartController = require('../controllers/chartController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/:symbol', chartController.getChartData);
router.get('/:symbol/indicators', chartController.getIndicators);
router.get('/:symbol/technical-analysis', chartController.getTechnicalAnalysis);
router.get('/markets/:market', chartController.getMarketData);
router.get('/history/:symbol', chartController.getHistoricalData);

// Protected routes
router.use(protect);
router.post('/favorites', chartController.addToFavorites);
router.get('/favorites', chartController.getFavorites);
router.delete('/favorites/:symbol', chartController.removeFromFavorites);

// Admin routes
router.use(isAdmin);
router.post('/:symbol', chartController.createChartData);
router.put('/:symbol', chartController.updateChartData);
router.delete('/:symbol', chartController.deleteChartData);
router.post('/bulk-update', chartController.bulkUpdateChartData);

module.exports = router;
