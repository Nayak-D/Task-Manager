# 🏗️ Backend Architecture & Explanation Guide

A comprehensive guide to understanding the backend architecture, data flow, and implementation details of the Digital Notice Board application.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Data Models](#data-models)
5. [API Endpoints](#api-endpoints)
6. [Authentication Flow](#authentication-flow)
7. [Request Lifecycle](#request-lifecycle)
8. [Key Features Explained](#key-features-explained)
9. [Security Implementation](#security-implementation)
10. [Best Practices](#best-practices)

---

## 🏛️ Architecture Overview

The backend follows a **layered architecture** pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│                  HTTP Requests                       │
├─────────────────────────────────────────────────────┤
│                 Express Server                       │
├─────────────────────────────────────────────────────┤
│  Middleware Layer (Security, Validation, Auth)      │
├─────────────────────────────────────────────────────┤
│          Routes (API Endpoints)                      │
├─────────────────────────────────────────────────────┤
│       Controllers (Business Logic)                   │
├─────────────────────────────────────────────────────┤
│     Services (Complex Operations)                    │
├─────────────────────────────────────────────────────┤
│        Models (Database Schema)                      │
├─────────────────────────────────────────────────────┤
│              MongoDB Database                        │
└─────────────────────────────────────────────────────┘
```

### Design Principles
- **Separation of Concerns** - Each layer has a specific responsibility
- **DRY (Don't Repeat Yourself)** - Reusable middleware and utilities
- **Scalability** - Easy to add new features and endpoints
- **Maintainability** - Clean code structure and clear naming conventions
- **Error Handling** - Centralized error management

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js              # MongoDB connection configuration
│   │
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification & role checking
│   │   ├── errorHandler.js          # Global error handling
│   │   └── upload.js                # File upload configuration (Multer)
│   │
│   ├── models/
│   │   ├── User.js                  # User schema with authentication
│   │   └── Notice.js                # Notice schema with lifecycle
│   │
│   ├── controllers/
│   │   ├── authController.js        # Authentication logic
│   │   └── noticeController.js      # Notice CRUD operations
│   │
│   ├── routes/
│   │   ├── authRoutes.js            # /api/auth endpoints
│   │   └── noticeRoutes.js          # /api/notices endpoints
│   │
│   ├── services/
│   │   └── emailService.js          # Email sending utilities
│   │
│   ├── utils/
│   │   └── seed.js                  # Database seeding script
│   │
│   └── server.js                    # Express app initialization
│
├── uploads/                          # Uploaded files storage
├── .env                              # Environment variables
└── package.json                      # Dependencies
```

---

## 🔧 Core Components

### 1. Server Entry Point (`server.js`)

**Purpose**: Initializes Express app with all middleware and routes.

**Key Responsibilities**:
- Load environment variables
- Setup security middleware (Helmet, CORS)
- Configure rate limiting
- Mount routes
- Start HTTP server

**Code Flow**:
```
Load .env → Setup Middleware → Connect DB → Mount Routes → Listen on Port
```

### 2. Database Configuration (`config/database.js`)

**Purpose**: Establishes MongoDB connection.

**Connection String**:
```
mongodb+srv://username:password@cluster.mongodb.net/database-name
```

**Features**:
- Connection pooling
- Automatic reconnection
- Error logging
- Mongoose connection events

---

## 📊 Data Models

### User Model

**File**: `models/User.js`

**Schema Fields**:
```javascript
{
  name: String,              // User full name
  email: String,             // Unique email (lowercase)
  password: String,          // Hashed with bcrypt
  role: String,              // 'admin' or 'student'
  avatar: String,            // Profile picture URL
  isActive: Boolean,         // Account status
  createdAt: Date,           // Creation timestamp
  updatedAt: Date            // Last update timestamp
}
```

**Key Features**:
- **Password Hashing**: Pre-save middleware automatically hashes passwords
- **Password Comparison**: `comparePassword()` method for login verification
- **Role-Based Access**: Determines what actions user can perform
- **Validation**: Email must be unique and valid format

**Example User Document**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "$2a$10$...", // Hashed password
  "role": "admin",
  "avatar": "https://...",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Notice Model

**File**: `models/Notice.js`

**Schema Fields**:
```javascript
{
  title: String,             // Notice title (max 200 chars)
  description: String,       // Notice content
  category: String,          // Academic, Exam, Holiday, Urgent, etc.
  status: String,            // active, expired, draft, scheduled
  expiryDate: Date,          // When notice expires
  scheduledAt: Date,         // When to publish (if scheduled)
  emailAlert: Boolean,       // Send email notification?
  attachments: [{            // Array of uploaded files
    name: String,
    url: String,
    type: String,            // image, pdf, other
    size: Number
  }],
  isPinned: Boolean,         // Highlight important notices
  viewCount: Number,         // Track popularity
  createdBy: ObjectId,       // Reference to User (admin)
  createdAt: Date,
  updatedAt: Date
}
```

**Status Lifecycle**:
```
draft → scheduled → active → expired
        ↓
      published directly
```

**Example Notice Document**:
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "Final Exam Schedule",
  "description": "The final exams will be held from Dec 15-22, 2024...",
  "category": "Exam",
  "status": "active",
  "expiryDate": "2024-12-31T00:00:00Z",
  "emailAlert": true,
  "attachments": [
    {
      "name": "exam_schedule.pdf",
      "url": "/uploads/exam_schedule.pdf",
      "type": "pdf",
      "size": 245000
    }
  ],
  "isPinned": true,
  "viewCount": 342,
  "createdBy": "507f1f77bcf86cd799439011",
  "createdAt": "2024-12-01T10:00:00Z"
}
```

---

## 🔐 Authentication Flow

### JWT Authentication Process

```
┌─────────────────────────────────────────────────────────┐
│           User Submits Login Credentials                │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│   Backend Validates Email & Password                    │
│   - Check if user exists                                │
│   - Compare hashed password with bcrypt                 │
└────────────────────────┬────────────────────────────────┘
                         ↓
                    ✓ Valid?
                    ↙        ↘
                  YES        NO
                  ↓           ↓
            Generate      Return Error
            JWT Token     Response
                  ↓
        Send Token to Client
                  ↓
        Client Stores Token
        (localStorage/sessionStorage)
                  ↓
    On Each Subsequent Request:
    Add Token to Authorization Header
                  ↓
    Backend Verifies Token & User Role
                  ↓
        ✓ Valid?  Process Request
        ✗ Invalid? Return 401/403 Error
```

### JWT Token Structure

**Header** (Algorithm):
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload** (Data):
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "admin@example.com",
  "role": "admin",
  "iat": 1704110400,        // Issued at
  "exp": 1704716400         // Expiration (7 days)
}
```

**Signature** (Verification):
```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  your_secret_key
)
```

### Token Verification Process

**File**: `middleware/auth.js`

```javascript
// 1. Extract token from Authorization header
const token = req.headers.authorization.split(' ')[1]

// 2. Verify token with JWT_SECRET
const decoded = jwt.verify(token, process.env.JWT_SECRET)

// 3. Fetch user from database
const user = await User.findById(decoded.userId)

// 4. Attach user to request object
req.user = user

// 5. Proceed to next middleware/route handler
next()
```

---

## 📡 API Endpoints

### Authentication Routes (`routes/authRoutes.js`)

#### 1. Register
```
POST /api/auth/register
Content-Type: application/json

Request Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "role": "student"  // or "admin"
}

Response (201 Created):
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}

Error Response (400 Bad Request):
{
  "success": false,
  "message": "Email already exists"
}
```

**Process**:
1. Validate input (email format, password strength)
2. Check if email already registered
3. Hash password with bcrypt
4. Create new user in database
5. Generate JWT token
6. Return token and user info

#### 2. Login
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "email": "john@example.com",
  "password": "securepass123"
}

Response (200 OK):
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}

Error Response (401 Unauthorized):
{
  "success": false,
  "message": "Invalid credentials"
}
```

**Process**:
1. Find user by email
2. Compare provided password with hashed password
3. Generate JWT token
4. Return token and user info

### Notice Routes (`routes/noticeRoutes.js`)

#### 1. Get All Active Notices (Public)
```
GET /api/notices/active?category=Academic&page=1&limit=10

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "Notice Title",
      "description": "...",
      "category": "Academic",
      "status": "active",
      "expiryDate": "2024-12-31T00:00:00Z",
      "attachments": [],
      "viewCount": 342,
      "createdAt": "2024-12-01T10:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "total": 45
  }
}
```

#### 2. Create Notice (Admin Only)
```
POST /api/notices
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
- title: "Important Announcement"
- description: "Detailed description..."
- category: "Academic"
- expiryDate: "2024-12-31T00:00:00Z"
- emailAlert: "true"
- attachments: [file1, file2, file3]

Response (201 Created):
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "title": "Important Announcement",
    ...
  }
}
```

**Process**:
1. Verify JWT token (protect middleware)
2. Check if user is admin (adminOnly middleware)
3. Validate input data
4. Process uploaded files (multer)
5. Create notice in database
6. If emailAlert: send emails to all students
7. Return created notice

#### 3. Update Notice (Admin Only)
```
PUT /api/notices/:id
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
- title: "Updated Title" (optional)
- description: "Updated description" (optional)
- category: "Exam"
- expiryDate: "2024-12-31T00:00:00Z"
- attachments: [newFile1, newFile2]

