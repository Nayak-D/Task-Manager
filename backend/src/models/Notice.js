const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: {
      type: String,
      enum: ['image', 'pdf', 'other'],
      default: 'other',
    },
    size: { type: Number, default: 0 },
  },
  { _id: true }
);

attachmentSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      // PDF-specified categories: Urgent, Exam, Holiday + extended set
      enum: ['General', 'Academic', 'Events', 'Urgent', 'Exam', 'Holiday', 'Administrative', 'Sports', 'Cultural'],
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'draft', 'scheduled'],
      default: 'active',
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    // Scheduled publishing: notice goes live at this time (future date)
    scheduledAt: {
      type: Date,
      default: null,
    },
    // Email alert: send email notification to students for this notice
    emailAlert: {
      type: Boolean,
      default: false,
    },
    // Email recipients - array of email addresses to send notifications to
    emailRecipients: [
      {
        type: String,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter valid email addresses'],
      },
    ],
    // Track when emails were sent
    emailSentAt: {
      type: Date,
      default: null,
    },
    // Count of successfully sent emails
    emailSentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Push notification sent flag (for urgent notices)
    pushNotificationSent: {
      type: Boolean,
      default: false,
    },
    author: {
      type: String,
      required: true,
      default: 'Admin',
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    attachments: [attachmentSchema],
    isPinned: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        if (ret.expiryDate) ret.expiryDate = new Date(ret.expiryDate).toISOString();
        if (ret.scheduledAt) ret.scheduledAt = new Date(ret.scheduledAt).toISOString();
        if (ret.createdAt) ret.createdAt = new Date(ret.createdAt).toISOString();
        if (ret.updatedAt) ret.updatedAt = new Date(ret.updatedAt).toISOString();
        return ret;
      },
    },
  }
);

// Auto-update status based on expiry and scheduled time
noticeSchema.pre('save', function (next) {
  const now = new Date();
  if (this.status === 'draft') {
    // Keep draft status as-is
    return next();
  }
  if (this.scheduledAt && this.scheduledAt > now) {
    // Future scheduled: mark as scheduled
    this.status = 'scheduled';
  } else if (this.expiryDate) {
    this.status = new Date(this.expiryDate) > now ? 'active' : 'expired';
  }
  next();
});

noticeSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  const now = new Date();
  const expiryDate = (update.$set && update.$set.expiryDate) || update.expiryDate;
  const scheduledAt = (update.$set && update.$set.scheduledAt) || update.scheduledAt;
  const isDraft = (update.$set && update.$set.status === 'draft') || update.status === 'draft';

  if (!isDraft && expiryDate) {
    let status;
    if (scheduledAt && new Date(scheduledAt) > now) {
      status = 'scheduled';
    } else {
      status = new Date(expiryDate) > now ? 'active' : 'expired';
    }
    if (update.$set) {
      update.$set.status = status;
    } else {
      update.status = status;
    }
  }
  next();
});

// Index for common queries
noticeSchema.index({ status: 1, expiryDate: 1 });
noticeSchema.index({ category: 1 });
noticeSchema.index({ isPinned: -1, createdAt: -1 });
noticeSchema.index({ title: 'text', description: 'text' });
noticeSchema.index({ scheduledAt: 1, status: 1 });

module.exports = mongoose.model('Notice', noticeSchema);
