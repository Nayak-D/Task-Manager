const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  login,
  getMe,
  logout,
  updateProfile,
  changePassword,
  getRecipients,
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/login', login);

// Protected routes
router.use(protect); // All routes below require authentication
router.get('/me', getMe);
router.get('/recipients', adminOnly, getRecipients);
router.post('/logout', logout);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

module.exports = router;
