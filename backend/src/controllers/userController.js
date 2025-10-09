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

    // Validate and sanitize inputs
    const sanitizeString = (str) => {
      if (typeof str !== 'string') return str;
      return str.replace(/[<>\"'%;()&+]/g, '').trim();
    };

    // Check if username is already taken by another user
    if (username && username !== user.username) {
      const sanitizedUsername = sanitizeString(username);
      if (sanitizedUsername.length < 3 || sanitizedUsername.length > 30) {
        return res.status(400).json({ error: 'Username must be 3-30 characters' });
      }
      // Simple character validation to avoid regex vulnerabilities
      const validUsername = sanitizedUsername.split('').every(char => 
        (char >= 'a' && char <= 'z') || 
        (char >= 'A' && char <= 'Z') || 
        (char >= '0' && char <= '9') || 
        char === '_'
      );
      if (!validUsername) {
        return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
      }
      // Use parameterized query with additional validation
      const existingUser = await User.findOne({ 
        username: { $eq: sanitizedUsername } 
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      user.username = sanitizedUsername;
    }

    // Check if callsign is already taken by another user
    if (callsign && callsign.toUpperCase() !== user.callsign) {
      const sanitizedCallsign = sanitizeString(callsign).toUpperCase();
      if (sanitizedCallsign.length < 3 || sanitizedCallsign.length > 10) {
        return res.status(400).json({ error: 'Callsign must be 3-10 characters' });
      }
      // Simple character validation to avoid regex vulnerabilities
      const validCallsign = sanitizedCallsign.split('').every(char => 
        (char >= 'A' && char <= 'Z') || 
        (char >= '0' && char <= '9') || 
        char === '/'
      );
      if (!validCallsign) {
        return res.status(400).json({ error: 'Callsign can only contain letters, numbers, and forward slashes' });
      }
      // Use parameterized query with additional validation
      const existingUser = await User.findOne({ 
        callsign: { $eq: sanitizedCallsign } 
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Callsign already exists' });
      }
      user.callsign = sanitizedCallsign;
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      // Simple email validation to avoid regex vulnerabilities
      const emailParts = email.split('@');
      if (emailParts.length !== 2 || emailParts[0].length === 0 || emailParts[1].length === 0) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      const domainParts = emailParts[1].split('.');
      if (domainParts.length < 2 || domainParts.some(part => part.length === 0)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      // Use parameterized query with additional validation
      const existingUser = await User.findOne({ 
        email: { $eq: email } 
      });
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

    console.log('Report request received:', { operatorId, startDate, endDate });

    // Build secure query with validated inputs only
    let operations;
    
    // Validate operatorId if provided
    let validatedOperatorId = null;
    if (operatorId && operatorId !== 'all') {
      // Validate operatorId format
      if (operatorId.length !== 24 || !operatorId.split('').every(char => 
        (char >= '0' && char <= '9') || 
        (char >= 'a' && char <= 'f') || 
        (char >= 'A' && char <= 'F')
      )) {
        return res.status(400).json({ error: 'Invalid operator ID format' });
      }
      
      // Use parameterized query with validated ObjectId
      const mongoose = require('mongoose');
      try {
        validatedOperatorId = new mongoose.Types.ObjectId(operatorId);
      } catch (error) {
        return res.status(400).json({ error: 'Invalid operator ID format' });
      }
    }

    // Build secure date filters
    let dateFilter = {};
    try {
      // Filter by date range - validate and sanitize dates
      if (startDate && !endDate) {
        // Single date - get all operations on this day (use UTC)
        const dayStart = new Date(startDate);
        if (isNaN(dayStart.getTime())) {
          return res.status(400).json({ error: 'Invalid start date format' });
        }
        dayStart.setUTCHours(0, 0, 0, 0);
        const dayEnd = new Date(startDate);
        dayEnd.setUTCHours(23, 59, 59, 999);
        dateFilter = { $gte: dayStart, $lte: dayEnd };
      } else if (!startDate && endDate) {
        // End date only - all operations up to this date
        const dayEnd = new Date(endDate);
        if (isNaN(dayEnd.getTime())) {
          return res.status(400).json({ error: 'Invalid end date format' });
        }
        dayEnd.setUTCHours(23, 59, 59, 999);
        dateFilter = { $lte: dayEnd };
      } else if (startDate && endDate) {
        // Date range (use UTC)
        const rangeStart = new Date(startDate);
        const rangeEnd = new Date(endDate);
        if (isNaN(rangeStart.getTime()) || isNaN(rangeEnd.getTime())) {
          return res.status(400).json({ error: 'Invalid date format' });
        }
        rangeStart.setUTCHours(0, 0, 0, 0);
        rangeEnd.setUTCHours(23, 59, 59, 999);
        dateFilter = { $gte: rangeStart, $lte: rangeEnd };
      }
    } catch (error) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // Build secure query object with only validated data
    const secureQuery = {};
    
    // Add operator filter if validated
    if (validatedOperatorId) {
      secureQuery.operatorId = validatedOperatorId;
    }
    
    // Add date filter if provided
    if (Object.keys(dateFilter).length > 0) {
      secureQuery.startTime = dateFilter;
    }

    console.log('Secure Report Query:', {
      operatorId: validatedOperatorId ? 'validated' : 'none',
      dateFilter: Object.keys(dateFilter).length > 0 ? 'applied' : 'none'
    });

    // Execute secure query
    operations = await NetOperation.find(secureQuery)
      .populate('operatorId', 'username callsign')
      .sort({ startTime: -1 });

    console.log(`Found ${operations.length} operations for report`);
    if (operations.length > 0) {
      console.log('Sample operation:', {
        id: operations[0]._id,
        operator: operations[0].operatorCallsign,
        startTime: operations[0].startTime,
        status: operations[0].status
      });
    }

    if (operations.length === 0) {
      return res.status(404).json({ error: 'No operations found matching the criteria' });
    }

    // Get operator info for report
    let operatorCallsign = 'All Operators';
    if (operatorId && operatorId !== 'all') {
      // Validate operatorId format before querying (avoid regex vulnerabilities)
      if (operatorId.length === 24 && operatorId.split('').every(char => 
        (char >= '0' && char <= '9') || 
        (char >= 'a' && char <= 'f') || 
        (char >= 'A' && char <= 'F')
      )) {
        // Use parameterized query with ObjectId validation
        const operator = await User.findOne({ _id: { $eq: operatorId } });
        if (operator) {
          operatorCallsign = operator.callsign;
        }
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
    console.error('Report generation error:', error);
    res.status(500).json({ error: error.message });
  }
};

