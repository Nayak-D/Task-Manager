import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useThemeStore } from '@/store/themeStore';

// Layouts
import { AdminLayout } from '@/layouts/AdminLayout';
import { StudentLayout } from '@/layouts/StudentLayout';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';

// Lazy pages
const LoginPage = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const StudentFeedPage = lazy(() => import('@/pages/StudentFeedPage').then(m => ({ default: m.StudentFeedPage })));
const AdminDashboardPage = lazy(() => import('@/pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const ManageNoticesPage = lazy(() => import('@/pages/ManageNoticesPage').then(m => ({ default: m.ManageNoticesPage })));
const CreateEditNoticePage = lazy(() => import('@/pages/CreateEditNoticePage').then(m => ({ default: m.CreateEditNoticePage })));
const ReportsPage = lazy(() => import('@/pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <div className="w-7 h-7 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AppContent() {
  const { isDark } = useThemeStore();

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Student feed */}
          <Route path="/" element={<StudentLayout />}>
            <Route index element={<StudentFeedPage />} />
          </Route>

          {/* Admin — protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="notices" element={<ManageNoticesPage />} />
              <Route path="notices/new" element={<CreateEditNoticePage />} />
              <Route path="notices/:id/edit" element={<CreateEditNoticePage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 600,
            padding: '10px 14px',
          },
          success: {
            style: {
              background: '#f0fdf4',
              color: '#15803d',
              border: '1px solid #bbf7d0',
            },
          },
          error: {
            style: {
              background: '#fff1f2',
              color: '#be123c',
              border: '1px solid #fecdd3',
            },
          },
        }}
      />
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
