const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
  checkForUpdates,
  performUpdate,
  getVersionInfo
} = require('../controllers/updateController');

// All routes require authentication and admin role
router.use(auth);
router.use(admin);

// Check for updates
router.get('/check', checkForUpdates);

// Perform update
router.post('/perform', performUpdate);

// Get current version info
router.get('/version', getVersionInfo);

module.exports = router;

