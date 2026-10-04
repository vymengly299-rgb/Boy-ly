// Mock push notification service
// In a real implementation, you would use Firebase Cloud Messaging (FCM) or similar

const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Store user devices (in a real app, this would be in a database)
const userDevices = new Map();

// Register device for push notifications
const registerDevice = (userId, deviceToken) => {
  if (!userDevices.has(userId)) {
    userDevices.set(userId, new Set());
  }
  userDevices.get(userId).add(deviceToken);
  console.log(`Device registered for user ${userId}: ${deviceToken}`);
};

// Unregister device
const unregisterDevice = (userId, deviceToken) => {
  if (userDevices.has(userId)) {
    userDevices.get(userId).delete(deviceToken);
    console.log(`Device unregistered for user ${userId}: ${deviceToken}`);
  }
};

// Send push notification
const sendPushNotification = async (options) => {
  try {
    const { userId, title, body, data = {}, imageUrl } = options;

    // Validate required fields
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!title && !body) {
      throw new Error('Title or body is required');
    }

    // In development, log the notification
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV PUSH] To: ${userId}, Title: ${title}, Body: ${body}`);
      return { success: true, message: 'Push notification logged (development mode)' };
    }

    // In production, you would send via FCM or similar service
    // For now, we'll simulate the process
    const payload = {
      notification: {
        title,
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge.png'
      },
      data: {
        ...data,
        timestamp: new Date().toISOString()
      }
    };

    if (imageUrl) {
      payload.notification.image = imageUrl;
    }

    // Get user's devices
    const deviceTokens = userDevices.get(userId) || new Set();
    
    const results = [];
    
    for (const token of deviceTokens) {
      // In a real implementation, you would send to each device
      // For now, just log
      console.log(`Sending push notification to device ${token}:`, payload);
      results.push({
        token,
        status: 'sent',
        payload
      });
    }

    return {
      success: true,
      sentCount: results.length,
      results
    };
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
};

// Send broadcast notification to multiple users
const sendBroadcastNotification = async (userIds, options) => {
  try {
    const results = [];
    
    for (const userId of userIds) {
      try {
        const result = await sendPushNotification({ ...options, userId });
        results.push({ userId, ...result });
      } catch (error) {
        results.push({ userId, success: false, error: error.message });
      }
    }

    return results;
  } catch (error) {
    console.error('Error sending broadcast notification:', error);
    throw error;
  }
};

// Notification templates
const notificationTemplates = {
  newSignal: (signal) => ({
    title: `New ${signal.signalType.toUpperCase()} Signal`,
    body: `${signal.symbol}: $${signal.entryPrice} (${signal.confidenceLevel}% confidence)`,
    data: {
      type: 'signal',
      signalId: signal._id.toString(),
      symbol: signal.symbol,
      signalType: signal.signalType
    }
  }),

  priceAlert: (symbol, condition, value) => ({
    title: `Price Alert: ${symbol}`,
    body: `${symbol} is now ${condition} $${value}`,
    data: {
      type: 'price_alert',
      symbol,
      condition,
      value
    }
  }),

  newsAlert: (news) => ({
    title: `Breaking News: ${news.category}`,
    body: news.title,
    data: {
      type: 'news',
      newsId: news._id.toString(),
      category: news.category
    }
  }),

  alertTriggered: (alert) => ({
    title: `Alert Triggered: ${alert.title}`,
    body: alert.message || `Your alert for ${alert.symbol || 'custom condition'} has been triggered`,
    data: {
      type: 'alert_triggered',
      alertId: alert._id.toString()
    }
  }),

  welcome: (user) => ({
    title: 'Welcome to Boy-ly Trading!',
    body: `Hello ${user.firstName || user.username}! Welcome to your trading signals platform.`,
    data: {
      type: 'welcome'
    }
  })
};

module.exports = {
  sendPushNotification,
  sendBroadcastNotification,
  registerDevice,
  unregisterDevice,
  notificationTemplates,
  userDevices
};
