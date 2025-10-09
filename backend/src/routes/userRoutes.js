const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  createUser,
  deleteUser,
  resetPassword,
  updateUserRole,
  updateUser,
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

// All routes require auth and admin role
router.use(auth, admin);

router.get('/', apiLimiter, getAllUsers);
router.post('/', apiLimiter, validateUpdateUser, createUser);
router.post('/reports/generate', apiLimiter, validateReportQuery, generateReport);
router.put('/:id', apiLimiter, validateMongoId, validateUpdateUser, updateUser);
router.delete('/:id', apiLimiter, validateMongoId, deleteUser);
router.put('/:id/reset-password', apiLimiter, validateMongoId, resetPassword);
router.put('/:id/role', apiLimiter, validateMongoId, updateUserRole);

module.exports = router;

