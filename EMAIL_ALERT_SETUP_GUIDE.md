# Email Alert System - Setup & Testing Guide

## 📋 Overview

The email alert system allows administrators to send email notifications when publishing notices. When a notice is created with **email alert enabled** and recipients are selected, emails will be sent automatically to the specified recipients in real-time.

## 🚀 Quick Setup

### Step 1: Install Dependencies
```bash
# Already installed, but if needed:
cd backend
npm install nodemailer
```

### Step 2: Configure Email Service

Copy the `.env.example` to `.env` and configure one of the three email methods:

```bash
cp .env.example .env
```

Then choose ONE method below:

### Method A: Gmail (Easiest for Testing ⭐ Recommended)

1. **Enable 2-Factor Authentication** (Required)
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or your device)
   - Google will generate a 16-character password

3. **Update `.env` file**
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   EMAIL_FROM=noreply@college.edu
   ```

4. **Restart server**
   ```bash
   npm run dev
   ```

### Method B: Custom SMTP (For Organizations)

Contact your IT department for these details:

```env
SMTP_HOST=mail.company.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@company.com
SMTP_PASSWORD=your-password
EMAIL_FROM=noreply@noticeboard.com
```

### Method C: Ethereal (Testing - No Real Email)

Leave email configuration empty or commented out in `.env`:
- Emails won't actually send
- Preview URLs will be generated and logged to console
- Perfect for development/testing

## 🧪 Testing the Email System

### Test 1: Create a Notice with Email Alert

1. **Login to Admin Portal**
   - Go to http://localhost:5173
   - Login with admin credentials

2. **Navigate to Create Notice**
   - Click "Create Notice" or go to `/admin/create`

3. **Fill in Notice Details**
   - Title: "Test Notice - Email Alert"
   - Description: "This is a test notice to verify email functionality"
   - Category: "General"
   - Expiry Date: Tomorrow or later
   - Status: "Active"

4. **Enable Email Alert**
   - Click the **"Email alert"** button (should turn green)
   - A new section "Email Recipients" will appear

5. **Add Email Recipients**

   **Option A: Add Custom Email**
   - Type your email: `your-email@gmail.com`
   - Click "Add"
   - Or press Enter
   - Email should appear as a green badge below

   **Option B: Use Sample Recipients**
   - Click any of the quick-add buttons:
     - `student1@college.edu`
     - `student2@college.edu`
     - `student3@college.edu`
     - `group.first.year@college.edu`
     - etc.

6. **Verify Recipients Are Added**
   - You should see selected emails displayed as green badges
   - Counter shows "Selected Recipients (N)"

7. **Publish Notice**
   - Click "Publish Notice" button
   - Status should show as "published" with "Email alert ON"

### Test 2: Monitor Email Sending

#### If using Gmail:
1. Check your email inbox (may take 30 seconds)
2. Look for email with subject: "🔔 New Notice: Test Notice - Email Alert"
3. Email should contain:
   - Notice title, category, author
   - Full description
   - Expiry date
   - "View Full Notice" link button
   - Professional HTML formatting

#### If using Ethereal/Testing:
1. Check the backend console terminal
2. Look for output like:
   ```
   ✅ Email sent to 2 recipients
   📧 Preview: https://ethereal.email/message/...
   ```
3. Click the preview URL to see the email in browser

### Test 3: Verify Database Records

The notice should have these new fields populated:

```json
{
  "id": "...",
  "title": "Test Notice - Email Alert",
  "description": "...",
  "emailAlert": true,
  "emailRecipients": [
    "your-email@gmail.com",
    "student1@college.edu"
  ],
  "emailSentAt": "2026-04-26T12:30:45.123Z",
  "emailSentCount": 2,
  ...
}
```

To check in MongoDB:
```javascript
db.notices.find({ emailAlert: true })
```

### Test 4: Edit Notice and Resend Emails

1. Go to "Manage Notices" page
2. Find your test notice
3. Click the edit icon
4. You can:
   - Add more email recipients
   - Remove recipients by clicking the X on the badge
   - Modify other notice details
5. Click "Update Notice"
6. Changes take effect immediately

### Test 5: Test with Different Email Addresses

Create multiple test notices:

**Test Notice 1:**
- Recipients: `student1@college.edu`, `dept.cse@college.edu`
- Verify emails sent to both

**Test Notice 2:**
- Recipients: `all.students@college.edu`, `group.first.year@college.edu`
- Verify received by all

**Test Notice 3 (Important):**
- Enable email alert
- But DON'T add any recipients
- Try to publish
- **Expected Result**: Publish button should be disabled/warning shown
- Error message: "Add email recipients to publish with email alert"

## 📧 Email Template Features

The automated emails include:

✅ Professional HTML formatting with gradient header
✅ Notice title and category badge
✅ Full description text
✅ Author, category, and expiry date
✅ Clickable "View Full Notice" button
✅ Link to full notice on web portal
✅ Plain text fallback version
✅ Responsive design (mobile & desktop)
✅ Dark/Light theme compatible

## 📍 File Locations for Testing

After creating a notice with email alert:

### Backend Files:
- **Email Service**: `backend/src/services/emailService.js`
- **Notice Controller**: `backend/src/controllers/noticeController.js` (lines where emails are sent)
- **Notice Model**: `backend/src/models/Notice.js` (emailRecipients field)
- **Environment Config**: `backend/.env`

### Frontend Files:
- **Notice Form**: `frontend/src/features/notices/NoticeForm.tsx`
- **Type Definitions**: `frontend/src/types/index.ts`
- **Create Notice Page**: `frontend/src/pages/CreateEditNoticePage.tsx`

### Sample Recipients List:
Located in: `frontend/src/features/notices/NoticeForm.tsx` (line ~45)
```typescript
const SAMPLE_RECIPIENTS = [
  'student1@college.edu',
  'student2@college.edu',
  'student3@college.edu',
  'group.first.year@college.edu',
  'group.second.year@college.edu',
  'dept.cse@college.edu',
  'all.students@college.edu',
];
```

## 🔧 Troubleshooting

### Problem: "Email service not configured"
**Solution**: Check `.env` file has EMAIL_SERVICE=gmail or SMTP_HOST configured

### Problem: "Gmail authentication failed"
**Solution**: 
- Verify 2-FA is enabled
- Use App Password (not your regular password)
- Check app password is 16 characters

### Problem: Emails not showing in inbox
**Solution**:
- Check spam/junk folder
- Wait 30-60 seconds (email can be slow)
- If using Ethereal, check console for preview URL
- Check error logs in console: `npm run dev`

### Problem: Can't add email recipient
**Solution**:
- Verify email format is correct (user@domain.com)
- Don't add duplicate emails
- Remove and re-add if stuck

### Problem: Button disabled when email alert enabled
**Solution**:
- You must add at least 1 recipient to publish with email alert
- Add an email first, then button will be enabled

## 📊 Real-time Monitoring

### View All Emails Sent (MongoDB)
```javascript
db.notices.find(
  { emailAlert: true, emailSentAt: { $exists: true } },
  { title: 1, emailRecipients: 1, emailSentAt: 1, emailSentCount: 1 }
)
```

### Monitor in Console
```bash
# Terminal 1: Backend
npm run dev

