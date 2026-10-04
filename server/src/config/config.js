const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development'
  },

  // Database configuration
  database: {
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/boy-ly-trading',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    }
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expire: process.env.JWT_EXPIRE || '30d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
    resetSecret: process.env.JWT_RESET_SECRET || 'your-reset-secret-key-change-in-production'
  },

  // Email configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true' || false,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@boy-ly-trading.com'
  },

  // SMS configuration (Twilio)
  sms: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '+1234567890'
  },

  // Client configuration
  client: {
    url: process.env.CLIENT_URL || 'http://localhost:3000',
    adminUrl: process.env.ADMIN_URL || 'http://localhost:3001'
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },

  // File upload configuration
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    uploadPath: './uploads',
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
  },

  // AI Configuration
  ai: {
    enabled: process.env.AI_ENABLED === 'true' || true,
    apiKey: process.env.AI_API_KEY,
    model: process.env.AI_MODEL || 'default',
    endpoint: process.env.AI_ENDPOINT
  },

  // Security
  security: {
    helmetEnabled: true,
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:3001']
  }
};

// Validate required configuration
const validateConfig = () => {
  const required = [];
  
  // In production, these are required
  if (config.server.isProduction) {
    if (!process.env.JWT_SECRET) required.push('JWT_SECRET');
    if (!process.env.MONGODB_URI) required.push('MONGODB_URI');
  }

  if (required.length > 0) {
    console.warn(`Missing required environment variables: ${required.join(', ')}`);
  }
};

// Export configuration
module.exports = config;

// Validate on startup
validateConfig();
