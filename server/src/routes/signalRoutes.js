const express = require('express');
const router = express.Router();
const signalController = require('../controllers/signalController');
const { protect, authorize, isAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', signalController.getAllSignals);
router.get('/:id', signalController.getSignalById);
router.get('/symbol/:symbol', signalController.getSignalsBySymbol);
router.get('/market/:market', signalController.getSignalsByMarket);
router.get('/category/:category', signalController.getSignalsByCategory);
router.get('/latest', signalController.getLatestSignals);
router.get('/featured', signalController.getFeaturedSignals);
router.get('/ai/signals', signalController.getAISignals);

// Protected routes
router.use(protect);
router.post('/watchlist', signalController.addToWatchlist);
router.get('/watchlist', signalController.getWatchlist);
router.delete('/watchlist/:signalId', signalController.removeFromWatchlist);

// Admin routes
router.use(isAdmin);
router.post('/', signalController.createSignal);
router.put('/:id', signalController.updateSignal);
router.delete('/:id', signalController.deleteSignal);
router.post('/:id/verify', signalController.verifySignal);
router.post('/:id/expire', signalController.expireSignal);
router.post('/bulk-create', signalController.bulkCreateSignals);

module.exports = router;