Response (200 OK):
{
  "success": true,
  "data": { updated notice }
}
```

#### 4. Delete Notice (Admin Only)
```
DELETE /api/notices/:id
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "message": "Notice deleted successfully"
}
```

#### 5. Get Admin Statistics
```
GET /api/notices/admin/stats
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "data": {
    "totalNotices": 45,
    "activeNotices": 30,
    "draftNotices": 10,
    "expiredNotices": 5,
    "scheduledNotices": 3,
    "categoryBreakdown": {
      "Academic": 20,
      "Exam": 15,
      "Holiday": 5,
      "Urgent": 4,
      "Other": 1
    },
    "thisMonthNotices": 12,
    "totalStudents": 150,
    "emailsSent": 345
  }
}
```

---

## 🔄 Request Lifecycle

### Example: Creating a Notice

```
1. CLIENT REQUEST
   ├─ Method: POST
   ├─ URL: /api/notices
   ├─ Headers: Authorization: Bearer token, Content-Type: multipart/form-data
   └─ Body: title, description, category, expiryDate, attachments

2. SERVER RECEIVES REQUEST
   ├─ Route matches: POST /api/notices
   └─ Middleware chain begins

3. MIDDLEWARE CHAIN
   ├─ Morgan (logging) - Log request details
   ├─ Express.json() - Parse JSON body
   ├─ Helmet - Add security headers
   ├─ CORS - Check origin
   ├─ Rate Limiter - Check rate limits
   ├─ protect (auth) - Verify JWT token
   ├─ adminOnly (auth) - Check role
   ├─ upload.array() - Process file uploads
   └─ errorHandler (if any error) - Catch and handle

