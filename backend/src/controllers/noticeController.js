const Notice = require('../models/Notice');
const { asyncHandler } = require('../middleware/errorHandler');
const { getAttachmentType } = require('../middleware/upload');
const emailService = require('../services/emailService');

const sendNoticeEmailsIfNeeded = async (notice) => {
  const recipients = notice.emailRecipients || [];
  if (!notice.emailAlert || recipients.length === 0 || notice.emailSentAt) {
    return null;
  }

  const emailResult = await emailService.sendNoticeAlert(recipients, {
    title: notice.title,
    description: notice.description,
    category: notice.category,
    author: notice.author,
    expiryDate: notice.expiryDate,
    noticeId: notice._id,
    baseUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  });

  if (emailResult.success) {
    await Notice.findByIdAndUpdate(notice._id, {
      emailSentAt: new Date(),
      emailSentCount: emailResult.recipientCount || recipients.length,
    });
    return emailResult;
  }

  return emailResult;
};

// Helper: build sort object
const buildSort = (sortParam) => {
  switch (sortParam) {
    case 'oldest':
      return { createdAt: 1 };
    case 'expiring-soon':
      return { expiryDate: 1 };
    case 'latest':
    default:
      return { isPinned: -1, createdAt: -1 };
  }
};

// @desc    Get all notices (admin) with filters
// @route   GET /api/notices
// @access  Private (Admin)
const getAllNotices = asyncHandler(async (req, res) => {
  const { search, category, sort, showExpired, status, page = 1, limit = 50 } = req.query;

  const query = {};

  // Filter by status (draft, scheduled, active, expired)
  if (status && status !== 'all') {
    if (status === 'active') {
      query.status = { $in: ['active'] };
      query.expiryDate = { $gt: new Date() };
    } else {
      query.status = status;
    }
  } else if (showExpired === 'false') {
    query.expiryDate = { $gt: new Date() };
    query.status = { $ne: 'draft' };
  }

  // Category filter
  if (category && category !== 'All') {
    query.category = category;
  }

  // Text search
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const sortObj = buildSort(sort);
  const skip = (Number(page) - 1) * Number(limit);

  const [notices, total] = await Promise.all([
    Notice.find(query).sort(sortObj).skip(skip).limit(Number(limit)),
    Notice.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    message: 'Notices retrieved successfully',
    data: notices,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
  });
});

// @desc    Get active notices (public / student view)
//          Includes scheduled notices that have reached their scheduledAt time
// @route   GET /api/notices/active
// @access  Public
const getActiveNotices = asyncHandler(async (req, res) => {
  const { search, category, sort } = req.query;
  const now = new Date();

  const query = {
    expiryDate: { $gt: now },
    status: { $ne: 'draft' },
    $or: [
      { scheduledAt: null },
      { scheduledAt: { $exists: false } },
      { scheduledAt: { $lte: now } },
    ],
  };

  if (category && category !== 'All') {
    query.category = category;
  }

  if (search) {
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ],
    });
  }

  const sortObj = buildSort(sort);
  const notices = await Notice.find(query).sort(sortObj);

  res.status(200).json({
    success: true,
    message: 'Active notices retrieved successfully',
    data: notices,
  });
});

// @desc    Get notice stats (for admin dashboard)
// @route   GET /api/notices/admin/stats
// @access  Private (Admin)
const getStats = asyncHandler(async (req, res) => {
  const now = new Date();

  const [total, active, expired, draft, scheduled, totalViews, byCategory, recentActivity] = await Promise.all([
    Notice.countDocuments(),
    Notice.countDocuments({ expiryDate: { $gt: now }, status: 'active' }),
    Notice.countDocuments({ $or: [{ expiryDate: { $lte: now } }, { status: 'expired' }] }),
    Notice.countDocuments({ status: 'draft' }),
    Notice.countDocuments({ status: 'scheduled' }),
    Notice.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
    Notice.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, views: { $sum: '$views' } } },
      { $sort: { count: -1 } },
    ]),
    Notice.find().sort({ createdAt: -1 }).limit(5).select('title category createdAt views status'),
  ]);

  // Notices expiring within 24h
  const expiringSoon = await Notice.countDocuments({
    expiryDate: { $gt: now, $lt: new Date(now.getTime() + 24 * 60 * 60 * 1000) },
    status: 'active',
  });

  // Urgent active notices count
  const urgentActive = await Notice.countDocuments({
    category: 'Urgent',
    expiryDate: { $gt: now },
    status: 'active',
  });

  const categoryData = byCategory.map((c) => ({
    category: c._id,
    count: c.count,
    views: c.views,
  }));

  res.status(200).json({
    success: true,
    message: 'Stats retrieved successfully',
    data: {
      total,
      active,
      expired,
      draft,
      scheduled,
      expiringSoon,
      urgentActive,
      totalViews: totalViews[0]?.total || 0,
      categoryBreakdown: categoryData,
      recentActivity,
    },
  });
});

