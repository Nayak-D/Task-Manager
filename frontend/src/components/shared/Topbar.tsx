import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Moon, Sun, ChevronDown, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { authService } from '@/services/api';
import { cn } from '@/utils';

interface TopbarProps {
  title?: string;
  onSearch?: (q: string) => void;
}

export function Topbar({ title, onSearch }: TopbarProps) {
  const { user, clearAuth } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const [search, setSearch] = useState('');
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (v: string) => {
    setSearch(v);
    onSearch?.(v);
  };

  const handleLogout = async () => {
    await authService.logout();
    clearAuth();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-white dark:bg-navy-900 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 px-5 lg:px-6 flex-shrink-0">
      {/* Left — title */}
      <div className="flex-1 min-w-0 hidden lg:block">
        {title && <h1 className="text-base font-bold text-slate-800 dark:text-white truncate">{title}</h1>}
      </div>

      {/* Search */}
      {onSearch && (
        <div className="flex-1 max-w-xs">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search notices..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 ml-auto">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <button className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setDropOpen((v) => !v)}
            className={cn(
              'flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-colors',
              dropOpen ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0] ?? 'A'}
            </div>
            <span className="hidden sm:block text-sm font-semibold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
              {user?.name}
            </span>
            <ChevronDown size={14} className={cn('text-slate-400 transition-transform', dropOpen ? 'rotate-180' : '')} />
          </button>

          {dropOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-navy-850 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-800 dark:text-white">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => { setDropOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <User size={14} /> Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
