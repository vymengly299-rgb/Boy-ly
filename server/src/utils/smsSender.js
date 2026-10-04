const twilio = require('twilio');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Twilio client
let twilioClient;

try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
} catch (error) {
  console.error('Error initializing Twilio client:', error);
}

// Send SMS function
const sendSMS = async (options) => {
  try {
    // Set default options
    const defaults = {
      from: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
      to: '',
      message: ''
    };

    const smsOptions = { ...defaults, ...options };

    // Validate required fields
    if (!smsOptions.to) {
      throw new Error('Recipient phone number is required');
    }

    if (!smsOptions.message) {
      throw new Error('Message content is required');
    }

    // In development, log the SMS instead of sending
    if (process.env.NODE_ENV === 'development' || !twilioClient) {
      console.log(`[DEV SMS] To: ${smsOptions.to}, Message: ${smsOptions.message}`);
      return { success: true, message: 'SMS logged (development mode)' };
    }

    // Send SMS via Twilio
    const message = await twilioClient.messages.create({
      body: smsOptions.message,
      from: smsOptions.from,
      to: smsOptions.to
    });

    console.log(`SMS sent to ${smsOptions.to}: ${message.sid}`);
    
    return { success: true, messageSid: message.sid };
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

// Send bulk SMS
const sendBulkSMS = async (phoneNumbers, message) => {
  try {
    const results = [];
    
    for (const phoneNumber of phoneNumbers) {
      try {
        const result = await sendSMS({ to: phoneNumber, message });
        results.push({ phoneNumber, status: 'sent', result });
      } catch (error) {
        results.push({ phoneNumber, status: 'failed', error: error.message });
      }
    }

    return results;
  } catch (error) {
    console.error('Error sending bulk SMS:', error);
    throw error;
  }
};

// SMS templates
const smsTemplates = {
  signalAlert: (signal) => {
    return `🚀 New Signal: ${signal.symbol} - ${signal.signalType.toUpperCase()} at $${signal.entryPrice}. Target: $${signal.targetPrice || 'N/A'}, Stop: $${signal.stopLoss || 'N/A'}`;
  },

  newsAlert: (news) => {
    return `📰 Breaking News: ${news.title}. Category: ${news.category}. ${news.summary || news.content.substring(0, 100)}...`;
  },

  priceAlert: (symbol, condition, value) => {
    return `📊 Price Alert: ${symbol} is now ${condition} $${value}`;
  },

  verificationCode: (code) => {
    return `Your Boy-ly Trading verification code: ${code}`;
  },

  twoFactorCode: (code) => {
    return `Your Boy-ly Trading 2FA code: ${code}`;
  }
};

module.exports = {
  sendSMS,
  sendBulkSMS,
  smsTemplates,
  twilioClient
};
