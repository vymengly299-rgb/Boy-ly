const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', newsController.getAllNews);
router.get('/:id', newsController.getNewsById);
router.get('/category/:category', newsController.getNewsByCategory);
router.get('/market/:market', newsController.getNewsByMarket);
router.get('/latest', newsController.getLatestNews);
router.get('/featured', newsController.getFeaturedNews);
router.get('/breaking', newsController.getBreakingNews);
router.get('/search', newsController.searchNews);

// Protected routes
router.use(protect);
router.post('/bookmark/:id', newsController.bookmarkNews);
router.get('/bookmarks', newsController.getBookmarkedNews);
router.delete('/bookmark/:id', newsController.removeBookmark);

// Admin routes
router.use(isAdmin);
router.post('/', newsController.createNews);
router.put('/:id', newsController.updateNews);
router.delete('/:id', newsController.deleteNews);
router.post('/:id/feature', newsController.featureNews);
router.post('/:id/unfeature', newsController.unfeatureNews);

module.exports = router;
