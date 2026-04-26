# 📋 Digital Notice Board

A production-grade frontend for a Digital Notice Board with Expiry System, built with React, TypeScript, Vite, Tailwind CSS, and Framer Motion.

## ✨ Features

- **Admin Portal** — Create, edit, delete, and manage notices
- **Student Feed** — Auto-filtered active-only notices with search and filter
- **Live Countdown Timers** — Per-notice expiry countdown with "Expiring Soon" badge (<24h)
- **Dark Mode** — Persistent dark/light mode toggle
- **Responsive** — Mobile-first design
- **Animations** — Smooth Framer Motion animations throughout
- **Mock API** — Fully working in-memory mock API (no backend required)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## 🔐 Demo Login

| Field    | Value                        |
|----------|------------------------------|
| Email    | admin@noticeboard.edu        |
| Password | admin123                     |

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/          # Reusable UI: Button, Badge, Input, Modal, Skeleton, etc.
│   └── shared/      # Sidebar, Topbar
├── features/
│   ├── auth/        # ProtectedRoute
│   └── notices/     # NoticeCard, NoticeDetail, NoticeForm, FilterBar
├── pages/           # All page components
├── hooks/           # useNotices, useCountdown, useDebounce
├── services/        # Axios instance + mock API service
├── store/           # Zustand stores (auth, notices, theme)
├── utils/           # Helpers, constants, mock data
├── types/           # TypeScript interfaces
└── layouts/         # AdminLayout, StudentLayout
```

## 🛠 Tech Stack

- **React 18** + TypeScript (strict)
- **Vite** — lightning-fast dev server
- **React Router v6** — with lazy loading
- **Zustand** — global state with persistence
- **Axios** — HTTP client with interceptors
- **React Hook Form + Zod** — form validation
- **Tailwind CSS** — utility-first styling
- **Framer Motion** — animations
- **Lucide React** — icons
- **React Hot Toast** — notifications
- **date-fns** — date utilities

## 🔌 API Integration

Replace the mock service in `src/services/api.ts` with your real backend.
All endpoints follow REST conventions:

```
GET    /notices          → fetch all notices
POST   /notices          → create notice
PUT    /notices/:id      → update notice
DELETE /notices/:id      → delete notice
POST   /auth/login       → authenticate
```

## 🎨 Color Customization

Edit `tailwind.config.js` to customize the color palette. Dark mode uses the `dark:` class strategy.