4. CONTROLLER (noticeController.js - createNotice function)
   ├─ Validate input data (title, description, category, expiryDate)
   ├─ Process uploaded files (save to /uploads)
   ├─ Get authenticated user ID
   ├─ Call database save operation
   └─ Return response or error

5. DATABASE OPERATION
   ├─ Create Notice document
   ├─ Store in MongoDB collection
   └─ Return created document with _id

6. SERVICE CALL (if emailAlert enabled)
   ├─ Fetch all student emails
   ├─ Generate email template
   ├─ Send emails via Nodemailer
   └─ Log sending status

7. RESPONSE SENT TO CLIENT
   ├─ Status: 201 Created
   ├─ Headers: Content-Type: application/json
   ├─ Body: { success: true, data: {...} }
   └─ Response received by client

8. ERROR HANDLING
   ├─ If any error occurs
   ├─ Error caught by middleware
   ├─ Global error handler formats error
   └─ Return error response with appropriate status code
```

---

## 🌟 Key Features Explained

### 1. File Upload with Multer

**File**: `middleware/upload.js`

**Purpose**: Handle multipart file uploads

**Configuration**:
```javascript
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Save to uploads folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024  // 5MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});
```

**Usage in Routes**:
```javascript
// Up to 5 files with field name 'attachments'
router.post('/', upload.array('attachments', 5), createNotice);
```

### 2. Email Alerts

**File**: `services/emailService.js`

**Purpose**: Send email notifications for new notices

**Process**:
```javascript
const sendNoticeAlert = async (notice) => {
  // 1. Fetch all active students
  const students = await User.find({ role: 'student', isActive: true });
  
  // 2. Extract emails
  const emails = students.map(s => s.email);
  
  // 3. Create email template
  const htmlContent = `
    <h2>${notice.title}</h2>
    <p>${notice.description}</p>
    <p>Category: ${notice.category}</p>
    <a href="${FRONTEND_URL}/notices/${notice._id}">View Full Notice</a>
  `;
  
  // 4. Send using Nodemailer
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: emails.join(','),
    subject: `New Notice: ${notice.title}`,
    html: htmlContent
  });
};
```

**SMTP Configuration**:
```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

