const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  createUser,
  deleteUser,
  resetPassword,
  updateUserRole,
  updateUser,
  toggleUserEnabled,
  generateReport
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { apiLimiter } = require('../middleware/rateLimiter');
const { 
  validateUpdateUser, 
  validateMongoId,
  validateReportQuery 
} = require('../middleware/validation');

// All routes require auth and admin role with rate limiting
router.use(apiLimiter, auth, admin);

router.get('/', getAllUsers);
router.post('/', validateUpdateUser, createUser);
router.post('/reports/generate', validateReportQuery, generateReport);
router.put('/:id', validateMongoId, validateUpdateUser, updateUser);
router.delete('/:id', validateMongoId, deleteUser);
router.put('/:id/reset-password', validateMongoId, resetPassword);
router.put('/:id/role', validateMongoId, updateUserRole);
router.put('/:id/enable', validateMongoId, toggleUserEnabled);

module.exports = router;

