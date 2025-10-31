const axios = require('axios');

/**
 * Verify reCAPTCHA token with Google
 * @param {string} token - The reCAPTCHA token from the client
 * @returns {Promise<boolean>} - Returns true if verification succeeds
 */
const verifyRecaptcha = async (token) => {
  try {
    if (!process.env.RECAPTCHA_SECRET_KEY) {
      console.warn('RECAPTCHA_SECRET_KEY not set - skipping verification');
      // In development, allow bypassing reCAPTCHA if not configured
      return process.env.NODE_ENV !== 'production';
    }

    if (!token) {
      return false;
    }

    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: token,
        },
        timeout: 5000, // 5 second timeout
      }
    );

    return response.data && response.data.success === true;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error.message);
    return false;
  }
};

module.exports = {
  verifyRecaptcha,
};