### 3. Password Hashing with Bcryptjs

**File**: `models/User.js`

**Purpose**: Securely store passwords

**Process**:
```javascript
// Pre-save middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  // Generate salt
  const salt = await bcrypt.genSalt(10);
  
  // Hash password
  this.password = await bcrypt.hash(this.password, salt);
  
  next();
});

// Compare method for login
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
```

**Security Details**:
- Salt rounds: 10 (computational cost)
- Hash algorithm: bcrypt (resistant to brute-force)
- Password never stored in plain text

### 4. Role-Based Access Control (RBAC)

**File**: `middleware/auth.js`

**Middleware Chain**:
```javascript
// 1. protect - Verify user is authenticated
app.use(protect);  // Requires valid JWT token

// 2. adminOnly - Verify user is admin
app.use(adminOnly);  // Checks req.user.role === 'admin'
```

**Usage in Routes**:
```javascript
// Public route - no authentication required
router.get('/active', getActiveNotices);

// Protected route - requires login
router.post('/', protect, createNotice);

// Admin-only route - requires login + admin role
router.delete('/:id', protect, adminOnly, deleteNotice);
```

### 5. Error Handling

**File**: `middleware/errorHandler.js`

**Global Error Handler**:
```javascript
// Catches all errors from routes and middleware
app.use((err, req, res, next) => {
  // Never expose stack trace to client
  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };
  
  // Set appropriate status code
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json(response);
});
```

**Error Types**:
- **ValidationError** (400) - Invalid input data
- **AuthenticationError** (401) - Missing/invalid token
- **AuthorizationError** (403) - Insufficient permissions
- **NotFoundError** (404) - Resource not found
- **ConflictError** (409) - Resource already exists
- **ServerError** (500) - Unexpected error

---

## 🔒 Security Implementation

### 1. Helmet.js - HTTP Security Headers

```javascript
const helmet = require('helmet');

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Sets headers like:
// - X-Frame-Options: DENY (prevent clickjacking)
// - X-Content-Type-Options: nosniff (prevent MIME-sniffing)
// - Strict-Transport-Security (enforce HTTPS)
// - Content-Security-Policy (prevent XSS)
```

