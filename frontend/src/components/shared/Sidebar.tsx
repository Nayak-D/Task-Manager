import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, PlusCircle, List, BarChart2,
  Bell, LogOut, Menu, X, Moon, Sun, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { authService } from '@/services/api';
import { cn } from '@/utils';

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const ADMIN_NAV: SidebarItem[] = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} /> },
  { label: 'Create Task', path: '/admin/notices/new', icon: <PlusCircle size={18} /> },
  { label: 'Manage Tasks', path: '/admin/notices', icon: <List size={18} /> },
  { label: 'Reports', path: '/admin/reports', icon: <BarChart2 size={18} /> },
];

interface SidebarProps {
  role: 'admin' | 'student';
}

export function Sidebar({ role }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, clearAuth } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const navigate = useNavigate();

  const nav = role === 'admin' ? ADMIN_NAV : [];

  const handleLogout = async () => {
    await authService.logout();
    clearAuth();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-5 py-5 border-b border-white/10', collapsed && 'justify-center px-3')}>
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Bell size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-white font-bold text-sm leading-tight block">Task Board</span>
            <span className="text-white/50 text-[10px] uppercase tracking-widest">{role === 'admin' ? 'Admin Panel' : 'Student'}</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
              collapsed ? 'justify-center' : '',
              isActive
                ? 'bg-white/20 text-white shadow-inner'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            )}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && (
              <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-60 transition-opacity" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className={cn('px-3 py-4 border-t border-white/10 space-y-1', collapsed && 'px-2')}>
        <button
          onClick={toggle}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all',
            collapsed ? 'justify-center' : ''
          )}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-red-300 hover:bg-red-500/10 transition-all',
            collapsed ? 'justify-center' : ''
          )}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>

        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mt-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.name?.[0] ?? 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
              <p className="text-white/40 text-[10px] truncate">{user?.email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ duration: 0.2 }}
        className="hidden lg:flex flex-col flex-shrink-0 bg-navy-900 dark:bg-navy-950 relative overflow-hidden"
      >
        <SidebarContent />
        {/* Collapse button */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="absolute top-4 -right-3 w-6 h-6 bg-white dark:bg-navy-800 rounded-full shadow-md flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary-600 transition-colors"
        >
          <ChevronRight size={12} className={cn('transition-transform', collapsed ? '' : 'rotate-180')} />
        </button>
      </motion.aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-9 h-9 bg-navy-900 text-white rounded-xl flex items-center justify-center shadow-lg"
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-60 bg-navy-900 z-50"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-3 text-white/50 hover:text-white p-1"
              >
                <X size={18} />
              </button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
