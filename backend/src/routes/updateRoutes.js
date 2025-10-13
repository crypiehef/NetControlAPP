const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { apiLimiter } = require('../middleware/rateLimiter');
const {
  checkForUpdates,
  performUpdate,
  getVersionInfo
} = require('../controllers/updateController');

// All routes require rate limit, authentication and admin role
router.use(apiLimiter);
router.use(auth);
router.use(admin);

// Check for updates
router.get('/check', apiLimiter, checkForUpdates);

// Perform update
router.post('/perform', apiLimiter, performUpdate);

// Get current version info
router.get('/version', apiLimiter, getVersionInfo);

module.exports = router;