### 2. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

// General rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 200,                   // 200 requests per window
  message: 'Too many requests'
});

// Stricter limit for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,  // Only 20 login attempts
  message: 'Too many login attempts'
});

app.use('/api', limiter);
app.use('/api/auth/login', authLimiter);
```

### 3. CORS Configuration

```javascript
const cors = require('cors');

const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = (process.env.FRONTEND_URL || '')
      .split(',')
      .map(url => url.trim());
    
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

### 4. Input Validation

**File**: `controllers/authController.js`

```javascript
const { validationResult } = require('express-validator');

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().escape(),
  body('role').isIn(['admin', 'student'])
];

// Check for validation errors
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ success: false, errors: errors.array() });
}
```

### 5. Password Security

✅ **Implemented**:
- Bcrypt hashing with salt
- Minimum 6 characters
- Not stored in plain text
- Not returned in API responses

❌ **Never**:
- Store passwords in logs
- Send passwords in URLs
- Compare passwords using ===

---

## 🎯 Best Practices

### 1. Code Organization

```
✓ Each file has single responsibility
✓ Reusable middleware for common tasks
✓ Centralized error handling
✓ Clear naming conventions
✓ DRY principle - no code duplication
```

### 2. Database Design

```
✓ Proper indexing on frequently queried fields
✓ Data validation at schema level
✓ Relationships properly defined
✓ Timestamps on all documents
```

### 3. Error Handling

```
✓ Always catch async errors
✓ Never expose stack traces to clients
✓ Meaningful error messages
✓ Appropriate HTTP status codes
✓ Logging for debugging
```

### 4. Security

```
✓ JWT tokens for stateless auth
✓ Password hashing with bcrypt
✓ Rate limiting for abuse prevention
✓ CORS properly configured
✓ Input validation and sanitization
✓ Helmet headers for HTTP security
```

### 5. Performance

```
✓ Database queries optimized
✓ Pagination for large datasets
✓ File upload size limits
✓ Connection pooling with MongoDB
✓ Asynchronous operations for I/O
```

---

## 📝 Configuration Checklist

Before deploying, ensure all environment variables are set:

```
□ MONGODB_URI        - MongoDB connection string
□ PORT               - Server port (default 5000)
□ NODE_ENV           - development/production
□ FRONTEND_URL       - Frontend origin for CORS
□ JWT_SECRET         - Long random string (min 32 chars)
□ JWT_EXPIRE         - Token expiration (e.g., 7d)
□ EMAIL_SERVICE      - Gmail or other SMTP provider
□ EMAIL_USER         - Email address for sending
□ EMAIL_PASS         - App password (not account password)
□ EMAIL_FROM         - From email address
□ MAX_FILE_SIZE      - Max upload size (bytes)
```

---

## 🚀 Development Tips

### Local Testing

```bash
# Start development server with auto-reload
npm run dev

# Watch for changes and restart automatically
nodemon src/server.js

# Run database seeding
npm run seed

# Test API with curl
curl -X GET http://localhost:5000/api/notices/active
```

### Using Postman

1. Import collection: File → Import
2. Set environment variables (token, baseUrl)
3. Use {{baseUrl}} and {{token}} in requests
4. Save responses for documentation

### Debugging

```javascript
// Add console logs for debugging
console.log('Request received:', req.body);
console.log('User:', req.user);
console.log('Database query result:', result);

// Use debugger
debugger;  // Breakpoint in Node with --inspect flag
```

---

## 📚 Resources

- **Express.js**: https://expressjs.com/
- **MongoDB**: https://www.mongodb.com/
- **Mongoose**: https://mongoosejs.com/
- **JWT**: https://jwt.io/
- **Bcryptjs**: https://www.npmjs.com/package/bcryptjs
- **Nodemailer**: https://nodemailer.com/

---

**Last Updated**: April 2026 | **Version**: 1.0.0
