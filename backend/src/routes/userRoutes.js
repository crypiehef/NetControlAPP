const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  createUser,
  deleteUser,
  resetPassword,
  updateUserRole
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// All routes require auth and admin role
router.use(auth, admin);

router.get('/', getAllUsers);
router.post('/', createUser);
router.delete('/:id', deleteUser);
router.put('/:id/reset-password', resetPassword);
router.put('/:id/role', updateUserRole);

module.exports = router;

