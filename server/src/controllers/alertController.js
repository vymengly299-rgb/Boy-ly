const Alert = require('../models/Alert');
const User = require('../models/User');
const Signal = require('../models/Signal');
const News = require('../models/News');
const ChartData = require('../models/ChartData');
const AppError = require('../utils/AppError');
const { sendEmail } = require('../utils/emailSender');
const { sendSMS } = require('../utils/smsSender');
const { sendPushNotification } = require('../utils/notificationSender');

// @desc    Get all alerts for current user
// @route   GET /api/alerts
// @access  Private
const getAllAlerts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      type,
      symbol,
      market,
      isActive,
      triggered
    } = req.query;

    // Build query
    const query = { user: req.user.id };
    
    if (type) query.type = type;
    if (symbol) query.symbol = { $regex: symbol, $options: 'i' };
    if (market) query.market = market;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (triggered !== undefined) query.triggered = triggered === 'true';

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [alerts, total] = await Promise.all([
      Alert.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('signal', 'symbol name signalType entryPrice'),
      Alert.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: alerts.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get alert by ID
// @route   GET /api/alerts/:id
// @access  Private
const getAlertById = async (req, res, next) => {
  try {
    const alert = await Alert.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('signal', 'symbol name signalType entryPrice createdAt');

    if (!alert) {
      return next(new AppError('Alert not found', 404));
    }

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create alert
// @route   POST /api/alerts
// @access  Private
const createAlert = async (req, res, next) => {
  try {
    const alertData = req.body;
    alertData.user = req.user.id;

    // Set default notification methods from user preferences
    const user = await User.findById(req.user.id);
    if (user && user.preferences?.notificationSettings) {
      alertData.notificationMethods = {
        email: user.preferences.notificationSettings.email || true,
        sms: user.preferences.notificationSettings.sms || false,
        push: user.preferences.notificationSettings.push || true,
        webhook: user.preferences.notificationSettings.webhook || false
      };
    }

    const alert = await Alert.create(alertData);

    // Populate signal if present
    if (alert.signal) {
      await alert.populate('signal', 'symbol name signalType entryPrice');
    }

    res.status(201).json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update alert
// @route   PUT /api/alerts/:id
// @access  Private
const updateAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('signal', 'symbol name signalType entryPrice');

    if (!alert) {
      return next(new AppError('Alert not found', 404));
    }

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete alert
// @route   DELETE /api/alerts/:id
// @access  Private
const deleteAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!alert) {
      return next(new AppError('Alert not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger alert manually
// @route   POST /api/alerts/:id/trigger
// @access  Private
const triggerAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('signal');

    if (!alert) {
      return next(new AppError('Alert not found', 404));
    }

    // Trigger the alert
    const result = await triggerAlertActions(alert);

    res.status(200).json({
      success: true,
      message: 'Alert triggered successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active alerts
// @route   GET /api/alerts/active
// @access  Private
const getActiveAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find({
      user: req.user.id,
      isActive: true
    })
      .sort({ createdAt: -1 })
      .populate('signal', 'symbol name signalType entryPrice');

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get triggered alerts
// @route   GET /api/alerts/triggered
// @access  Private
const getTriggeredAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find({
      user: req.user.id,
      triggered: true
    })
      .sort({ lastTriggeredAt: -1 })
      .populate('signal', 'symbol name signalType entryPrice');

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create price alert
// @route   POST /api/alerts/price
// @access  Private
const createPriceAlert = async (req, res, next) => {
  try {
    const { symbol, condition, value, value2, notificationMethods, webhookUrl } = req.body;

    if (!symbol || !condition || !value) {
      return next(new AppError('Symbol, condition, and value are required', 400));
    }

    const alertData = {
      user: req.user.id,
      type: 'price_alert',
      symbol: symbol.toUpperCase(),
      title: `${condition.toUpperCase()} alert for ${symbol}`,
      condition,
      value,
      value2: condition === 'between' ? value2 : undefined,
      notificationMethods: notificationMethods || { email: true, push: true },
      webhookUrl
    };

    const alert = await Alert.create(alertData);

    res.status(201).json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get price alerts
// @route   GET /api/alerts/price
// @access  Private
const getPriceAlerts = async (req, res, next) => {
  try {
    const { symbol, isActive } = req.query;

    const query = { user: req.user.id, type: 'price_alert' };
    if (symbol) query.symbol = { $regex: symbol, $options: 'i' };
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create signal alert
// @route   POST /api/alerts/signal
// @access  Private
const createSignalAlert = async (req, res, next) => {
  try {
    const { signalId, condition, notificationMethods } = req.body;

    if (!signalId) {
      return next(new AppError('Signal ID is required', 400));
    }

    // Check if signal exists
    const signal = await Signal.findById(signalId);
    if (!signal) {
      return next(new AppError('Signal not found', 404));
    }

    const alertData = {
      user: req.user.id,
      type: 'signal_alert',
      signal: signalId,
      symbol: signal.symbol,
      title: `Alert for ${signal.symbol} signal`,
      condition: condition || 'new_signal',
      notificationMethods: notificationMethods || { email: true, push: true }
    };

    const alert = await Alert.create(alertData);

    // Populate signal
    await alert.populate('signal', 'symbol name signalType entryPrice');

    res.status(201).json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get signal alerts
// @route   GET /api/alerts/signal
// @access  Private
const getSignalAlerts = async (req, res, next) => {
  try {
    const { isActive } = req.query;

    const query = { user: req.user.id, type: 'signal_alert' };
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .populate('signal', 'symbol name signalType entryPrice');

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create news alert
// @route   POST /api/alerts/news
// @access  Private
const createNewsAlert = async (req, res, next) => {
  try {
    const { category, market, priority, notificationMethods } = req.body;

    const alertData = {
      user: req.user.id,
      type: 'news_alert',
      title: `News alert for ${category || 'all categories'}`,
      condition: 'news_published',
      category: category || 'all',
      market: market || 'all',
      priority: priority || 'all',
      notificationMethods: notificationMethods || { email: true, push: true }
    };

    const alert = await Alert.create(alertData);

    res.status(201).json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get news alerts
// @route   GET /api/alerts/news
// @access  Private
const getNewsAlerts = async (req, res, next) => {
  try {
    const { category, isActive } = req.query;

    const query = { user: req.user.id, type: 'news_alert' };
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get notification preferences
// @route   GET /api/alerts/preferences
// @access  Private
const getNotificationPreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user.preferences?.notificationSettings || {
        email: true,
        sms: false,
        push: true,
        webhook: false
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update notification preferences
// @route   PUT /api/alerts/preferences
// @access  Private
const updateNotificationPreferences = async (req, res, next) => {
  try {
    const { email, sms, push, webhook } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          'preferences.notificationSettings.email': email !== undefined ? email : true,
          'preferences.notificationSettings.sms': sms !== undefined ? sms : false,
          'preferences.notificationSettings.push': push !== undefined ? push : true,
          'preferences.notificationSettings.webhook': webhook !== undefined ? webhook : false
        }
      },
      { new: true }
    );

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: user.preferences?.notificationSettings
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to trigger alert actions
const triggerAlertActions = async (alert) => {
  const user = await User.findById(alert.user);
  if (!user) {
    return { success: false, message: 'User not found' };
  }

  // Update alert
  alert.triggerCount = (alert.triggerCount || 0) + 1;
  alert.lastTriggeredAt = new Date();
  alert.triggered = true;
  await alert.save();

  // Prepare notification content
  let title = alert.title || `Alert Triggered: ${alert.symbol || 'Custom Alert'}`;
  let message = alert.message || `Your alert for ${alert.symbol || 'custom condition'} has been triggered.`;

  // Add signal info if it's a signal alert
  if (alert.signal) {
    const signal = await Signal.findById(alert.signal);
    if (signal) {
      title = `Signal Alert: ${signal.symbol}`;
      message = `New ${signal.signalType} signal for ${signal.symbol} at $${signal.entryPrice}`;
    }
  }

  // Send notifications based on user preferences
  const results = [];

  // Email notification
  if (alert.notificationMethods?.email && user.preferences?.notificationSettings?.email) {
    try {
      await sendEmail({
        to: user.email,
        subject: title,
        html: `<p>${message}</p>`
      });
      results.push({ type: 'email', status: 'sent' });
    } catch (error) {
      results.push({ type: 'email', status: 'failed', error: error.message });
    }
  }

  // SMS notification
  if (alert.notificationMethods?.sms && user.preferences?.notificationSettings?.sms && user.phone) {
    try {
      await sendSMS({
        to: user.phone,
        message: `${title}: ${message}`
      });
      results.push({ type: 'sms', status: 'sent' });
    } catch (error) {
      results.push({ type: 'sms', status: 'failed', error: error.message });
    }
  }

  // Push notification
  if (alert.notificationMethods?.push && user.preferences?.notificationSettings?.push) {
    try {
      await sendPushNotification({
        userId: user._id,
        title,
        body: message,
        data: { type: 'alert', alertId: alert._id }
      });
      results.push({ type: 'push', status: 'sent' });
    } catch (error) {
      results.push({ type: 'push', status: 'failed', error: error.message });
    }
  }

  // Webhook notification
  if (alert.notificationMethods?.webhook && alert.webhookUrl) {
    try {
      // In a real implementation, you would make an HTTP request to the webhook URL
      // For now, just mark as sent
      results.push({ type: 'webhook', status: 'sent' });
    } catch (error) {
      results.push({ type: 'webhook', status: 'failed', error: error.message });
    }
  }

  return {
    alertId: alert._id,
    userId: user._id,
    title,
    message,
    results,
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  getAllAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  deleteAlert,
  triggerAlert,
  getActiveAlerts,
  getTriggeredAlerts,
  createPriceAlert,
  getPriceAlerts,
  createSignalAlert,
  getSignalAlerts,
  createNewsAlert,
  getNewsAlerts,
  getNotificationPreferences,
  updateNotificationPreferences,
  triggerAlertActions
};
