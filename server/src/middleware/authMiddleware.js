const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// @desc    Protect routes - verify JWT token
// @access  Private
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new AppError('Not authorized to access this route. Please login.', 401));
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return next(new AppError('Invalid token. Please login again.', 401));
    }

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('No user found with this id', 404));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new AppError('Account is deactivated. Please contact support.', 403));
    }

    // Attach user to request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    next(error);
  }
};

// @desc    Authorize roles
// @access  Private/Admin
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`User role ${req.user.role} is not authorized to access this route`, 403));
    }
    next();
  };
};

// @desc    Check if user is admin
// @access  Private/Admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return next(new AppError('Not authorized as admin', 403));
  }
  next();
};

// @desc    Check if user is superadmin
// @access  Private/SuperAdmin
const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    return next(new AppError('Not authorized as superadmin', 403));
  }
  next();
};

// @desc    Rate limiting middleware
// @access  Public
const rateLimit = (limit = 100, windowMs = 15 * 60 * 1000) => {
  const rateLimiter = require('express-rate-limit');
  return rateLimiter({
    windowMs,
    max: limit,
    message: `Too many requests from this IP, please try again after ${windowMs / 60000} minutes`
  });
};

// @desc    Validate request body
// @access  Public
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return next(new AppError(errorMessage, 400));
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
  isAdmin,
  isSuperAdmin,
  rateLimit,
  validateRequest
};
