const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendEmail } = require('../utils/emailSender');
const { sendSMS } = require('../utils/smsSender');
const AppError = require('../utils/AppError');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return next(new AppError('User already exists with this email or username', 400));
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      phone
    });

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Send verification email
    const verificationToken = user.generateResetToken();
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email - Boy-ly Trading',
      html: `
        <h2>Welcome to Boy-ly Trading Signals!</h2>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      token,
      refreshToken,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new AppError('Account is deactivated. Please contact support.', 403));
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      token,
      refreshToken,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('No user found with this email', 404));
    }

    // Generate reset token
    const resetToken = user.generateResetToken();
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Send reset email
    await sendEmail({
      to: user.email,
      subject: 'Password Reset - Boy-ly Trading',
      html: `
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Click the link below to reset it:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
      `
    });

    res.status(200).json({
      success: true,
      message: 'Password reset email sent. Check your inbox.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_RESET_SECRET || 'your-reset-secret-key');
    } catch (error) {
      return next(new AppError('Invalid or expired token', 400));
    }

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('No user found', 404));
    }

    // Update password
    user.password = password;
    await user.save();

    // Generate new token
    const newToken = generateToken(user);

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: 'Password Changed - Boy-ly Trading',
      html: `
        <h2>Password Changed</h2>
        <p>Your password has been successfully changed.</p>
        <p>If you didn't request this change, please contact support immediately.</p>
      `
    });

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      token: newToken,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email
// @route   POST /api/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_RESET_SECRET || 'your-reset-secret-key');
    } catch (error) {
      return next(new AppError('Invalid or expired token', 400));
    }

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('No user found', 404));
    }

    // Check if already verified
    if (user.isVerified) {
      return next(new AppError('Email already verified', 400));
    }

    // Update verification status
    user.isVerified = true;
    await user.save({ validateBeforeSave: false });

    // Generate token
    const newToken = generateToken(user);

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      token: newToken,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError('Refresh token is required', 400));
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key');
    } catch (error) {
      return next(new AppError('Invalid or expired refresh token', 401));
    }

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('No user found', 404));
    }

    // Generate new tokens
    const token = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      token,
      refreshToken: newRefreshToken,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    // In JWT, logout is handled client-side by removing the token
    // We can add token to blacklist if needed
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('No user found', 404));
    }

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return next(new AppError('No user found', 404));
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(new AppError('Current password is incorrect', 400));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = generateToken(user);

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/update-profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, profileImage, preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, phone, profileImage, preferences },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new AppError('No user found', 404));
    }

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Google authentication
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res, next) => {
  try {
    const { token, email, name, picture } = req.body;

    // Find user by email or create new one
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user from Google data
      const username = email.split('@')[0] + '-' + crypto.randomBytes(4).toString('hex');
      user = await User.create({
        username,
        email,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' '),
        profileImage: picture,
        isVerified: true,
        password: crypto.randomBytes(20).toString('hex') // Random password since Google users don't have one
      });
    }

    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      token: accessToken,
      refreshToken,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Enable two-factor authentication
// @route   POST /api/auth/enable-2fa
// @access  Private
const enableTwoFactorAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('No user found', 404));
    }

    // Generate 2FA secret and send to user's phone
    const secret = crypto.randomBytes(10).toString('hex');
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // In production, you would store the secret in the database
    // For now, we'll just send the code via SMS
    if (user.phone) {
      await sendSMS({
        to: user.phone,
        message: `Your Boy-ly Trading 2FA code: ${code}`
      });
    }

    // Store the code temporarily (in production, use a proper 2FA library)
    user.twoFactorCode = code;
    user.twoFactorExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: '2FA code sent to your phone',
      secret // In production, don't send secret to client
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify two-factor authentication
// @route   POST /api/auth/verify-2fa
// @access  Private
const verifyTwoFactorAuth = async (req, res, next) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new AppError('No user found', 404));
    }

    // Check if 2FA is enabled and code is valid
    if (!user.twoFactorCode || user.twoFactorCode !== code) {
      return next(new AppError('Invalid 2FA code', 400));
    }

    // Check if code has expired
    if (user.twoFactorExpires && user.twoFactorExpires < new Date()) {
      return next(new AppError('2FA code has expired', 400));
    }

    // Clear the temporary code
    user.twoFactorCode = undefined;
    user.twoFactorExpires = undefined;
    user.twoFactorEnabled = true;
    await user.save({ validateBeforeSave: false });

    // Generate new token with 2FA verified
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, twoFactorVerified: true },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    res.status(200).json({
      success: true,
      token,
      message: '2FA verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Disable two-factor authentication
// @route   POST /api/auth/disable-2fa
// @access  Private
const disableTwoFactorAuth = async (req, res, next) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new AppError('No user found', 404));
    }

    // Verify current 2FA code before disabling
    if (user.twoFactorEnabled) {
      if (!user.twoFactorCode || user.twoFactorCode !== code) {
        return next(new AppError('Invalid 2FA code', 400));
      }

      if (user.twoFactorExpires && user.twoFactorExpires < new Date()) {
        return next(new AppError('2FA code has expired', 400));
      }
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorCode = undefined;
    user.twoFactorExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: '2FA disabled successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyEmail,
  refreshToken,
  logout,
  getMe,
  updatePassword,
  updateProfile,
  googleAuth,
  enableTwoFactorAuth,
  verifyTwoFactorAuth,
  disableTwoFactorAuth
};
