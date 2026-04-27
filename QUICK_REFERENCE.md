# ⚡ Quick Reference Guide

A fast, easy-to-scan reference for common tasks, API calls, and troubleshooting.

---

## 🚀 Quick Start (5 minutes)

```bash
# Backend Setup
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and email config
npm run seed
npm run dev

# Frontend Setup (in new terminal)
cd frontend
npm install
npm run dev

# Done! Access app at http://localhost:5173
```

---

## 🔑 Test Credentials

| User | Email | Password | Role |
|------|-------|----------|------|
| Admin | nayak@gmail.com | nayak123 | Admin |
| Student | student@example.com | student123 | Student |

---

## 📡 API Quick Reference

### Base URL
```
http://localhost:5000/api
```

### Common Headers
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

### Authentication

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

**Response**: Returns `token` and `user` object

#### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New User",
    "email": "newuser@example.com",
    "password": "password123",
    "role": "student"
  }'
```

---

### Notices

#### Get All Active Notices
```bash
curl http://localhost:5000/api/notices/active?category=Academic&page=1&limit=10
```

**Query Parameters**:
- `category`: Academic, Exam, Holiday, Urgent, General, Administrative, Sports, Cultural
- `search`: Search term
- `page`: Page number (1-indexed)
- `limit`: Results per page (default: 10)

#### Get Single Notice
```bash
curl http://localhost:5000/api/notices/{noticeId}
```

#### Create Notice (Admin)
```bash
curl -X POST http://localhost:5000/api/notices \
  -H "Authorization: Bearer {token}" \
  -F "title=Notice Title" \
  -F "description=Notice Description" \
  -F "category=Academic" \
  -F "expiryDate=2024-12-31T00:00:00Z" \
  -F "emailAlert=true" \
  -F "attachments=@file1.pdf" \
  -F "attachments=@file2.pdf"
```

#### Update Notice (Admin)
```bash
curl -X PUT http://localhost:5000/api/notices/{noticeId} \
  -H "Authorization: Bearer {token}" \
  -F "title=Updated Title" \
  -F "category=Exam"
```

#### Delete Notice (Admin)
```bash
curl -X DELETE http://localhost:5000/api/notices/{noticeId} \
  -H "Authorization: Bearer {token}"
```

#### Get Admin Stats (Admin)
```bash
curl http://localhost:5000/api/notices/admin/stats \
  -H "Authorization: Bearer {token}"
```

#### Pin/Unpin Notice (Admin)
```bash
curl -X PATCH http://localhost:5000/api/notices/{noticeId}/pin \
  -H "Authorization: Bearer {token}"
```

#### Publish Draft Notice (Admin)
```bash
curl -X PATCH http://localhost:5000/api/notices/{noticeId}/publish \
  -H "Authorization: Bearer {token}"
```

---

## 🌍 Categories

| Category | Use Case | Icon |
|----------|----------|------|
| General | General announcements | 📢 |
| Academic | Class updates, syllabus changes | 📚 |
| Events | Events, workshops, seminars | 🎉 |
| Urgent | Urgent/emergency notices | ⚠️ |
| Exam | Exam schedules, results | 📝 |
| Holiday | Holidays, closures | 🏖️ |
| Administrative | Admin, HR notices | 📋 |
| Sports | Sports events, tournaments | ⚽ |
| Cultural | Cultural events, activities | 🎭 |

---

## 🔄 Status Workflow

```
CREATE NOTICE
    ↓
DRAFT
    ├─→ PUBLISH → ACTIVE → EXPIRED
    ├─→ SCHEDULE → SCHEDULED → ACTIVE → EXPIRED
    └─→ DELETE → DELETED
