const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true' || false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test email configuration
const testEmailConfig = async () => {
  try {
    if (process.env.NODE_ENV === 'development') {
      // In development, use ethereal for testing
      const testAccount = await nodemailer.createTestAccount();
      console.log('Development email test account:', testAccount);
    }
  } catch (error) {
    console.log('Email configuration test failed:', error.message);
  }
};

// Send email function
const sendEmail = async (options) => {
  try {
    // Set default options
    const defaults = {
      from: process.env.EMAIL_FROM || 'noreply@boy-ly-trading.com',
      to: '',
      subject: '',
      text: '',
      html: ''
    };

    const emailOptions = { ...defaults, ...options };

    // Validate required fields
    if (!emailOptions.to) {
      throw new Error('Recipient email address is required');
    }

    if (!emailOptions.subject && !emailOptions.html && !emailOptions.text) {
      throw new Error('Email must have subject or content');
    }

    // Send email
    const info = await transporter.sendMail(emailOptions);

    // In development, log the preview URL
    if (process.env.NODE_ENV === 'development' && info.message) {
      console.log('Email sent: %s', info.message);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Send bulk emails
const sendBulkEmails = async (emails, options) => {
  try {
    const results = [];
    
    for (const email of emails) {
      try {
        const result = await sendEmail({ ...options, to: email });
        results.push({ email, status: 'sent', result });
      } catch (error) {
        results.push({ email, status: 'failed', error: error.message });
      }
    }

    return results;
  } catch (error) {
    console.error('Error sending bulk emails:', error);
    throw error;
  }
};

// Email templates
const emailTemplates = {
  welcome: (name, verificationUrl) => ({
    subject: `Welcome to Boy-ly Trading, ${name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Boy-ly Trading Signals!</h2>
        <p>Hello ${name},</p>
        <p>Thank you for joining Boy-ly Trading, your AI-powered trading signals platform.</p>
        <p>Please verify your email address to get started:</p>
        <p><a href="${verificationUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a></p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The Boy-ly Trading Team</p>
      </div>
    `
  }),

  passwordReset: (name, resetUrl) => ({
    subject: 'Password Reset Request - Boy-ly Trading',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hello ${name},</p>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <p><a href="${resetUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
        <p>This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The Boy-ly Trading Team</p>
      </div>
    `
  }),

  signalAlert: (signal, user) => ({
    subject: `New Trading Signal: ${signal.symbol}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>🚀 New Trading Signal Alert</h2>
        <p>Hello ${user.firstName || user.username},</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>${signal.signalType.toUpperCase()}: ${signal.symbol}</h3>
          <p><strong>Name:</strong> ${signal.name}</p>
          <p><strong>Entry Price:</strong> $${signal.entryPrice}</p>
          <p><strong>Target Price:</strong> $${signal.targetPrice || 'N/A'}</p>
          <p><strong>Stop Loss:</strong> $${signal.stopLoss || 'N/A'}</p>
          <p><strong>Confidence:</strong> ${signal.confidenceLevel}%</p>
          <p><strong>Market:</strong> ${signal.market}</p>
          ${signal.description ? `<p><strong>Description:</strong> ${signal.description}</p>` : ''}
        </div>
        <p>This signal was generated at ${new Date(signal.createdAt).toLocaleString()}</p>
        <p>Best regards,<br>The Boy-ly Trading Team</p>
      </div>
    `
  }),

  newsAlert: (news, user) => ({
    subject: `Breaking News: ${news.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>📰 Breaking News Alert</h2>
        <p>Hello ${user.firstName || user.username},</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>${news.title}</h3>
          <p><strong>Category:</strong> ${news.category}</p>
          <p><strong>Market:</strong> ${news.market}</p>
          <p><strong>Sentiment:</strong> ${news.sentiment}</p>
          <p>${news.summary || news.content.substring(0, 200)}...</p>
          ${news.url ? `<p><a href="${news.url}">Read more</a></p>` : ''}
        </div>
        <p>Published at ${new Date(news.publishedAt).toLocaleString()}</p>
        <p>Best regards,<br>The Boy-ly Trading Team</p>
      </div>
    `
  })
};

// Initialize email service
testEmailConfig();

module.exports = {
  sendEmail,
  sendBulkEmails,
  emailTemplates,
  transporter
};
