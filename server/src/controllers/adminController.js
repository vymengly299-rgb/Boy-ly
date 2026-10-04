const User = require('../models/User');
const Signal = require('../models/Signal');
const News = require('../models/News');
const ChartData = require('../models/ChartData');
const Alert = require('../models/Alert');
const AppError = require('../utils/AppError');
const { sendEmail } = require('../utils/emailSender');
const { sendPushNotification } = require('../utils/notificationSender');

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      role,
      isActive,
      isVerified,
      search
    } = req.query;

    // Build query
    const query = {};
    
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query (exclude password)
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID (Admin only)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
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

// @desc    Activate user (Admin only)
// @route   PUT /api/admin/users/:id/activate
// @access  Private/Admin
const activateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    user.isActive = true;
    await user.save();

    // Send activation email
    await sendEmail({
      to: user.email,
      subject: 'Account Activated - Boy-ly Trading',
      html: `
        <h2>Your Account Has Been Activated</h2>
        <p>Hello ${user.firstName || user.username},</p>
        <p>Your Boy-ly Trading account has been activated by an administrator.</p>
        <p>You can now log in and start using the platform.</p>
        <p>Thank you!</p>
      `
    });

    res.status(200).json({
      success: true,
      message: 'User activated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate user (Admin only)
// @route   PUT /api/admin/users/:id/deactivate
// @access  Private/Admin
const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Prevent deactivating superadmin
    if (user.role === 'superadmin' && req.user.id !== user._id.toString()) {
      return next(new AppError('Cannot deactivate superadmin', 403));
    }

    user.isActive = false;
    await user.save();

    // Send deactivation email
    await sendEmail({
      to: user.email,
      subject: 'Account Deactivated - Boy-ly Trading',
      html: `
        <h2>Your Account Has Been Deactivated</h2>
        <p>Hello ${user.firstName || user.username},</p>
        <p>Your Boy-ly Trading account has been deactivated by an administrator.</p>
        <p>Please contact support if you believe this is a mistake.</p>
        <p>Thank you!</p>
      `
    });

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Make user admin (Admin only)
// @route   PUT /api/admin/users/:id/make-admin
// @access  Private/Admin
const makeAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    user.role = 'admin';
    await user.save();

    // Send promotion email
    await sendEmail({
      to: user.email,
      subject: 'You Are Now an Admin - Boy-ly Trading',
      html: `
        <h2>Congratulations! You Are Now an Admin</h2>
        <p>Hello ${user.firstName || user.username},</p>
        <p>You have been promoted to admin status by ${req.user.username}.</p>
        <p>You now have access to additional administrative features.</p>
        <p>Thank you!</p>
      `
    });

    res.status(200).json({
      success: true,
      message: 'User promoted to admin successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove admin privileges (Admin only)
// @route   PUT /api/admin/users/:id/remove-admin
// @access  Private/Admin
const removeAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Prevent removing admin from self
    if (req.user.id === user._id.toString()) {
      return next(new AppError('Cannot remove admin privileges from yourself', 403));
    }

    // Prevent removing admin from superadmin
    if (user.role === 'superadmin') {
      return next(new AppError('Cannot remove admin privileges from superadmin', 403));
    }

    user.role = 'user';
    await user.save();

    // Send demotion email
    await sendEmail({
      to: user.email,
      subject: 'Admin Privileges Removed - Boy-ly Trading',
      html: `
        <h2>Your Admin Privileges Have Been Removed</h2>
        <p>Hello ${user.firstName || user.username},</p>
        <p>Your admin privileges have been removed by ${req.user.username}.</p>
        <p>You will no longer have access to administrative features.</p>
        <p>Thank you!</p>
      `
    });

    res.status(200).json({
      success: true,
      message: 'Admin privileges removed successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Prevent deleting superadmin
    if (user.role === 'superadmin') {
      return next(new AppError('Cannot delete superadmin', 403));
    }

    // Prevent deleting self
    if (req.user.id === user._id.toString()) {
      return next(new AppError('Cannot delete your own account', 403));
    }

    await User.findByIdAndDelete(req.params.id);

    // Delete user's alerts
    await Alert.deleteMany({ user: req.params.id });

    // Send deletion email
    await sendEmail({
      to: user.email,
      subject: 'Account Deleted - Boy-ly Trading',
      html: `
        <h2>Your Account Has Been Deleted</h2>
        <p>Hello ${user.firstName || user.username},</p>
        <p>Your Boy-ly Trading account has been permanently deleted by an administrator.</p>
        <p>If you believe this is a mistake, please contact support immediately.</p>
        <p>Thank you!</p>
      `
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      userCount,
      activeUserCount,
      adminCount,
      signalCount,
      activeSignalCount,
      newsCount,
      chartDataCount,
      alertCount
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: { $in: ['admin', 'superadmin'] } }),
      Signal.countDocuments(),
      Signal.countDocuments({ status: 'active' }),
      News.countDocuments({ status: 'published' }),
      ChartData.countDocuments(),
      Alert.countDocuments()
    ]);

    const stats = {
      users: {
        total: userCount,
        active: activeUserCount,
        admins: adminCount
      },
      signals: {
        total: signalCount,
        active: activeSignalCount
      },
      news: {
        total: newsCount
      },
      charts: {
        total: chartDataCount
      },
      alerts: {
        total: alertCount
      }
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get signal statistics
// @route   GET /api/admin/stats/signals
// @access  Private/Admin
const getSignalStats = async (req, res, next) => {
  try {
    const { period = '7d' } = req.query;

    const dateFilter = getDateFilter(period);

    const [
      totalSignals,
      byType,
      byMarket,
      byCategory,
      byStatus,
      byPriority,
      recentSignals
    ] = await Promise.all([
      Signal.countDocuments({ ...dateFilter }),
      Signal.aggregate([
        { $match: { ...dateFilter } },
        { $group: { _id: '$signalType', count: { $sum: 1 } } }
      ]),
      Signal.aggregate([
        { $match: { ...dateFilter } },
        { $group: { _id: '$market', count: { $sum: 1 } } }
      ]),
      Signal.aggregate([
        { $match: { ...dateFilter } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Signal.aggregate([
        { $match: { ...dateFilter } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Signal.aggregate([
        { $match: { ...dateFilter } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Signal.find({ ...dateFilter })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('signalType symbol name createdAt')
    ]);

    const stats = {
      total: totalSignals,
      byType: formatAggregation(byType),
      byMarket: formatAggregation(byMarket),
      byCategory: formatAggregation(byCategory),
      byStatus: formatAggregation(byStatus),
      byPriority: formatAggregation(byPriority),
      recentSignals
    };

    res.status(200).json({
      success: true,
      period,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics
// @route   GET /api/admin/stats/users
// @access  Private/Admin
const getUserStats = async (req, res, next) => {
  try {
    const { period = '7d' } = req.query;

    const dateFilter = getDateFilter(period);

    const [
      totalUsers,
      activeUsers,
      byRole,
      byVerification,
      recentUsers
    ] = await Promise.all([
      User.countDocuments({ ...dateFilter }),
      User.countDocuments({ ...dateFilter, isActive: true }),
      User.aggregate([
        { $match: { ...dateFilter } },
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $match: { ...dateFilter } },
        { $group: { _id: '$isVerified', count: { $sum: 1 } } }
      ]),
      User.find({ ...dateFilter })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('username email role createdAt')
    ]);

    const stats = {
      total: totalUsers,
      active: activeUsers,
      byRole: formatAggregation(byRole),
      byVerification: formatAggregation(byVerification, ['true', 'false'], ['Verified', 'Unverified']),
      recentUsers
    };

    res.status(200).json({
      success: true,
      period,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get news statistics
// @route   GET /api/admin/stats/news
// @access  Private/Admin
const getNewsStats = async (req, res, next) => {
  try {
    const { period = '7d' } = req.query;

    const dateFilter = getDateFilter(period);
    dateFilter.status = 'published';

    const [
      totalNews,
      byCategory,
      byMarket,
      bySentiment,
      byPriority,
      recentNews
    ] = await Promise.all([
      News.countDocuments({ ...dateFilter }),
      News.aggregate([
        { $match: { ...dateFilter } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      News.aggregate([
        { $match: { ...dateFilter } },
        { $group: { _id: '$market', count: { $sum: 1 } } }
      ]),
      News.aggregate([
        { $match: { ...dateFilter } },
        { $group: { _id: '$sentiment', count: { $sum: 1 } } }
      ]),
      News.aggregate([
        { $match: { ...dateFilter } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      News.find({ ...dateFilter })
        .sort({ publishedAt: -1 })
        .limit(10)
        .select('title category market publishedAt')
    ]);

    const stats = {
      total: totalNews,
      byCategory: formatAggregation(byCategory),
      byMarket: formatAggregation(byMarket),
      bySentiment: formatAggregation(bySentiment),
      byPriority: formatAggregation(byPriority),
      recentNews
    };

    res.status(200).json({
      success: true,
      period,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all signals for admin
// @route   GET /api/admin/content/signals
// @access  Private/Admin
const getAllSignalsAdmin = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      ...filters
    } = req.query;

    // Build query from filters
    const query = {};
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        query[key] = filters[key];
      }
    });

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const skip = (page - 1) * limit;

    const [signals, total] = await Promise.all([
      Signal.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'username firstName lastName'),
      Signal.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: signals.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: signals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all news for admin
// @route   GET /api/admin/content/news
// @access  Private/Admin
const getAllNewsAdmin = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      sortBy = 'publishedAt',
      sortOrder = 'desc',
      ...filters
    } = req.query;

    // Build query from filters
    const query = {};
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        query[key] = filters[key];
      }
    });

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const skip = (page - 1) * limit;

    const [news, total] = await Promise.all([
      News.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'username firstName lastName'),
      News.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: news.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: news
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all chart data for admin
// @route   GET /api/admin/content/charts
// @access  Private/Admin
const getAllChartDataAdmin = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      sortBy = 'lastUpdated',
      sortOrder = 'desc',
      ...filters
    } = req.query;

    // Build query from filters
    const query = {};
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        query[key] = filters[key];
      }
    });

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const skip = (page - 1) * limit;

    const [chartData, total] = await Promise.all([
      ChartData.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'username firstName lastName'),
      ChartData.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: chartData.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: chartData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system logs
// @route   GET /api/admin/system/logs
// @access  Private/Admin
const getSystemLogs = async (req, res, next) => {
  try {
    // In a real implementation, you would read from log files
    // For now, return mock data
    const logs = [
      { timestamp: new Date(), level: 'info', message: 'Server started' },
      { timestamp: new Date(Date.now() - 3600000), level: 'warn', message: 'High memory usage detected' },
      { timestamp: new Date(Date.now() - 7200000), level: 'error', message: 'Database connection lost' }
    ];

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system health
// @route   GET /api/admin/system/health
// @access  Private/Admin
const getSystemHealth = async (req, res, next) => {
  try {
    const [
      dbStats,
      memoryUsage,
      uptime
    ] = await Promise.all([
      mongoose.connection.db.command({ dbStats: 1 }).catch(() => ({})),
      process.memoryUsage(),
      process.uptime()
    ]);

    const health = {
      database: {
        connected: mongoose.connection.readyState === 1,
        collections: dbStats.collections || 0,
        objects: dbStats.objects || 0
      },
      memory: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external
      },
      uptime: uptime,
      timestamp: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      data: health
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create backup
// @route   POST /api/admin/system/backup
// @access  Private/SuperAdmin
const createBackup = async (req, res, next) => {
  try {
    // In a real implementation, you would create a database backup
    // For now, return success message

    // Log backup creation
    console.log(`Backup created by ${req.user.username} at ${new Date().toISOString()}`);

    res.status(200).json({
      success: true,
      message: 'Backup created successfully',
      backupId: `backup-${Date.now()}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cache
// @route   POST /api/admin/system/clear-cache
// @access  Private/Admin
const clearCache = async (req, res, next) => {
  try {
    // In a real implementation, you would clear various caches
    // For now, return success message

    res.status(200).json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get settings
// @route   GET /api/admin/settings
// @access  Private/Admin
const getSettings = async (req, res, next) => {
  try {
    // In a real implementation, you would fetch from database
    const settings = {
      siteName: 'Boy-ly Trading Signals',
      siteDescription: 'AI-powered trading signals platform',
      maintenanceMode: false,
      allowRegistrations: true,
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      aiEnabled: true,
      theme: 'dark'
    };

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update settings
// @route   PUT /api/admin/settings
// @access  Private/SuperAdmin
const updateSettings = async (req, res, next) => {
  try {
    const settings = req.body;

    // In a real implementation, you would save to database
    console.log(`Settings updated by ${req.user.username}:`, settings);

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Broadcast notification to all users
// @route   POST /api/admin/notifications/broadcast
// @access  Private/Admin
const broadcastNotification = async (req, res, next) => {
  try {
    const { title, message, type = 'info', targets = ['all'] } = req.body;

    if (!title || !message) {
      return next(new AppError('Title and message are required', 400));
    }

    // Get target users
    let users = [];
    
    if (targets.includes('all')) {
      users = await User.find({ isActive: true });
    } else if (targets.includes('admins')) {
      users = await User.find({ 
        role: { $in: ['admin', 'superadmin'] },
        isActive: true 
      });
    } else if (targets.includes('verified')) {
      users = await User.find({ isVerified: true, isActive: true });
    }

    // Send notifications
    const results = [];
    
    for (const user of users) {
      // Send push notification
      if (user.preferences?.notificationSettings?.push) {
        try {
          await sendPushNotification({
            userId: user._id,
            title,
            body: message,
            data: { type: 'broadcast', notificationType: type }
          });
          results.push({ userId: user._id, status: 'sent' });
        } catch (error) {
          results.push({ userId: user._id, status: 'failed', error: error.message });
        }
      }

      // Send email notification
      if (user.preferences?.notificationSettings?.email) {
        try {
          await sendEmail({
            to: user.email,
            subject: title,
            html: `<p>${message}</p>`
          });
          results.push({ userId: user._id, status: 'email_sent' });
        } catch (error) {
          results.push({ userId: user._id, status: 'email_failed', error: error.message });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Notification broadcasted to ${users.length} users`,
      sent: results.filter(r => r.status === 'sent').length,
      failed: results.filter(r => r.status.includes('failed')).length,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get notifications
// @route   GET /api/admin/notifications
// @access  Private/Admin
const getNotifications = async (req, res, next) => {
  try {
    // In a real implementation, you would fetch from database
    const notifications = [
      { id: 1, title: 'System Update', message: 'Server maintenance scheduled', type: 'warning', createdAt: new Date() },
      { id: 2, title: 'New Feature', message: 'AI signals now available', type: 'info', createdAt: new Date(Date.now() - 86400000) }
    ];

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI signals
// @route   GET /api/admin/ai/signals
// @access  Private/Admin
const getAISignals = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const [signals, total] = await Promise.all([
      Signal.find({ isAIGenerated: true })
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('createdBy', 'username firstName lastName'),
      Signal.countDocuments({ isAIGenerated: true })
    ]);

    res.status(200).json({
      success: true,
      count: signals.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: signals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate AI signals
// @route   POST /api/admin/ai/generate-signals
// @access  Private/Admin
const generateAISignals = async (req, res, next) => {
  try {
    const { market = 'crypto', count = 5, aiModel = 'default-ai' } = req.body;

    // In a real implementation, you would call an AI service
    // For now, create mock AI signals
    const mockSymbols = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'ADA/USDT'];
    const mockSignalTypes = ['buy', 'sell', 'hold', 'strong_buy'];
    
    const signals = [];
    
    for (let i = 0; i < count; i++) {
      const symbol = mockSymbols[Math.floor(Math.random() * mockSymbols.length)];
      const signalType = mockSignalTypes[Math.floor(Math.random() * mockSignalTypes.length)];
      
      const signal = await Signal.create({
        symbol,
        name: symbol.split('/')[0],
        signalType,
        entryPrice: (Math.random() * 100000).toFixed(2),
        targetPrice: (Math.random() * 100000 + 5000).toFixed(2),
        stopLoss: (Math.random() * 100000 - 5000).toFixed(2),
        riskRewardRatio: (Math.random() * 5 + 1).toFixed(2),
        confidenceLevel: Math.floor(Math.random() * 60 + 40), // 40-100
        timeframe: ['1h', '4h', '1d'][Math.floor(Math.random() * 3)],
        market,
        category: 'ai',
        isAIGenerated: true,
        aiModel,
        aiAnalysis: {
          trend: ['bullish', 'bearish', 'neutral'][Math.floor(Math.random() * 3)],
          momentum: ['strong', 'weak', 'mixed'][Math.floor(Math.random() * 3)],
          volatility: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
          recommendation: signalType.toUpperCase()
        },
        indicators: {
          rsi: Math.floor(Math.random() * 70 + 30),
          macd: (Math.random() * 2 - 1).toFixed(4),
          movingAverages: {
            sma50: (Math.random() * 100000).toFixed(2),
            sma200: (Math.random() * 100000).toFixed(2)
          }
        },
        createdBy: req.user.id
      });
      
      signals.push(signal);
    }

    // Broadcast new signals
    const broadcastSignal = req.app.get('broadcastSignal');
    if (broadcastSignal) {
      signals.forEach(signal => broadcastSignal(signal));
    }

    res.status(201).json({
      success: true,
      count: signals.length,
      data: signals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze market with AI
// @route   POST /api/admin/ai/analyze-market
// @access  Private/Admin
const analyzeMarket = async (req, res, next) => {
  try {
    const { market = 'crypto', timeframe = '1d' } = req.body;

    // In a real implementation, you would call an AI service
    // For now, return mock analysis
    const analysis = {
      market,
      timeframe,
      overallSentiment: ['bullish', 'bearish', 'neutral'][Math.floor(Math.random() * 3)],
      confidence: Math.floor(Math.random() * 30 + 70), // 70-100
      topSignals: [
        { symbol: 'BTC/USDT', recommendation: 'buy', confidence: 85 },
        { symbol: 'ETH/USDT', recommendation: 'hold', confidence: 72 },
        { symbol: 'SOL/USDT', recommendation: 'strong_buy', confidence: 90 }
      ],
      riskAssessment: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      keyFactors: [
        'Market sentiment is positive',
        'Institutional adoption increasing',
        'Technical indicators show strength'
      ],
      generatedAt: new Date().toISOString(),
      aiModel: 'market-analyzer-v2'
    };

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity report
// @route   GET /api/admin/reports/activity
// @access  Private/Admin
const getActivityReport = async (req, res, next) => {
  try {
    const { period = '7d' } = req.query;
    const dateFilter = getDateFilter(period);

    const [
      signalsCreated,
      newsPublished,
      usersRegistered,
      alertsCreated
    ] = await Promise.all([
      Signal.countDocuments({ ...dateFilter }),
      News.countDocuments({ ...dateFilter, status: 'published' }),
      User.countDocuments({ ...dateFilter }),
      Alert.countDocuments({ ...dateFilter })
    ]);

    const report = {
      period,
      summary: {
        signalsCreated,
        newsPublished,
        usersRegistered,
        alertsCreated,
        totalActivity: signalsCreated + newsPublished + usersRegistered + alertsCreated
      },
      dailyBreakdown: generateDailyBreakdown(period)
    };

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user report
// @route   GET /api/admin/reports/users
// @access  Private/Admin
const getUserReport = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    const dateFilter = getDateFilter(period);

    const [
      totalUsers,
      activeUsers,
      newUsers,
      byRole,
      byVerification
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ ...dateFilter }),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      User.aggregate([{ $group: { _id: '$isVerified', count: { $sum: 1 } } }])
    ]);

    const report = {
      period,
      summary: {
        totalUsers,
        activeUsers,
        newUsers,
        growthRate: totalUsers > 0 ? ((newUsers / totalUsers) * 100).toFixed(2) : 0
      },
      byRole: formatAggregation(byRole),
      byVerification: formatAggregation(byVerification, ['true', 'false'], ['Verified', 'Unverified'])
    };

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get signal report
// @route   GET /api/admin/reports/signals
// @access  Private/Admin
const getSignalReport = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    const dateFilter = getDateFilter(period);

    const [
      totalSignals,
      activeSignals,
      byType,
      byMarket,
      byCategory,
      byStatus,
      successRate
    ] = await Promise.all([
      Signal.countDocuments({ ...dateFilter }),
      Signal.countDocuments({ ...dateFilter, status: 'active' }),
      Signal.aggregate([
        { $match: { ...dateFilter } },
        { $group: { _id: '$signalType', count: { $sum: 1 } } }
      ]),
      Signal.aggregate([
        { $match: { ...dateFilter } },
        { $group: { _id: '$market', count: { $sum: 1 } } }
      ]),
      Signal.aggregate([
        { $match: { ...dateFilter } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Signal.aggregate([
        { $match: { ...dateFilter } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Signal.aggregate([
        { $match: { ...dateFilter, status: 'completed' } },
        { $group: { 
          _id: null, 
          successful: { $sum: { $cond: [{ $eq: ['$result', 'profit'] }, 1, 0] } },
          total: { $sum: 1 } 
        }}
      ])
    ]);

    const successRateData = successRate[0] || { successful: 0, total: 0 };
    const calculatedSuccessRate = successRateData.total > 0 
      ? ((successRateData.successful / successRateData.total) * 100).toFixed(2) 
      : 0;

    const report = {
      period,
      summary: {
        totalSignals,
        activeSignals,
        successRate: calculatedSuccessRate
      },
      byType: formatAggregation(byType),
      byMarket: formatAggregation(byMarket),
      byCategory: formatAggregation(byCategory),
      byStatus: formatAggregation(byStatus)
    };

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions
const getDateFilter = (period) => {
  const now = new Date();
  let from = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Default: 1 day

  switch (period) {
    case '7d':
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      from = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    case 'all':
      return {};
  }

  return { createdAt: { $gte: from } };
};

const formatAggregation = (data, keyMap, valueMap) => {
  if (!data || data.length === 0) return [];

  return data.map(item => ({
    key: keyMap ? valueMap[keyMap.indexOf(item._id.toString())] || item._id : item._id,
    value: item._id,
    count: item.count
  }));
};

const generateDailyBreakdown = (period) => {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 7;
  const breakdown = [];

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    
    breakdown.push({
      date: date.toISOString().split('T')[0],
      signals: Math.floor(Math.random() * 20),
      news: Math.floor(Math.random() * 10),
      users: Math.floor(Math.random() * 5)
    });
  }

  return breakdown;
};

module.exports = {
  getAllUsers,
  getUserById,
  activateUser,
  deactivateUser,
  makeAdmin,
  removeAdmin,
  deleteUser,
  getDashboardStats,
  getSignalStats,
  getUserStats,
  getNewsStats,
  getAllSignalsAdmin,
  getAllNewsAdmin,
  getAllChartDataAdmin,
  getSystemLogs,
  getSystemHealth,
  createBackup,
  clearCache,
  getSettings,
  updateSettings,
  broadcastNotification,
  getNotifications,
  getAISignals,
  generateAISignals,
  analyzeMarket,
  getActivityReport,
  getUserReport,
  getSignalReport
};
