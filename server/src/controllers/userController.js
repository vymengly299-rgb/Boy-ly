const User = require('../models/User');
const Signal = require('../models/Signal');
const News = require('../models/News');
const Alert = require('../models/Alert');
const ChartData = require('../models/ChartData');
const AppError = require('../utils/AppError');
const crypto = require('crypto');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, bio, location } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, phone, bio, location },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile image
// @route   PUT /api/users/profile-image
// @access  Private
const updateProfileImage = async (req, res, next) => {
  try {
    const { profileImage } = req.body;

    if (!profileImage) {
      return next(new AppError('Profile image URL is required', 400));
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage },
      { new: true }
    ).select('-password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Profile image updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user preferences
// @route   GET /api/users/preferences
// @access  Private
const getPreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user.preferences || {
        notificationSettings: {
          email: true,
          sms: false,
          push: true
        },
        tradingPreferences: {
          riskLevel: 'medium',
          markets: [],
          signalFrequency: 'realtime'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
const updatePreferences = async (req, res, next) => {
  try {
    const preferences = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { preferences },
      { new: true }
    ).select('-password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: user.preferences
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user watchlist
// @route   GET /api/users/watchlist
// @access  Private
const getWatchlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'watchlist',
      populate: { path: 'createdBy', select: 'username firstName lastName' }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      count: user.watchlist ? user.watchlist.length : 0,
      data: user.watchlist || []
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add signal to watchlist
// @route   POST /api/users/watchlist
// @access  Private
const addToWatchlist = async (req, res, next) => {
  try {
    const { signalId } = req.body;

    if (!signalId) {
      return next(new AppError('Signal ID is required', 400));
    }

    // Check if signal exists
    const signal = await Signal.findById(signalId);
    if (!signal) {
      return next(new AppError('Signal not found', 404));
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Check if already in watchlist
    if (user.watchlist && user.watchlist.includes(signalId)) {
      return next(new AppError('Signal already in watchlist', 400));
    }

    // Add to watchlist
    if (!user.watchlist) {
      user.watchlist = [];
    }
    user.watchlist.push(signalId);
    await user.save();

    // Populate the watchlist
    await user.populate('watchlist');

    res.status(200).json({
      success: true,
      message: 'Signal added to watchlist',
      data: user.watchlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove signal from watchlist
// @route   DELETE /api/users/watchlist/:signalId
// @access  Private
const removeFromWatchlist = async (req, res, next) => {
  try {
    const { signalId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Remove from watchlist
    if (user.watchlist) {
      user.watchlist = user.watchlist.filter(id => id.toString() !== signalId);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Signal removed from watchlist',
      data: user.watchlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user favorites
// @route   GET /api/users/favorites
// @access  Private
const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Populate with chart data if available
    const favorites = user.favorites || [];
    
    const favoritesWithData = await Promise.all(
      favorites.map(async (favorite) => {
        const chartData = await ChartData.findOne({
          symbol: favorite.symbol
        });
        
        return {
          ...favorite.toObject(),
          currentPrice: chartData?.latestPrice,
          priceChange: chartData?.priceChange
        };
      })
    );

    res.status(200).json({
      success: true,
      count: favoritesWithData.length,
      data: favoritesWithData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add symbol to favorites
// @route   POST /api/users/favorites
// @access  Private
const addToFavorites = async (req, res, next) => {
  try {
    const { symbol, name, market = 'crypto' } = req.body;

    if (!symbol) {
      return next(new AppError('Symbol is required', 400));
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Check if already in favorites
    const favoriteExists = user.favorites?.some(fav => 
      fav.symbol.toUpperCase() === symbol.toUpperCase()
    );

    if (favoriteExists) {
      return next(new AppError('Symbol already in favorites', 400));
    }

    // Add to favorites
    if (!user.favorites) {
      user.favorites = [];
    }
    
    user.favorites.push({
      symbol: symbol.toUpperCase(),
      name: name || symbol,
      market
    });
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Symbol added to favorites',
      data: user.favorites
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove symbol from favorites
// @route   DELETE /api/users/favorites/:symbol
// @access  Private
const removeFromFavorites = async (req, res, next) => {
  try {
    const { symbol } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Remove from favorites
    if (user.favorites) {
      user.favorites = user.favorites.filter(fav => 
        fav.symbol.toUpperCase() !== symbol.toUpperCase()
      );
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Symbol removed from favorites',
      data: user.favorites
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user bookmarks
// @route   GET /api/users/bookmarks
// @access  Private
const getBookmarks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'bookmarks',
      match: { status: 'published' },
      populate: { path: 'createdBy', select: 'username firstName lastName' }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      count: user.bookmarks ? user.bookmarks.length : 0,
      data: user.bookmarks || []
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add news to bookmarks
// @route   POST /api/users/bookmarks/:newsId
// @access  Private
const addBookmark = async (req, res, next) => {
  try {
    const { newsId } = req.params;

    const news = await News.findById(newsId);
    if (!news || news.status !== 'published') {
      return next(new AppError('News not found', 404));
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Check if already bookmarked
    if (user.bookmarks && user.bookmarks.includes(newsId)) {
      return next(new AppError('News already bookmarked', 400));
    }

    // Add to bookmarks
    if (!user.bookmarks) {
      user.bookmarks = [];
    }
    user.bookmarks.push(newsId);
    await user.save();

    // Populate bookmarks
    await user.populate('bookmarks');

    res.status(200).json({
      success: true,
      message: 'News bookmarked',
      data: user.bookmarks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove news from bookmarks
// @route   DELETE /api/users/bookmarks/:newsId
// @access  Private
const removeBookmark = async (req, res, next) => {
  try {
    const { newsId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Remove from bookmarks
    if (user.bookmarks) {
      user.bookmarks = user.bookmarks.filter(id => id.toString() !== newsId);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Bookmark removed',
      data: user.bookmarks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user activity
// @route   GET /api/users/activity
// @access  Private
const getActivity = async (req, res, next) => {
  try {
    const { limit = 20, page = 1 } = req.query;

    // In a real implementation, you would have an Activity model
    // For now, we'll combine recent actions from different models
    const [
      recentSignals,
      recentNews,
      recentAlerts
    ] = await Promise.all([
      Signal.find({ createdBy: req.user.id })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('signalType symbol createdAt'),
      News.find({ createdBy: req.user.id })
        .sort({ publishedAt: -1 })
        .limit(10)
        .select('title category publishedAt'),
      Alert.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('type title createdAt')
    ]);

    // Combine and sort by date
    const activity = [
      ...recentSignals.map(s => ({ type: 'signal', ...s.toObject(), action: 'created' })),
      ...recentNews.map(n => ({ type: 'news', ...n.toObject(), action: 'published' })),
      ...recentAlerts.map(a => ({ type: 'alert', ...a.toObject(), action: 'created' }))
    ]
      .sort((a, b) => new Date(b.createdAt || b.publishedAt) - new Date(a.createdAt || a.publishedAt))
      .slice(0, limit);

    res.status(200).json({
      success: true,
      count: activity.length,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const { limit = 20, page = 1, read } = req.query;

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Filter notifications
    let notifications = user.notifications || [];
    
    if (read === 'true') {
      notifications = notifications.filter(n => n.read);
    } else if (read === 'false') {
      notifications = notifications.filter(n => !n.read);
    }

    // Sort by date and paginate
    notifications = notifications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice((page - 1) * limit, page * limit);

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount: (user.notifications || []).filter(n => !n.read).length,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/users/notifications/:id/read
// @access  Private
const markNotificationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Update notification
    if (user.notifications) {
      user.notifications = user.notifications.map(n => {
        if (n._id && n._id.toString() === id) {
          return { ...n, read: true, readAt: new Date() };
        }
        return n;
      });
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/users/notifications/read-all
// @access  Private
const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Update all notifications
    if (user.notifications) {
      user.notifications = user.notifications.map(n => ({
        ...n,
        read: true,
        readAt: n.readAt || new Date()
      }));
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user API keys
// @route   GET /api/users/api-keys
// @access  Private
const getApiKeys = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Hide the actual key values (only show last 4 characters)
    const apiKeys = (user.apiKeys || []).map(key => ({
      id: key._id,
      name: key.name,
      permissions: key.permissions,
      createdAt: key.createdAt,
      keyPreview: key.key ? `****${key.key.slice(-4)}` : null
    }));

    res.status(200).json({
      success: true,
      count: apiKeys.length,
      data: apiKeys
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create API key
// @route   POST /api/users/api-keys
// @access  Private
const createApiKey = async (req, res, next) => {
  try {
    const { name, permissions = ['read'] } = req.body;

    if (!name) {
      return next(new AppError('Name is required', 400));
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Generate API key
    const key = `bl_${crypto.randomBytes(32).toString('hex')}`;

    // Add to user's API keys
    if (!user.apiKeys) {
      user.apiKeys = [];
    }
    
    user.apiKeys.push({
      key,
      name,
      permissions,
      createdAt: new Date()
    });
    
    await user.save();

    // Return the full key only once (for security)
    res.status(201).json({
      success: true,
      message: 'API key created successfully. Store this key securely as it will not be shown again.',
      data: {
        id: user.apiKeys[user.apiKeys.length - 1]._id,
        name,
        permissions,
        key, // Return full key only on creation
        createdAt: user.apiKeys[user.apiKeys.length - 1].createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete API key
// @route   DELETE /api/users/api-keys/:keyId
// @access  Private
const deleteApiKey = async (req, res, next) => {
  try {
    const { keyId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Remove API key
    if (user.apiKeys) {
      user.apiKeys = user.apiKeys.filter(key => key._id.toString() !== keyId);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'API key deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user dashboard
// @route   GET /api/users/dashboard
// @access  Private
const getDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Get dashboard data
    const [
      watchlistCount,
      favoritesCount,
      bookmarksCount,
      alertsCount,
      recentSignals,
      latestNews,
      activeAlerts
    ] = await Promise.all([
      Signal.countDocuments({ _id: { $in: user.watchlist || [] } }),
      user.favorites ? user.favorites.length : 0,
      user.bookmarks ? user.bookmarks.length : 0,
      Alert.countDocuments({ user: req.user.id, isActive: true }),
      Signal.find({ status: 'active' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('symbol name signalType entryPrice confidenceLevel createdAt'),
      News.find({ status: 'published' })
        .sort({ publishedAt: -1 })
        .limit(5)
        .select('title category market sentiment publishedAt'),
      Alert.find({ user: req.user.id, isActive: true, triggered: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('type title symbol condition createdAt')
    ]);

    const dashboard = {
      user: {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      stats: {
        watchlist: watchlistCount,
        favorites: favoritesCount,
        bookmarks: bookmarksCount,
        alerts: alertsCount
      },
      recentSignals,
      latestNews,
      activeAlerts,
      quickActions: [
        { name: 'Create Signal', icon: 'signal', route: '/signals/create' },
        { name: 'Set Alert', icon: 'alert', route: '/alerts/create' },
        { name: 'View Charts', icon: 'chart', route: '/charts' },
        { name: 'Read News', icon: 'news', route: '/news' }
      ]
    };

    res.status(200).json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard signals
// @route   GET /api/users/dashboard/signals
// @access  Private
const getDashboardSignals = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const signals = await Signal.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('symbol name signalType entryPrice targetPrice stopLoss confidenceLevel market category createdAt');

    res.status(200).json({
      success: true,
      count: signals.length,
      data: signals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard news
// @route   GET /api/users/dashboard/news
// @access  Private
const getDashboardNews = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const news = await News.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit))
      .select('title summary category market sentiment priority publishedAt');

    res.status(200).json({
      success: true,
      count: news.length,
      data: news
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard alerts
// @route   GET /api/users/dashboard/alerts
// @access  Private
const getDashboardAlerts = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const alerts = await Alert.find({ user: req.user.id, isActive: true })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('type title symbol condition value triggered createdAt');

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateProfileImage,
  getPreferences,
  updatePreferences,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  getBookmarks,
  addBookmark,
  removeBookmark,
  getActivity,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getApiKeys,
  createApiKey,
  deleteApiKey,
  getDashboard,
  getDashboardSignals,
  getDashboardNews,
  getDashboardAlerts
};
