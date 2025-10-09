const User = require('../models/User');
const Settings = require('../models/Settings');
const NetOperation = require('../models/NetOperation');
const bcrypt = require('bcryptjs');
const reportService = require('../services/reportService');
const path = require('path');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create new user (by admin)
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    const { username, callsign, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }, { callsign }] 
    });

    if (userExists) {
      return res.status(400).json({ 
        error: 'User with this email, username, or callsign already exists' 
      });
    }

    // Create user
    const user = await User.create({
      username,
      callsign: callsign.toUpperCase(),
      email,
      password,
      role: role || 'operator'
    });

    // Create default settings for user
    await Settings.create({
      userId: user._id
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      callsign: user.callsign,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    // Delete user's settings
    await Settings.deleteMany({ userId: user._id });

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Reset user password
// @route   PUT /api/users/:id/reset-password
// @access  Private/Admin
exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['operator', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent changing your own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'You cannot change your own role' });
    }

    user.role = role;
    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      callsign: user.callsign,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update user information
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { username, callsign, email } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if username is already taken by another user
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      user.username = username;
    }

    // Check if callsign is already taken by another user
    if (callsign && callsign.toUpperCase() !== user.callsign) {
      const existingUser = await User.findOne({ callsign: callsign.toUpperCase() });
      if (existingUser) {
        return res.status(400).json({ error: 'Callsign already exists' });
      }
      user.callsign = callsign.toUpperCase();
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      user.email = email;
    }

    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      callsign: user.callsign,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Generate operations report
// @route   POST /api/users/reports/generate
// @access  Private/Admin
exports.generateReport = async (req, res) => {
  try {
    const { operatorId, startDate, endDate } = req.body;

    // Build query
    let query = {};

    // Filter by operator (if not "all")
    if (operatorId && operatorId !== 'all') {
      query.operatorId = operatorId;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) {
        query.startTime.$gte = new Date(startDate);
      }
      if (endDate) {
        // Add one day to include the end date fully
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query.startTime.$lte = endDateTime;
      }
    }

    // Fetch operations with populated operator data
    const operations = await NetOperation.find(query)
      .populate('operatorId', 'username callsign')
      .sort({ startTime: -1 });

    if (operations.length === 0) {
      return res.status(404).json({ error: 'No operations found matching the criteria' });
    }

    // Get operator info for report
    let operatorCallsign = 'All Operators';
    if (operatorId && operatorId !== 'all') {
      const operator = await User.findById(operatorId);
      if (operator) {
        operatorCallsign = operator.callsign;
      }
    }

    // Get admin's logo if available
    const settings = await Settings.findOne({ userId: req.user._id });
    let logoPath = null;
    
    if (settings && settings.logo) {
      logoPath = path.join(__dirname, '../../uploads', path.basename(settings.logo));
    }

    // Generate PDF
    const filters = {
      operator: operatorId,
      operatorCallsign,
      startDate,
      endDate
    };

    const pdfBuffer = await reportService.generateOperationsReport(operations, filters, logoPath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=net-operations-report-${Date.now()}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

