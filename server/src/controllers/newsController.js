const News = require('../models/News');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// @desc    Get all news with filters
// @route   GET /api/news
// @access  Public
const getAllNews = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'publishedAt',
      sortOrder = 'desc',
      category,
      market,
      sentiment,
      priority,
      search
    } = req.query;

    // Build query
    const query = { status: 'published' };
    
    if (category) query.category = category;
    if (market) query.market = market;
    if (sentiment) query.sentiment = sentiment;
    if (priority) query.priority = priority;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { keywords: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
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

// @desc    Get news by ID
// @route   GET /api/news/:id
// @access  Public
const getNewsById = async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id)
      .populate('createdBy', 'username firstName lastName email')
      .populate('likes', 'username firstName lastName');

    if (!news || news.status !== 'published') {
      return next(new AppError('News not found', 404));
    }

    // Increment view count
    news.views = (news.views || 0) + 1;
    await news.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: news
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get news by category
// @route   GET /api/news/category/:category
// @access  Public
const getNewsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { limit = 10, page = 1 } = req.query;

    const news = await News.find({
      category,
      status: 'published'
    })
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('createdBy', 'username firstName lastName');

    const total = await News.countDocuments({
      category,
      status: 'published'
    });

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

// @desc    Get news by market
// @route   GET /api/news/market/:market
// @access  Public
const getNewsByMarket = async (req, res, next) => {
  try {
    const { market } = req.params;
    const { limit = 10, page = 1 } = req.query;

    const news = await News.find({
      market: market === 'all' ? { $exists: true } : market,
      status: 'published'
    })
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('createdBy', 'username firstName lastName');

    const total = await News.countDocuments({
      market: market === 'all' ? { $exists: true } : market,
      status: 'published'
    });

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

// @desc    Get latest news
// @route   GET /api/news/latest
// @access  Public
const getLatestNews = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;

    const news = await News.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit))
      .populate('createdBy', 'username firstName lastName');

    res.status(200).json({
      success: true,
      count: news.length,
      data: news
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured news
// @route   GET /api/news/featured
// @access  Public
const getFeaturedNews = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;

    const news = await News.find({
      isFeatured: true,
      status: 'published'
    })
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit))
      .populate('createdBy', 'username firstName lastName');

    res.status(200).json({
      success: true,
      count: news.length,
      data: news
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get breaking news
// @route   GET /api/news/breaking
// @access  Public
const getBreakingNews = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;

    const news = await News.find({
      priority: 'breaking',
      status: 'published'
    })
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit))
      .populate('createdBy', 'username firstName lastName');

    res.status(200).json({
      success: true,
      count: news.length,
      data: news
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search news
// @route   GET /api/news/search
// @access  Public
const searchNews = async (req, res, next) => {
  try {
    const { q: query, limit = 10, page = 1 } = req.query;

    if (!query) {
      return next(new AppError('Search query is required', 400));
    }

    const news = await News.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { summary: { $regex: query, $options: 'i' } },
        { keywords: { $in: [new RegExp(query, 'i')] } },
        { relatedSymbols: { $in: [new RegExp(query, 'i')] } }
      ],
      status: 'published'
    })
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('createdBy', 'username firstName lastName');

    const total = await News.countDocuments({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { summary: { $regex: query, $options: 'i' } },
        { keywords: { $in: [new RegExp(query, 'i')] } },
        { relatedSymbols: { $in: [new RegExp(query, 'i')] } }
      ],
      status: 'published'
    });

    res.status(200).json({
      success: true,
      count: news.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      query,
      data: news
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create news
// @route   POST /api/news
// @access  Private/Admin
const createNews = async (req, res, next) => {
  try {
    const newsData = req.body;
    newsData.createdBy = req.user.id;

    // If AI-generated, mark it
    if (newsData.isAIGenerated) {
      newsData.aiModel = newsData.aiModel || 'default-ai';
    }

    const news = await News.create(newsData);

    // Populate createdBy
    await news.populate('createdBy', 'username firstName lastName');

    res.status(201).json({
      success: true,
      data: news
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update news
// @route   PUT /api/news/:id
// @access  Private/Admin
const updateNews = async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return next(new AppError('News not found', 404));
    }

    const updatedNews = await News.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username firstName lastName');

    res.status(200).json({
      success: true,
      data: updatedNews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete news
// @route   DELETE /api/news/:id
// @access  Private/Admin
const deleteNews = async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return next(new AppError('News not found', 404));
    }

    await News.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'News deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Feature news
// @route   POST /api/news/:id/feature
// @access  Private/Admin
const featureNews = async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return next(new AppError('News not found', 404));
    }

    news.isFeatured = true;
    await news.save();

    res.status(200).json({
      success: true,
      data: news
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unfeature news
// @route   POST /api/news/:id/unfeature
// @access  Private/Admin
const unfeatureNews = async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return next(new AppError('News not found', 404));
    }

    news.isFeatured = false;
    await news.save();

    res.status(200).json({
      success: true,
      data: news
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bookmark news
// @route   POST /api/news/bookmark/:id
// @access  Private
const bookmarkNews = async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news || news.status !== 'published') {
      return next(new AppError('News not found', 404));
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Check if already bookmarked
    if (user.bookmarks && user.bookmarks.includes(req.params.id)) {
      return next(new AppError('News already bookmarked', 400));
    }

    // Add to bookmarks
    if (!user.bookmarks) {
      user.bookmarks = [];
    }
    user.bookmarks.push(req.params.id);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'News bookmarked',
      bookmarks: user.bookmarks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's bookmarked news
// @route   GET /api/news/bookmarks
// @access  Private
const getBookmarkedNews = async (req, res, next) => {
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

// @desc    Remove bookmark
// @route   DELETE /api/news/bookmark/:id
// @access  Private
const removeBookmark = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Remove from bookmarks
    if (user.bookmarks) {
      user.bookmarks = user.bookmarks.filter(id => id.toString() !== req.params.id);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Bookmark removed',
      bookmarks: user.bookmarks
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllNews,
  getNewsById,
  getNewsByCategory,
  getNewsByMarket,
  getLatestNews,
  getFeaturedNews,
  getBreakingNews,
  searchNews,
  createNews,
  updateNews,
  deleteNews,
  featureNews,
  unfeatureNews,
  bookmarkNews,
  getBookmarkedNews,
  removeBookmark
};
