const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Only allow admin role creation if explicitly given (for seeding)
  // In production, registering students only publicly
  const userRole = role === 'admin' ? 'admin' : 'student';

  const user = await User.create({ name, email, password, role: userRole });
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: { user, token },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  // Get user with password
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !user.isActive) {
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
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

module.exports = { register, login, getMe, logout, updateProfile, changePassword, getRecipients };
