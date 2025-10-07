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

router.get('/', auth, getSettings);
router.put('/', auth, updateSettings);
router.post('/logo', auth, upload.single('logo'), uploadLogo);
router.delete('/logo', auth, deleteLogo);

module.exports = router;

