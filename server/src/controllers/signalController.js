const Signal = require('../models/Signal');
const User = require('../models/User');
const Alert = require('../models/Alert');
const ChartData = require('../models/ChartData');
const AppError = require('../utils/AppError');
const { sendPushNotification } = require('../utils/notificationSender');

// @desc    Get all signals with filters
// @route   GET /api/signals
// @access  Public
const getAllSignals = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      signalType,
      market,
      category,
      status,
      priority,
      symbol,
      search
    } = req.query;

    // Build query
    const query = {};
    
    if (signalType) query.signalType = signalType;
    if (market) query.market = market;
    if (category) query.category = category;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (symbol) query.symbol = { $regex: symbol, $options: 'i' };
    
    if (search) {
      query.$or = [
        { symbol: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
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

// @desc    Get signal by ID
// @route   GET /api/signals/:id
// @access  Public
const getSignalById = async (req, res, next) => {
  try {
    const signal = await Signal.findById(req.params.id)
      .populate('createdBy', 'username firstName lastName email')
      .populate('verifiedBy', 'username firstName lastName');

    if (!signal) {
      return next(new AppError('Signal not found', 404));
    }

    // Increment view count (optional)
    signal.views = (signal.views || 0) + 1;
    await signal.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: signal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get signals by symbol
// @route   GET /api/signals/symbol/:symbol
// @access  Public
const getSignalsBySymbol = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { limit = 10, page = 1 } = req.query;

    const signals = await Signal.find({ symbol: { $regex: symbol, $options: 'i' } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('createdBy', 'username firstName lastName');

    const total = await Signal.countDocuments({ symbol: { $regex: symbol, $options: 'i' } });

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

// @desc    Get signals by market
// @route   GET /api/signals/market/:market
// @access  Public
const getSignalsByMarket = async (req, res, next) => {
  try {
    const { market } = req.params;
    const { limit = 10, page = 1 } = req.query;

    const signals = await Signal.find({ market })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('createdBy', 'username firstName lastName');

    const total = await Signal.countDocuments({ market });

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

// @desc    Get signals by category
// @route   GET /api/signals/category/:category
// @access  Public
const getSignalsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { limit = 10, page = 1 } = req.query;

    const signals = await Signal.find({ category })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('createdBy', 'username firstName lastName');

    const total = await Signal.countDocuments({ category });

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

// @desc    Get latest signals
// @route   GET /api/signals/latest
// @access  Public
const getLatestSignals = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;

    const signals = await Signal.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('createdBy', 'username firstName lastName');

    res.status(200).json({
      success: true,
      count: signals.length,
      data: signals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured signals
// @route   GET /api/signals/featured
// @access  Public
const getFeaturedSignals = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;

    const signals = await Signal.find({
      $or: [
        { priority: 'high' },
        { priority: 'critical' },
        { confidenceLevel: { $gte: 80 } }
      ],
      status: 'active'
    })
      .sort({ confidenceLevel: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .populate('createdBy', 'username firstName lastName');

    res.status(200).json({
      success: true,
      count: signals.length,
      data: signals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI-generated signals
// @route   GET /api/signals/ai/signals
// @access  Public
const getAISignals = async (req, res, next) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    const signals = await Signal.find({ isAIGenerated: true })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('createdBy', 'username firstName lastName');

    const total = await Signal.countDocuments({ isAIGenerated: true });

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

// @desc    Create new signal
// @route   POST /api/signals
// @access  Private/Admin
const createSignal = async (req, res, next) => {
  try {
    const signalData = req.body;
    signalData.createdBy = req.user.id;

    // If AI-generated, mark it
    if (signalData.isAIGenerated) {
      signalData.aiModel = signalData.aiModel || 'default-ai';
    }

    const signal = await Signal.create(signalData);

    // Populate createdBy
    await signal.populate('createdBy', 'username firstName lastName');

    // Broadcast to WebSocket clients
    const broadcastSignal = req.app.get('broadcastSignal');
    if (broadcastSignal) {
      broadcastSignal(signal);
    }

    // Create alerts for users watching this symbol
    const usersWatching = await User.find({
      'preferences.tradingPreferences.markets': signal.market,
      isActive: true
    });

    // Send push notifications to mobile users
    for (const user of usersWatching) {
      if (user.preferences?.notificationSettings?.push) {
        await sendPushNotification({
          userId: user._id,
          title: `New ${signal.signalType.toUpperCase()} Signal`,
          body: `${signal.symbol}: ${signal.name} at $${signal.entryPrice}`,
          data: { type: 'signal', signalId: signal._id }
        });
      }
    }

    res.status(201).json({
      success: true,
      data: signal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update signal
// @route   PUT /api/signals/:id
// @access  Private/Admin
const updateSignal = async (req, res, next) => {
  try {
    const signal = await Signal.findById(req.params.id);
    if (!signal) {
      return next(new AppError('Signal not found', 404));
    }

    const updatedSignal = await Signal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username firstName lastName');

    // Broadcast update to WebSocket clients
    const broadcastSignal = req.app.get('broadcastSignal');
    if (broadcastSignal) {
      broadcastSignal({ ...updatedSignal.toObject(), update: true });
    }

    res.status(200).json({
      success: true,
      data: updatedSignal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete signal
// @route   DELETE /api/signals/:id
// @access  Private/Admin
const deleteSignal = async (req, res, next) => {
  try {
    const signal = await Signal.findById(req.params.id);
    if (!signal) {
      return next(new AppError('Signal not found', 404));
    }

    await Signal.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Signal deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify signal
// @route   POST /api/signals/:id/verify
// @access  Private/Admin
const verifySignal = async (req, res, next) => {
  try {
    const signal = await Signal.findById(req.params.id);
    if (!signal) {
      return next(new AppError('Signal not found', 404));
    }

    signal.verifiedBy = req.user.id;
    signal.status = 'active';
    await signal.save();

    const updatedSignal = await signal.populate('verifiedBy', 'username firstName lastName');

    res.status(200).json({
      success: true,
      data: updatedSignal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Expire signal
// @route   POST /api/signals/:id/expire
// @access  Private/Admin
const expireSignal = async (req, res, next) => {
  try {
    const signal = await Signal.findById(req.params.id);
    if (!signal) {
      return next(new AppError('Signal not found', 404));
    }

    signal.status = 'expired';
    signal.expiryDate = new Date();
    await signal.save();

    res.status(200).json({
      success: true,
      data: signal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk create signals
// @route   POST /api/signals/bulk-create
// @access  Private/Admin
const bulkCreateSignals = async (req, res, next) => {
  try {
    const { signals } = req.body;
    if (!signals || !Array.isArray(signals) || signals.length === 0) {
      return next(new AppError('Signals array is required', 400));
    }

    // Add createdBy to each signal
    const signalsWithCreator = signals.map(signal => ({
      ...signal,
      createdBy: req.user.id
    }));

    const createdSignals = await Signal.insertMany(signalsWithCreator);

    // Populate createdBy for all signals
    const populatedSignals = await Promise.all(
      createdSignals.map(async signal => {
        const populated = await signal.populate('createdBy', 'username firstName lastName');
        return populated;
      })
    );

    // Broadcast all new signals
    const broadcastSignal = req.app.get('broadcastSignal');
    if (broadcastSignal) {
      populatedSignals.forEach(signal => broadcastSignal(signal));
    }

    res.status(201).json({
      success: true,
      count: populatedSignals.length,
      data: populatedSignals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add signal to watchlist
// @route   POST /api/signals/watchlist
// @access  Private
const addToWatchlist = async (req, res, next) => {
  try {
    const { signalId } = req.body;

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

    res.status(200).json({
      success: true,
      message: 'Signal added to watchlist',
      watchlist: user.watchlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's watchlist
// @route   GET /api/signals/watchlist
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

// @desc    Remove signal from watchlist
// @route   DELETE /api/signals/watchlist/:signalId
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
      watchlist: user.watchlist
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSignals,
  getSignalById,
  getSignalsBySymbol,
  getSignalsByMarket,
  getSignalsByCategory,
  getLatestSignals,
  getFeaturedSignals,
  getAISignals,
  createSignal,
  updateSignal,
  deleteSignal,
  verifySignal,
  expireSignal,
  bulkCreateSignals,
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist
};
