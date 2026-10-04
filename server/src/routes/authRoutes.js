const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.post('/verify-email/:token', authController.verifyEmail);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.use(protect);
router.post('/logout', authController.logout);
router.get('/me', authController.getMe);
router.put('/update-password', authController.updatePassword);
router.put('/update-profile', authController.updateProfile);

// Google OAuth (optional)
router.post('/google', authController.googleAuth);

// Two-factor authentication
router.post('/enable-2fa', authController.enableTwoFactorAuth);
router.post('/verify-2fa', authController.verifyTwoFactorAuth);
router.post('/disable-2fa', authController.disableTwoFactorAuth);

module.exports = router;
