const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  signal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Signal'
  },
  type: {
    type: String,
    enum: ['price_alert', 'signal_alert', 'news_alert', 'custom'],
    required: [true, 'Alert type is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  message: {
    type: String,
    trim: true
  },
  condition: {
    type: String,
    enum: ['above', 'below', 'equals', 'between', 'new_signal', 'news_published']
  },
  value: {
    type: mongoose.Schema.Types.Mixed
  },
  value2: {
    type: mongoose.Schema.Types.Mixed
  },
  symbol: {
    type: String,
    trim: true,
    uppercase: true
  },
  market: {
    type: String,
    enum: ['stocks', 'forex', 'crypto', 'commodities', 'indices', 'all']
  },
  notificationMethods: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true },
    webhook: { type: Boolean, default: false }
  },
  webhookUrl: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  triggered: {
    type: Boolean,
    default: false
  },
  triggerCount: {
    type: Number,
    default: 0
  },
  lastTriggeredAt: {
    type: Date,
    default: null
  },
  scheduledAt: {
    type: Date
  },
  frequency: {
    type: String,
    enum: ['once', 'daily', 'weekly', 'monthly', 'realtime'],
    default: 'once'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
alertSchema.index({ user: 1 });
alertSchema.index({ signal: 1 });
alertSchema.index({ type: 1 });
alertSchema.index({ symbol: 1 });
alertSchema.index({ market: 1 });
alertSchema.index({ isActive: 1 });
alertSchema.index({ triggered: 1 });
alertSchema.index({ createdAt: -1 });
alertSchema.index({ scheduledAt: 1 });

// Virtual for nextRun
alertSchema.virtual('nextRun').get(function() {
  if (!this.scheduledAt) return null;
  
  const now = new Date();
  const scheduled = new Date(this.scheduledAt);
  
  if (scheduled > now) {
    return scheduled;
  }
  
  // Calculate next run based on frequency
  const frequencies = {
    once: null,
    daily: 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000,
    monthly: 30 * 24 * 60 * 60 * 1000
  };
  
  const interval = frequencies[this.frequency];
  if (!interval) return null;
  
  let next = new Date(scheduled.getTime() + interval);
  while (next <= now) {
    next = new Date(next.getTime() + interval);
  }
  
  return next;
});

// Virtual for isDue
alertSchema.virtual('isDue').get(function() {
  if (!this.scheduledAt) return false;
  
  const now = new Date();
  const scheduled = new Date(this.scheduledAt);
  
  if (this.frequency === 'once') {
    return !this.triggered && scheduled <= now;
  }
  
  const nextRun = this.nextRun;
  if (!nextRun) return false;
  
  return nextRun <= now;
});

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;
