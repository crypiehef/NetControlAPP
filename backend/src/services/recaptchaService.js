const axios = require('axios');

/**
 * Verify reCAPTCHA token with Google
 * @param {string} token - The reCAPTCHA token from the client
 * @returns {Promise<boolean>} - Returns true if verification succeeds
 */
const verifyRecaptcha = async (token) => {
  try {
    // If reCAPTCHA not configured, always return true (skip verification)
    if (!process.env.RECAPTCHA_SECRET_KEY) {
      return true; // Skip verification if not configured
    }

    // If configured but no token provided, fail verification
    if (!token) {
      console.warn('reCAPTCHA token not provided but secret key is configured');
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

