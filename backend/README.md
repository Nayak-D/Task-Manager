# Digital Notice Board — Full Stack

A full-stack digital notice board application built with React (Vite) + Node.js/Express + MongoDB Atlas.

---

## Project Structure

```
digital-notice-board/
├── backend/          ← Node.js + Express + MongoDB API
└── notice-board/     ← React + Vite frontend (your original)
```

---

## Backend Stack

| Layer        | Technology                        |
|-------------|-----------------------------------|
| Runtime      | Node.js                           |
| Framework    | Express.js                        |
| Database     | MongoDB Atlas (Mongoose ODM)      |
| Auth         | JWT (jsonwebtoken)                |
| Passwords    | bcryptjs (12-round salt)          |
| File Uploads | Multer (up to 5MB)                |
| Security     | Helmet, CORS, Rate Limiting       |

---

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
```

The `.env` file is already configured with your MongoDB Atlas connection.

**Seed the database** (creates admin user + sample notices):
```bash
npm run seed
```

**Start the backend:**
```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Backend runs on: `http://localhost:5000`

---

### 2. Frontend Setup

```bash
cd notice-board
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## Default Login Credentials

| Role  | Email                      | Password   |
|-------|---------------------------|------------|
| Admin | admin@noticeboard.edu     | admin123   |

---

## API Endpoints

### Auth
| Method | Route                    | Access    | Description        |
|--------|--------------------------|------------|-------------------|
| POST   | /api/auth/login          | Public     | Login             |
| POST   | /api/auth/register       | Public     | Register          |
| GET    | /api/auth/me             | Protected  | Get current user  |
| POST   | /api/auth/logout         | Protected  | Logout            |
| PUT    | /api/auth/profile        | Protected  | Update profile    |
| PUT    | /api/auth/change-password| Protected  | Change password   |

### Notices
| Method | Route                      | Access       | Description            |
|--------|---------------------------|--------------|------------------------|
| GET    | /api/notices/active        | Public       | Student feed           |
| GET    | /api/notices/:id           | Public       | Get single notice      |
| GET    | /api/notices               | Admin only   | All notices (filtered) |
| GET    | /api/notices/admin/stats   | Admin only   | Dashboard stats        |
| POST   | /api/notices               | Admin only   | Create notice          |
| PUT    | /api/notices/:id           | Admin only   | Update notice          |
| PATCH  | /api/notices/:id/pin       | Admin only   | Toggle pin             |
| DELETE | /api/notices/:id           | Admin only   | Delete notice          |
| DELETE | /api/notices/bulk          | Admin only   | Bulk delete            |

---

## Environment Variables (backend/.env)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=<your atlas connection string>
JWT_SECRET=<your secret key>
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

---

## Features

- **JWT Authentication** — secure login, token stored in localStorage
- **Role-based Access** — admin vs student routes
- **Notice Management** — create, edit, delete, pin/unpin notices
- **Auto Status** — notices auto-expire based on `expiryDate`
- **File Uploads** — attach PDFs and images to notices (served from `/uploads`)
- **View Tracking** — notice views increment on each open
- **Rate Limiting** — 200 req/15min globally, 20 login attempts/15min
- **Full-text Search** — search by title and description
- **Category & Sort Filters** — filter by category, sort by latest/oldest/expiring-soon