// @desc    Get single notice by ID
// @route   GET /api/notices/:id
// @access  Public
const getNoticeById = asyncHandler(async (req, res) => {
  const notice = await Notice.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  );

  if (!notice) {
    return res.status(404).json({ success: false, message: 'Notice not found.' });
  }

  res.status(200).json({
    success: true,
    message: 'Notice retrieved successfully',
    data: notice,
  });
});

// @desc    Create a new notice
// @route   POST /api/notices
// @access  Private (Admin)
const createNotice = asyncHandler(async (req, res) => {
  const { title, description, category, expiryDate, isPinned, status, scheduledAt, emailAlert, emailRecipients } = req.body;

  // Handle uploaded files
  let attachments = [];
  if (req.files && req.files.length > 0) {
    attachments = req.files.map((file) => ({
      name: file.originalname,
      url: `/uploads/${file.filename}`,
      type: getAttachmentType(file.mimetype),
      size: file.size,
    }));
  }

  // Handle JSON attachments from body
  if (req.body.attachments) {
    try {
      const bodyAttachments = JSON.parse(req.body.attachments);
      attachments = [...attachments, ...bodyAttachments];
    } catch (_) { }
  }

  const noticeData = {
    title,
    description,
    category,
    expiryDate: new Date(expiryDate),
    isPinned: isPinned === 'true' || isPinned === true,
    attachments,
    author: req.user.name,
    authorId: req.user._id,
    emailAlert: emailAlert === 'true' || emailAlert === true,
  };

  // Parse email recipients
  let parsedRecipients = [];
  if (emailRecipients) {
    try {
      parsedRecipients = typeof emailRecipients === 'string'
        ? JSON.parse(emailRecipients)
        : emailRecipients;

      // Validate email addresses
      const validEmails = parsedRecipients.filter(email =>
        /^\S+@\S+\.\S+$/.test(email)
      );

      noticeData.emailRecipients = validEmails;
    } catch (_) {
      // If parsing fails, treat as empty array
      noticeData.emailRecipients = [];
    }
  }

  // Draft status
  if (status === 'draft') {
    noticeData.status = 'draft';
  }

  // Scheduled publishing
  if (scheduledAt) {
    noticeData.scheduledAt = new Date(scheduledAt);
  }

  const notice = await Notice.create(noticeData);

  const emailResult = await sendNoticeEmailsIfNeeded(notice);
  if (emailResult?.success) {
    console.log(`📧 Email notifications sent for notice "${notice.title}"`);
  } else if (emailResult) {
    console.warn(`⚠️  Email sending failed for notice "${notice.title}": ${emailResult.message}`);
  }

  const savedNotice = emailResult?.success ? await Notice.findById(notice._id) : notice;

  res.status(201).json({
    success: true,
    message: 'Notice created successfully',
    data: savedNotice,
  });
});

