const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Settings = require('../models/Settings');
const { verifyRecaptcha } = require('../services/recaptchaService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, callsign, email, password, recaptchaToken } = req.body;

    // Verify reCAPTCHA only if configured
    if (process.env.RECAPTCHA_SECRET_KEY) {
      const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
      if (!isRecaptchaValid) {
        return res.status(400).json({ 
          error: 'reCAPTCHA verification failed. Please complete the reCAPTCHA challenge.' 
        });
      }
    }

    // Check if user exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }, { callsign }] 
    });

    if (userExists) {
      return res.status(400).json({ 
        error: 'User with this email, username, or callsign already exists' 
      });
    }

    // Check if this is the first user (make them admin and enable them)
    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;

    // Create user (disabled by default unless first user)
    const user = await User.create({
      username,
      callsign: callsign.toUpperCase(),
      email,
      password,
      role: isFirstUser ? 'admin' : 'operator',
      isEnabled: isFirstUser // First user is automatically enabled
    });

    // Create default settings for user
    await Settings.create({
      userId: user._id
    });

    if (user) {
      if (isFirstUser) {
        // First user gets immediate access
        res.status(201).json({
          _id: user._id,
          username: user.username,
          callsign: user.callsign,
          email: user.email,
          role: user.role,
          isEnabled: user.isEnabled,
          token: generateToken(user._id),
        });
      } else {
        // Other users need admin approval
        res.status(201).json({
          message: 'Registration successful! Your account is pending admin approval. You will be able to login once an admin enables your account.',
          _id: user._id,
          username: user.username,
          callsign: user.callsign,
          email: user.email,
          role: user.role,
          isEnabled: user.isEnabled,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate and sanitize username input
    const sanitizedUsername = username.trim();
    if (sanitizedUsername.length < 3 || sanitizedUsername.length > 30) {
      return res.status(400).json({ error: 'Invalid username format' });
    }
    // Simple character validation to avoid regex vulnerabilities
    const validUsername = sanitizedUsername.split('').every(char => 
      (char >= 'a' && char <= 'z') || 
      (char >= 'A' && char <= 'Z') || 
      (char >= '0' && char <= '9') || 
      char === '_'
    );
    if (!validUsername) {
      return res.status(400).json({ error: 'Username contains invalid characters' });
    }

    // Check for user by username using parameterized query
    const user = await User.findOne({ username: { $eq: sanitizedUsername } });

    if (user && (await user.comparePassword(password))) {
      // Check if user account is enabled
      // For backward compatibility: if isEnabled field doesn't exist, treat as enabled
      const isEnabled = user.isEnabled !== undefined ? user.isEnabled : true;
      if (!isEnabled) {
        return res.status(403).json({ 
          error: 'Your account is pending admin approval. Please wait for an admin to enable your account before logging in.' 
        });
      }

      res.json({
        _id: user._id,
        username: user.username,
        callsign: user.callsign,
        email: user.email,
        role: user.role,
        isEnabled: user.isEnabled,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    // For backward compatibility: ensure isEnabled field exists
    // If field doesn't exist (old users), default to true
    const userData = user.toObject();
    if (userData.isEnabled === undefined) {
      userData.isEnabled = true;
    }
    
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

