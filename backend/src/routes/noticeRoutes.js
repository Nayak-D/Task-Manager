const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/noticeController');
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// ─── Public Routes ─────────────────────────────────────────────────────────────
router.get('/active', getActiveNotices);
router.get('/:id', getNoticeById);

// ─── Protected Admin Routes ────────────────────────────────────────────────────
router.use(protect, adminOnly);

// Stats for dashboard (must come before /:id)
router.get('/admin/stats', getStats);

// All notices (admin view with filters)
router.get('/', getAllNotices);

// Bulk delete (must be before /:id routes)
router.delete('/bulk', bulkDelete);

// Create notice (with optional file upload)
router.post('/', upload.array('attachments', 5), createNotice);

// Update notice
router.put('/:id', upload.array('attachments', 5), updateNotice);

// Toggle pin
router.patch('/:id/pin', togglePin);

// Publish draft/scheduled notice
router.patch('/:id/publish', publishNotice);

// Delete single notice
router.delete('/:id', deleteNotice);

module.exports = router;