// @desc    Update a notice
// @route   PUT /api/notices/:id
// @access  Private (Admin)
const updateNotice = asyncHandler(async (req, res) => {
  const { title, description, category, expiryDate, isPinned, status, scheduledAt, emailAlert, emailRecipients } = req.body;

  const existing = await Notice.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Notice not found.' });
  }

  // Handle new file uploads
  let attachments = existing.attachments;
  if (req.files && req.files.length > 0) {
    const newAttachments = req.files.map((file) => ({
      name: file.originalname,
      url: `/uploads/${file.filename}`,
      type: getAttachmentType(file.mimetype),
      size: file.size,
    }));
    attachments = [...attachments, ...newAttachments];
  }

  if (req.body.attachments) {
    try {
      attachments = JSON.parse(req.body.attachments);
    } catch (_) { }
  }

  // Parse email recipients
  let parsedRecipients = existing.emailRecipients || [];
  if (emailRecipients !== undefined) {
    try {
      parsedRecipients = typeof emailRecipients === 'string'
        ? JSON.parse(emailRecipients)
        : emailRecipients;

      // Validate email addresses
      const validEmails = parsedRecipients.filter(email =>
        /^\S+@\S+\.\S+$/.test(email)
      );

      parsedRecipients = validEmails;
    } catch (_) {
      parsedRecipients = [];
    }
  }

  const updateData = {
    ...(title && { title }),
    ...(description && { description }),
    ...(category && { category }),
    ...(expiryDate && { expiryDate: new Date(expiryDate) }),
    ...(isPinned !== undefined && { isPinned: isPinned === 'true' || isPinned === true }),
    ...(status && { status }),
    ...(scheduledAt !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : null }),
    ...(emailAlert !== undefined && { emailAlert: emailAlert === 'true' || emailAlert === true }),
    ...(emailRecipients !== undefined && { emailRecipients: parsedRecipients }),
    attachments,
  };

  const notice = await Notice.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  const emailResult = await sendNoticeEmailsIfNeeded(notice);
  if (emailResult?.success) {
    console.log(`📧 Email notifications sent for notice "${notice.title}"`);
  } else if (emailResult) {
    console.warn(`⚠️  Email sending failed for notice "${notice.title}": ${emailResult.message}`);
  }

  const savedNotice = emailResult?.success ? await Notice.findById(notice._id) : notice;

  res.status(200).json({
    success: true,
    message: 'Notice updated successfully',
    data: savedNotice,
  });
});

// @desc    Toggle pin status
// @route   PATCH /api/notices/:id/pin
// @access  Private (Admin)
const togglePin = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id);
  if (!notice) {
    return res.status(404).json({ success: false, message: 'Notice not found.' });
  }

  notice.isPinned = !notice.isPinned;
  await notice.save();

  res.status(200).json({
    success: true,
    message: `Notice ${notice.isPinned ? 'pinned' : 'unpinned'} successfully`,
    data: notice,
  });
});

// @desc    Publish a draft/scheduled notice immediately
// @route   PATCH /api/notices/:id/publish
// @access  Private (Admin)
const publishNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id);
  if (!notice) {
    return res.status(404).json({ success: false, message: 'Notice not found.' });
  }

  notice.status = new Date(notice.expiryDate) > new Date() ? 'active' : 'expired';
  notice.scheduledAt = null;
  await notice.save();

  const emailResult = await sendNoticeEmailsIfNeeded(notice);
  if (emailResult?.success) {
    console.log(`📧 Email notifications sent for notice "${notice.title}"`);
  } else if (emailResult) {
    console.warn(`⚠️  Email sending failed for notice "${notice.title}": ${emailResult.message}`);
  }

  const savedNotice = emailResult?.success ? await Notice.findById(notice._id) : notice;

  res.status(200).json({
    success: true,
    message: 'Notice published successfully',
    data: savedNotice,
  });
});

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
// @access  Private (Admin)
const deleteNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findByIdAndDelete(req.params.id);
  if (!notice) {
    return res.status(404).json({ success: false, message: 'Notice not found.' });
  }

  res.status(200).json({
    success: true,
    message: 'Notice deleted successfully',
    data: null,
  });
});

// @desc    Bulk delete notices
// @route   DELETE /api/notices/bulk
// @access  Private (Admin)
const bulkDelete = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'No notice IDs provided.' });
  }

  const result = await Notice.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    message: `${result.deletedCount} notices deleted successfully`,
    data: null,
  });
});

module.exports = {
  getAllNotices,
  getActiveNotices,
  getStats,
  getNoticeById,
  createNotice,
  updateNotice,
  togglePin,
  publishNotice,
  deleteNotice,
  bulkDelete,
};