```

---

## 🐛 Common Issues & Solutions

### Issue: "CORS Error"
```
Error: Access to XMLHttpRequest blocked by CORS policy
```

**Solution**:
```env
# In backend .env
FRONTEND_URL=http://localhost:5173
```

---

### Issue: "MongoDB Connection Failed"
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution**:
- Check MongoDB is running: `mongod`
- Verify MONGODB_URI in .env
- For Atlas: Check IP whitelist

---

### Issue: "Email Not Sending"
```
Error: Invalid login: 535 5.7.8 Username and password not accepted
```

**Solution**:
- Use app-specific password (not account password)
- Enable less secure apps (Gmail)
- Check EMAIL_USER and EMAIL_PASS in .env

---

### Issue: "JWT Token Expired"
```
Error: TokenExpiredError: jwt expired
```

**Solution**:
- Login again to get new token
- Clear browser storage and cache
- Check JWT_EXPIRE in .env

---

### Issue: "File Upload Failed"
```
Error: File too large or invalid type
```

**Solution**:
- Check file size (max 5MB)
- Verify file type (PDF, images only)
- Check uploads/ folder has write permissions

---

## 📁 File Structure Quick Reference

### Backend Key Files

| File | Purpose |
|------|---------|
| `server.js` | Express app initialization |
| `config/database.js` | MongoDB connection |
| `models/User.js` | User schema |
| `models/Notice.js` | Notice schema |
| `middleware/auth.js` | JWT verification |
| `controllers/authController.js` | Login/Register logic |
| `controllers/noticeController.js` | Notice CRUD |
| `services/emailService.js` | Email sending |

### Frontend Key Files

| File | Purpose |
|------|---------|
| `App.tsx` | Root component |
| `services/api.ts` | API client |
| `store/authStore.ts` | Auth state (Zustand) |
| `store/noticeStore.ts` | Notice state (Zustand) |
| `types/index.ts` | TypeScript types |
| `pages/` | Page components |
| `components/` | Reusable components |

---

## 🔐 Environment Variables Checklist

```env
# Backend .env
✓ MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/notice-board
✓ PORT=5000
✓ NODE_ENV=development
✓ FRONTEND_URL=http://localhost:5173
✓ JWT_SECRET=your_very_long_secret_key_minimum_32_characters
✓ JWT_EXPIRE=7d
✓ EMAIL_SERVICE=gmail
✓ EMAIL_USER=your-email@gmail.com
✓ EMAIL_PASS=your-app-password
✓ EMAIL_FROM=noreply@noticeboard.com
✓ MAX_FILE_SIZE=5242880
```

---

## 🧪 Testing Endpoints with Postman

### 1. Get Token
```
POST /api/auth/login
Body (raw JSON):
{
  "email": "admin@example.com",
  "password": "password123"
}

Response: Copy token value
```

### 2. Set Authorization Header
```
Go to Authorization tab
Type: Bearer Token
Token: [Paste your token here]
```

### 3. Test Protected Endpoint
```
GET /api/notices/admin/stats

Should return: Admin statistics
```

---

## 💾 Useful Commands

### Backend
```bash
npm install                # Install dependencies
npm run dev               # Start dev server
npm run seed              # Seed database
npm start                 # Production start
```

### Frontend
```bash
npm install               # Install dependencies
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
```

### Database
```bash
# MongoDB Commands (via mongosh)
use notice-board                    # Select database
db.users.find()                     # View all users
db.notices.find()                   # View all notices
db.notices.deleteMany({})           # Clear notices
db.users.deleteMany({})             # Clear users
```

---

## 📊 Database Schema Summary

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (admin|student),
  avatar: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Notice Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,
  status: String (active|expired|draft|scheduled),
  expiryDate: Date,
  scheduledAt: Date,
  emailAlert: Boolean,
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number
  }],
  isPinned: Boolean,
  viewCount: Number,
  createdBy: ObjectId (User),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎨 Frontend Routes

| Path | Component | Access |
|------|-----------|--------|
| `/` | StudentFeedPage | Public |
| `/login` | LoginPage | Public |
| `/admin` | AdminDashboardPage | Admin Only |
| `/admin/notices` | ManageNoticesPage | Admin Only |
| `/admin/create` | CreateEditNoticePage | Admin Only |
| `/admin/edit/:id` | CreateEditNoticePage | Admin Only |
| `/admin/reports` | ReportsPage | Admin Only |
| `/notice/:id` | NoticeDetail | Public |
| `*` | NotFound | Public |

---

## 🚨 Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| General API | 200 req | 15 min |
| Login | 20 attempts | 15 min |
| Register | 200 req | 15 min |

---

## 📱 Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Notice created successfully |
| 201 | Created | Notice added to database |
| 400 | Bad Request | Invalid input format |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | User doesn't have permission |
| 404 | Not Found | Notice doesn't exist |
| 409 | Conflict | Email already registered |
| 500 | Server Error | Unexpected server error |

---

## 🔗 Useful Links

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [Postman](https://www.postman.com/)

---

**Last Updated**: April 2026 | **Version**: 1.0.0
