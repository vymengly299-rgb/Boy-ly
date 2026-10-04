const mongoose = require('mongoose');

const signalSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: [true, 'Symbol is required'],
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  signalType: {
    type: String,
    enum: ['buy', 'sell', 'hold', 'strong_buy', 'strong_sell'],
    required: [true, 'Signal type is required']
  },
  entryPrice: {
    type: Number,
    required: [true, 'Entry price is required']
  },
  targetPrice: {
    type: Number
  },
  stopLoss: {
    type: Number
  },
  riskRewardRatio: {
    type: Number,
    default: 1
  },
  confidenceLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  timeframe: {
    type: String,
    enum: ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'],
    default: '1d'
  },
  market: {
    type: String,
    enum: ['stocks', 'forex', 'crypto', 'commodities', 'indices'],
    default: 'crypto'
  },
  category: {
    type: String,
    enum: ['ai', 'technical', 'fundamental', 'sentiment', 'mixed'],
    default: 'ai'
  },
  description: {
    type: String,
    trim: true
  },
  analysis: {
    type: String,
    trim: true
  },
  aiAnalysis: {
    trend: String,
    momentum: String,
    volatility: String,
    recommendation: String
  },
  indicators: {
    rsi: Number,
    macd: Number,
    movingAverages: {
      sma50: Number,
      sma200: Number,
      ema20: Number,
      ema50: Number
    },
    bollingerBands: {
      upper: Number,
      middle: Number,
      lower: Number
    },
    stochastic: Number
  },
  chartData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'expired'],
    default: 'active'
  },
  result: {
    type: String,
    enum: ['profit', 'loss', 'breakeven', 'pending'],
    default: 'pending'
  },
  profitLoss: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  aiModel: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  expiryDate: {
    type: Date
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
signalSchema.index({ symbol: 1 });
signalSchema.index({ signalType: 1 });
signalSchema.index({ market: 1 });
signalSchema.index({ category: 1 });
signalSchema.index({ status: 1 });
signalSchema.index({ priority: 1 });
signalSchema.index({ createdAt: -1 });
signalSchema.index({ expiryDate: 1 });

// Virtual for signal age
signalSchema.virtual('age').get(function() {
  const now = new Date();
  const created = this.createdAt || now;
  const diff = now - created;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { hours, minutes };
});

// Virtual for isExpired
signalSchema.virtual('isExpired').get(function() {
  if (this.expiryDate) {
    return new Date() > this.expiryDate;
  }
  return false;
});

const Signal = mongoose.model('Signal', signalSchema);

module.exports = Signal;
