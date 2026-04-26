import { Outlet } from 'react-router-dom';
import { Bell, Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { motion } from 'framer-motion';

export function StudentLayout() {
  const { isDark, toggle } = useThemeStore();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-navy-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center">
              <Bell size={16} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-800 dark:text-white text-sm">Notice Board</span>
              <span className="hidden sm:inline text-xs text-slate-400 ml-2">Student Portal</span>
            </div>
          </motion.div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a
              href="/login"
              className="px-3 py-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors"
            >
              Admin Login
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