# Look for:
# ✅ Email sent to 2 recipients
# 📧 Preview: https://ethereal.email/message/...
```

## 🎯 Key Features Implemented

✅ **Email Toggle**: Click button to enable/disable email alerts
✅ **Recipient Selection**: Add/remove email addresses before publishing
✅ **Quick Add**: Sample recipients for testing
✅ **Validation**: Email format validation
✅ **Real-time**: Emails sent immediately when notice is published
✅ **Async Processing**: Non-blocking email sending
✅ **Database Tracking**: `emailSentAt`, `emailSentCount` fields
✅ **Professional Templates**: HTML email with styling
✅ **Error Handling**: Graceful error messages and logging
✅ **Multiple Methods**: Gmail, SMTP, or Ethereal

## 🚢 Production Deployment

For production:

1. **Use Custom SMTP** (Method B)
   - Configure organization's email server
   - Update `SMTP_*` variables in `.env`

2. **Add Recipient Management API** (Optional)
   - Fetch recipients from database instead of hard-coded list
   - Create `/api/recipients` endpoint

3. **Add Email History** (Optional)
   - View past sent emails
   - Resend functionality
   - Bounce handling

4. **Add Scheduled Emails** (Optional)
   - Send emails at scheduled notice publish time
   - Retry failed sends

## 📞 Support

For issues or questions about the email system:
- Check console logs: `npm run dev`
- Verify `.env` configuration
- Test with Ethereal first (Method C)
- Review email service code: `backend/src/services/emailService.js`

---

**Happy Testing! 🎉**
