const ChartData = require('../models/ChartData');
const Signal = require('../models/Signal');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// @desc    Get chart data for a symbol
// @route   GET /api/charts/:symbol
// @access  Public
const getChartData = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { timeframe = '1d', limit = 100 } = req.query;

    // Find chart data
    let chartData = await ChartData.findOne({
      symbol: symbol.toUpperCase(),
      timeframe
    });

    if (!chartData) {
      // Try to find any timeframe for this symbol
      chartData = await ChartData.findOne({ symbol: symbol.toUpperCase() });
    }

    if (!chartData) {
      return next(new AppError(`No chart data found for ${symbol}`, 404));
    }

    // Limit data points
    if (chartData.data && chartData.data.length > limit) {
      chartData.data = chartData.data.slice(-limit);
    }

    res.status(200).json({
      success: true,
      data: chartData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get indicators for a symbol
// @route   GET /api/charts/:symbol/indicators
// @access  Public
const getIndicators = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { timeframe = '1d' } = req.query;

    const chartData = await ChartData.findOne({
      symbol: symbol.toUpperCase(),
      timeframe
    });

    if (!chartData) {
      return next(new AppError(`No chart data found for ${symbol}`, 404));
    }

    // Extract indicators from the latest data point
    const latestData = chartData.data[chartData.data.length - 1];
    const indicators = latestData?.indicators || {};

    res.status(200).json({
      success: true,
      symbol: chartData.symbol,
      name: chartData.name,
      timeframe: chartData.timeframe,
      latestPrice: chartData.latestPrice,
      priceChange: chartData.priceChange,
      indicators
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get technical analysis for a symbol
// @route   GET /api/charts/:symbol/technical-analysis
// @access  Public
const getTechnicalAnalysis = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { timeframe = '1d' } = req.query;

    const chartData = await ChartData.findOne({
      symbol: symbol.toUpperCase(),
      timeframe
    });

    if (!chartData) {
      return next(new AppError(`No chart data found for ${symbol}`, 404));
    }

    const latestData = chartData.data[chartData.data.length - 1];
    const indicators = latestData?.indicators || {};

    // Generate technical analysis
    const analysis = {
      symbol: chartData.symbol,
      name: chartData.name,
      currentPrice: latestData?.close,
      priceChange: chartData.priceChange,
      trend: getTrendAnalysis(indicators),
      momentum: getMomentumAnalysis(indicators),
      volatility: getVolatilityAnalysis(indicators),
      signals: getSignalIndicators(indicators),
      recommendation: getOverallRecommendation(indicators)
    };

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions for technical analysis
const getTrendAnalysis = (indicators) => {
  const { sma50, sma200, ema20, ema50 } = indicators;
  let trend = 'neutral';
  
  if (sma50 && sma200) {
    if (sma50 > sma200) trend = 'bullish';
    else if (sma50 < sma200) trend = 'bearish';
  }
  
  if (ema20 && ema50) {
    if (ema20 > ema50) trend = 'bullish';
    else if (ema20 < ema50) trend = 'bearish';
  }
  
  return trend;
};

const getMomentumAnalysis = (indicators) => {
  const { rsi, macd, stochastic } = indicators;
  let momentum = 'neutral';
  
  if (rsi) {
    if (rsi > 70) momentum = 'overbought';
    else if (rsi < 30) momentum = 'oversold';
    else if (rsi > 50) momentum = 'bullish';
    else if (rsi < 50) momentum = 'bearish';
  }
  
  if (macd) {
    if (macd > 0) momentum = 'bullish';
    else if (macd < 0) momentum = 'bearish';
  }
  
  if (stochastic) {
    if (stochastic > 80) momentum = 'overbought';
    else if (stochastic < 20) momentum = 'oversold';
  }
  
  return momentum;
};

const getVolatilityAnalysis = (indicators) => {
  const { bollingerUpper, bollingerMiddle, bollingerLower } = indicators;
  let volatility = 'normal';
  
  if (bollingerUpper && bollingerMiddle && bollingerLower) {
    const upperBand = bollingerUpper - bollingerMiddle;
    const lowerBand = bollingerMiddle - bollingerLower;
    const bandWidth = (upperBand + lowerBand) / bollingerMiddle;
    
    if (bandWidth > 0.2) volatility = 'high';
    else if (bandWidth < 0.1) volatility = 'low';
  }
  
  return volatility;
};

const getSignalIndicators = (indicators) => {
  const signals = [];
  
  const { rsi, macd, sma50, sma200, bollingerUpper, bollingerMiddle, bollingerLower } = indicators;
  
  if (rsi) {
    if (rsi > 70) signals.push('RSI Overbought');
    else if (rsi < 30) signals.push('RSI Oversold');
  }
  
  if (macd) {
    if (macd > 0) signals.push('MACD Bullish');
    else if (macd < 0) signals.push('MACD Bearish');
  }
  
  if (sma50 && sma200) {
    if (sma50 > sma200) signals.push('Golden Cross');
    else if (sma50 < sma200) signals.push('Death Cross');
  }
  
  if (bollingerUpper && bollingerMiddle && bollingerLower) {
    // Would need current price to check position relative to bands
  }
  
  return signals;
};

const getOverallRecommendation = (indicators) => {
  const { rsi, macd, sma50, sma200 } = indicators;
  let score = 0;
  
  // RSI score
  if (rsi) {
    if (rsi > 70) score -= 2;
    else if (rsi < 30) score += 2;
    else if (rsi > 50) score += 1;
    else if (rsi < 50) score -= 1;
  }
  
  // MACD score
  if (macd) {
    if (macd > 0) score += 1;
    else if (macd < 0) score -= 1;
  }
  
  // Moving averages score
  if (sma50 && sma200) {
    if (sma50 > sma200) score += 2;
    else if (sma50 < sma200) score -= 2;
  }
  
  // Determine recommendation based on score
  if (score >= 3) return 'strong_buy';
  if (score >= 1) return 'buy';
  if (score <= -3) return 'strong_sell';
  if (score <= -1) return 'sell';
  return 'hold';
};

// @desc    Get market data
// @route   GET /api/charts/markets/:market
// @access  Public
const getMarketData = async (req, res, next) => {
  try {
    const { market } = req.params;
    const { timeframe = '1d', limit = 50 } = req.query;

    const chartData = await ChartData.find({
      market: market.toLowerCase(),
      timeframe
    })
      .sort({ lastUpdated: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: chartData.length,
      market,
      timeframe,
      data: chartData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get historical data
// @route   GET /api/charts/history/:symbol
// @access  Public
const getHistoricalData = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { from, to, timeframe = '1d' } = req.query;

    const chartData = await ChartData.findOne({
      symbol: symbol.toUpperCase(),
      timeframe
    });

    if (!chartData) {
      return next(new AppError(`No chart data found for ${symbol}`, 404));
    }

    // Filter data by date range if provided
    let historicalData = chartData.data || [];
    
    if (from || to) {
      const fromDate = from ? new Date(from) : null;
      const toDate = to ? new Date(to) : null;
      
      historicalData = historicalData.filter(dataPoint => {
        const dataDate = new Date(dataPoint.timestamp);
        return (!fromDate || dataDate >= fromDate) && (!toDate || dataDate <= toDate);
      });
    }

    res.status(200).json({
      success: true,
      symbol: chartData.symbol,
      name: chartData.name,
      timeframe: chartData.timeframe,
      count: historicalData.length,
      data: historicalData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create chart data
// @route   POST /api/charts/:symbol
// @access  Private/Admin
const createChartData = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const chartData = req.body;
    chartData.symbol = symbol.toUpperCase();
    chartData.createdBy = req.user.id;

    const newChartData = await ChartData.create(chartData);

    res.status(201).json({
      success: true,
      data: newChartData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update chart data
// @route   PUT /api/charts/:symbol
// @access  Private/Admin
const updateChartData = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const updates = req.body;

    const chartData = await ChartData.findOneAndUpdate(
      { symbol: symbol.toUpperCase() },
      updates,
      { new: true, runValidators: true, upsert: true }
    );

    if (!chartData) {
      return next(new AppError(`No chart data found for ${symbol}`, 404));
    }

    res.status(200).json({
      success: true,
      data: chartData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete chart data
// @route   DELETE /api/charts/:symbol
// @access  Private/Admin
const deleteChartData = async (req, res, next) => {
  try {
    const { symbol } = req.params;

    const chartData = await ChartData.findOneAndDelete({ symbol: symbol.toUpperCase() });

    if (!chartData) {
      return next(new AppError(`No chart data found for ${symbol}`, 404));
    }

    res.status(200).json({
      success: true,
      message: 'Chart data deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk update chart data
// @route   POST /api/charts/bulk-update
// @access  Private/Admin
const bulkUpdateChartData = async (req, res, next) => {
  try {
    const { chartDataList } = req.body;
    
    if (!chartDataList || !Array.isArray(chartDataList) || chartDataList.length === 0) {
      return next(new AppError('Chart data list is required', 400));
    }

    const results = [];
    
    for (const chartData of chartDataList) {
      const updated = await ChartData.findOneAndUpdate(
        { symbol: chartData.symbol.toUpperCase(), timeframe: chartData.timeframe },
        chartData,
        { new: true, runValidators: true, upsert: true }
      );
      results.push(updated);
    }

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add symbol to favorites
// @route   POST /api/charts/favorites
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
      favorites: user.favorites
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's favorite symbols
// @route   GET /api/charts/favorites
// @access  Private
const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Populate with chart data if available
    const favorites = user.favorites || [];
    
    // Optionally fetch current prices for favorites
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

// @desc    Remove symbol from favorites
// @route   DELETE /api/charts/favorites/:symbol
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
      favorites: user.favorites
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getChartData,
  getIndicators,
  getTechnicalAnalysis,
  getMarketData,
  getHistoricalData,
  createChartData,
  updateChartData,
  deleteChartData,
  bulkUpdateChartData,
  addToFavorites,
  getFavorites,
  removeFromFavorites
};
