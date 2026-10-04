const mongoose = require('mongoose');

const chartDataSchema = new mongoose.Schema({
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
  market: {
    type: String,
    enum: ['stocks', 'forex', 'crypto', 'commodities', 'indices'],
    default: 'crypto'
  },
  timeframe: {
    type: String,
    enum: ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'],
    default: '1d'
  },
  data: [{
    timestamp: {
      type: Date,
      required: true
    },
    open: {
      type: Number,
      required: true
    },
    high: {
      type: Number,
      required: true
    },
    low: {
      type: Number,
      required: true
    },
    close: {
      type: Number,
      required: true
    },
    volume: {
      type: Number,
      default: 0
    },
    indicators: {
      rsi: Number,
      macd: Number,
      sma50: Number,
      sma200: Number,
      ema20: Number,
      ema50: Number,
      bollingerUpper: Number,
      bollingerMiddle: Number,
      bollingerLower: Number,
      stochastic: Number
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  dataSource: {
    type: String,
    enum: ['api', 'manual', 'ai', 'webhook'],
    default: 'api'
  },
  isRealTime: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
chartDataSchema.index({ symbol: 1 });
chartDataSchema.index({ market: 1 });
chartDataSchema.index({ timeframe: 1 });
chartDataSchema.index({ isRealTime: 1 });
chartDataSchema.index({ lastUpdated: -1 });

// Virtual for latestPrice
chartDataSchema.virtual('latestPrice').get(function() {
  if (this.data && this.data.length > 0) {
    return this.data[this.data.length - 1].close;
  }
  return null;
});

// Virtual for priceChange
chartDataSchema.virtual('priceChange').get(function() {
  if (this.data && this.data.length >= 2) {
    const latest = this.data[this.data.length - 1].close;
    const previous = this.data[this.data.length - 2].close;
    const change = latest - previous;
    const percentage = (change / previous) * 100;
    return {
      absolute: change,
      percentage: percentage
    };
  }
  return { absolute: 0, percentage: 0 };
});

// Virtual for dataPoints
chartDataSchema.virtual('dataPoints').get(function() {
  return this.data ? this.data.length : 0;
});

const ChartData = mongoose.model('ChartData', chartDataSchema);

module.exports = ChartData;
