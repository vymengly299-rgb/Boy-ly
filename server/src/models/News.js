const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },
  summary: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    required: [true, 'Source is required'],
    trim: true
  },
  url: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/$, 'Please enter a valid URL']
  },
  category: {
    type: String,
    enum: ['market', 'crypto', 'stocks', 'forex', 'commodities', 'economy', 'technology', 'regulations'],
    default: 'market'
  },
  market: {
    type: String,
    enum: ['stocks', 'forex', 'crypto', 'commodities', 'indices', 'all'],
    default: 'all'
  },
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    default: 'neutral'
  },
  sentimentScore: {
    type: Number,
    min: -1,
    max: 1,
    default: 0
  },
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  aiSummary: {
    type: String,
    trim: true
  },
  keywords: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  relatedSymbols: [{
    type: String,
    trim: true,
    uppercase: true
  }],
  imageUrl: {
    type: String,
    trim: true
  },
  author: {
    type: String,
    trim: true
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'breaking'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  shares: {
    type: Number,
    default: 0
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
newsSchema.index({ title: 'text', content: 'text', summary: 'text' });
newsSchema.index({ category: 1 });
newsSchema.index({ market: 1 });
newsSchema.index({ sentiment: 1 });
newsSchema.index({ priority: 1 });
newsSchema.index({ status: 1 });
newsSchema.index({ publishedAt: -1 });
newsSchema.index({ isFeatured: 1 });
newsSchema.index({ createdAt: -1 });

// Virtual for isBreaking
newsSchema.virtual('isBreaking').get(function() {
  return this.priority === 'breaking';
});

// Virtual for likeCount
newsSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

const News = mongoose.model('News', newsSchema);

module.exports = News;
