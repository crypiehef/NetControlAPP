const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  uploadLogo,
  deleteLogo
} = require('../controllers/settingsController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { handleMulterError } = require('../middleware/upload');
const { apiLimiter, uploadLimiter } = require('../middleware/rateLimiter');
const { validateSettings } = require('../middleware/validation');

router.get('/', apiLimiter, auth, getSettings);
router.put('/', apiLimiter, auth, validateSettings, updateSettings);
router.post('/logo', uploadLimiter, auth, upload.single('logo'), handleMulterError, uploadLogo);
router.delete('/logo', apiLimiter, auth, deleteLogo);

module.exports = router;

