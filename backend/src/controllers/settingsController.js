const Settings = require('../models/Settings');
const path = require('path');
const fs = require('fs');

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.user._id });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await Settings.create({
        userId: req.user._id
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update user settings
// @route   PUT /api/settings
// @access  Private
exports.updateSettings = async (req, res) => {
  try {
    const { theme, qrzApiKey } = req.body;

    let settings = await Settings.findOne({ userId: req.user._id });

    if (!settings) {
      settings = await Settings.create({
        userId: req.user._id,
        theme,
        qrzApiKey
      });
    } else {
      if (theme) settings.theme = theme;
      if (qrzApiKey !== undefined) settings.qrzApiKey = qrzApiKey;
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Upload logo
// @route   POST /api/settings/logo
// @access  Private
exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let settings = await Settings.findOne({ userId: req.user._id });

    // Delete old logo if exists
    if (settings && settings.logo) {
      const oldLogoPath = path.join(__dirname, '../../uploads', path.basename(settings.logo));
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }

    const logoUrl = `/uploads/${req.file.filename}`;

    if (!settings) {
      settings = await Settings.create({
        userId: req.user._id,
        logo: logoUrl
      });
    } else {
      settings.logo = logoUrl;
      await settings.save();
    }

    res.json({ logo: logoUrl, message: 'Logo uploaded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete logo
// @route   DELETE /api/settings/logo
// @access  Private
exports.deleteLogo = async (req, res) => {
  try {
    const settings = await Settings.findOne({ userId: req.user._id });

    if (!settings || !settings.logo) {
      return res.status(404).json({ error: 'No logo found' });
    }

    // Delete logo file
    const logoPath = path.join(__dirname, '../../uploads', path.basename(settings.logo));
    if (fs.existsSync(logoPath)) {
      fs.unlinkSync(logoPath);
    }

    settings.logo = '';
    await settings.save();

    res.json({ message: 'Logo deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

