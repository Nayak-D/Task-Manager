const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');

const getFrontendUrl = () => (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const normalizedEmail = email?.toLowerCase().trim();
  const userRole = role === 'admin' ? 'admin' : 'student';

  if (!name || !normalizedEmail || !password) {
    return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
  }

  let user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (user && user.isVerified) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
  }

  if (!user) {
    user = new User({
      name,
      email: normalizedEmail,
      password,
      role: userRole,
      isVerified: false,
      isActive: true,
    });
  } else {
    user.name = name;
    user.password = password;
    user.role = userRole;
    user.isActive = true;
    user.isVerified = false;
  }

  const verificationCode = generateOTP();
  user.verificationCode = verificationCode;
  // Code expires in 15 minutes
  user.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  // Send verification email asynchronously – do not await to keep response fast
  emailService.sendVerificationEmail(user.email, user.name, verificationCode).catch(err => {
    console.error('Failed to send verification email:', err);
  });

  const userObj = user.toJSON();

  res.status(201).json({
    success: true,
    message: 'Account created successfully. Check your email for the verification code.',
    data: {
      user: userObj,
      verificationSent: true,
      // For development purposes, expose code (REMOVE in actual prod if needed, though dev makes it easy to test)
      verificationCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined,
    },
  });
});

// @desc    Verify email address
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ success: false, message: 'Email and verification code are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user) {
    return res.status(404).json({ success: false, message: 'Account not found.' });
  }

  if (user.isVerified) {
    return res.status(200).json({
      success: true,
      message: 'Account already verified.',
      data: { user: user.toJSON() },
    });
  }

  if (user.verificationCode !== code) {
    return res.status(400).json({ success: false, message: 'Invalid verification code.' });
  }

  if (user.verificationCodeExpires && user.verificationCodeExpires < new Date()) {
    return res.status(400).json({ success: false, message: 'Verification code has expired. Please register again.' });
  }

  user.isVerified = true;
  user.verificationCode = null;
  user.verificationCodeExpires = null;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Email verified successfully. You can now log in.',
    data: { user: user.toJSON() },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password, mode } = req.body;
  const normalizedEmail = email?.toLowerCase();

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  let user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user || !user.isActive) {
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }

  if (!user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email before logging in.',
    });
  }

  if (mode && user.role !== mode) {
    return res.status(401).json({
      success: false,
      message: `Please use ${user.role === 'admin' ? 'Admin' : 'Student'} mode for this account.`,
    });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }

  const token = generateToken(user._id);

  // Remove password from output
  const userObj = user.toJSON();

  res.status(200).json({
    success: true,
    message: `Welcome back, ${user.name}!`,
    data: { user: userObj, token },
  });
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    message: 'User retrieved successfully',
    data: user,
  });
});

// @desc    Logout (client-side token removal, optionally blacklist)
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    data: null,
  });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, avatar },
    { new: true, runValidators: true }
  );
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user,
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
    data: null,
  });
});

// @desc    Get selectable email recipients for notice alerts
// @route   GET /api/auth/recipients
// @access  Private (Admin)
const getRecipients = asyncHandler(async (req, res) => {
  const users = await User.find({ isActive: true })
    .select('name email role')
    .sort({ role: 1, name: 1 });

  const recipients = users.map((user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  }));

  res.status(200).json({
    success: true,
    message: 'Recipients retrieved successfully',
    data: recipients,
  });
});

module.exports = { register, verifyEmail, login, getMe, logout, updateProfile, changePassword, getRecipients };
