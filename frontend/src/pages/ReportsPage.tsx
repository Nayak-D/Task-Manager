import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, Eye, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNotices } from '@/hooks/useNotices';
import { isExpired, isExpiringSoon, ALL_CATEGORIES, CATEGORY_BADGE_COLORS, cn } from '@/utils';

export function ReportsPage() {
  const { notices, isLoading } = useNotices(true);

  const stats = useMemo(() => {
    const active = notices.filter((n) => !isExpired(n.expiryDate));
    const expired = notices.filter((n) => isExpired(n.expiryDate));
    const expiringSoon = active.filter((n) => isExpiringSoon(n.expiryDate));
    const totalViews = notices.reduce((acc, n) => acc + n.views, 0);
    const pinned = notices.filter((n) => n.isPinned);

    const byCategory = ALL_CATEGORIES.map((cat) => ({
      name: cat,
      total: notices.filter((n) => n.category === cat).length,
      active: notices.filter((n) => n.category === cat && !isExpired(n.expiryDate)).length,
    })).filter((c) => c.total > 0).sort((a, b) => b.total - a.total);

    const topViewed = [...notices].sort((a, b) => b.views - a.views).slice(0, 5);

    return { active: active.length, expired: expired.length, expiringSoon: expiringSoon.length, totalViews, pinned: pinned.length, total: notices.length, byCategory, topViewed };
  }, [notices]);

  const maxCat = Math.max(...stats.byCategory.map((c) => c.total), 1);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Reports & Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Overview of all notice board activity</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Notices', value: stats.total, icon: <FileText size={18} />, color: 'bg-primary-500' },
          { label: 'Active', value: stats.active, icon: <CheckCircle size={18} />, color: 'bg-emerald-500' },
          { label: 'Expired', value: stats.expired, icon: <XCircle size={18} />, color: 'bg-slate-400' },
          { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: <Eye size={18} />, color: 'bg-violet-500' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-navy-850 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-card"
          >
            <div className={`w-9 h-9 ${item.color} rounded-xl flex items-center justify-center text-white mb-3`}>
              {item.icon}
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white">{item.value}</div>
            <div className="text-xs text-slate-400 mt-0.5 font-medium">{item.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Category */}
        <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 size={16} className="text-primary-500" />
            <h2 className="font-bold text-slate-800 dark:text-white text-sm">Notices by Category</h2>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse h-8 bg-slate-100 dark:bg-slate-700 rounded-xl" />
              ))}
            </div>
          ) : stats.byCategory.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {stats.byCategory.map((cat) => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn('text-xs font-semibold border px-2 py-0.5 rounded-full', CATEGORY_BADGE_COLORS[cat.name as keyof typeof CATEGORY_BADGE_COLORS])}>
                      {cat.name}
                    </span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{cat.total}</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(cat.total / maxCat) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="h-full bg-primary-500 rounded-full"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{cat.active} active</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top viewed */}
        <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={16} className="text-emerald-500" />
            <h2 className="font-bold text-slate-800 dark:text-white text-sm">Most Viewed Notices</h2>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse h-12 bg-slate-100 dark:bg-slate-700 rounded-xl" />
              ))}
            </div>
          ) : stats.topViewed.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-2">
              {stats.topViewed.map((notice, i) => (
                <div key={notice.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <span className="w-6 h-6 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{notice.title}</p>
                    <p className="text-xs text-slate-400">{notice.category}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 flex-shrink-0">
                    <Eye size={12} /> {notice.views.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status summary */}
      <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-orange-500" />
          <h2 className="font-bold text-slate-800 dark:text-white text-sm">Status Summary</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Pinned', value: stats.pinned, color: 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' },
            { label: 'Active', value: stats.active, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' },
            { label: 'Expiring Soon', value: stats.expiringSoon, color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20' },
            { label: 'Expired', value: stats.expired, color: 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800' },
          ].map((item) => (
            <div key={item.label} className={`rounded-xl p-4 text-center ${item.color}`}>
              <div className="text-2xl font-bold">{item.value}</div>
              <div className="text-xs font-semibold mt-0.5 opacity-80">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
