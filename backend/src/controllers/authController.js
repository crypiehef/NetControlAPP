const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Settings = require('../models/Settings');

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
    const { username, callsign, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }, { callsign }] 
    });

    if (userExists) {
      return res.status(400).json({ 
        error: 'User with this email, username, or callsign already exists' 
      });
    }

    // Check if this is the first user (make them admin)
    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;

    // Create user
    const user = await User.create({
      username,
      callsign: callsign.toUpperCase(),
      email,
      password,
      role: isFirstUser ? 'admin' : 'operator'
    });

    // Create default settings for user
    await Settings.create({
      userId: user._id
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        callsign: user.callsign,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
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

    // Check for user by username
    const user = await User.findOne({ username: sanitizedUsername });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        callsign: user.callsign,
        email: user.email,
        role: user.role,
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
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

