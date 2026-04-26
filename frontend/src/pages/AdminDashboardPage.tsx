import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, PlusCircle, Clock, Users, Eye, Flame, CheckCircle, ArrowRight, CalendarClock, FileEdit } from 'lucide-react';
import { useNotices } from '@/hooks/useNotices';
import { NoticeCardSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { isExpired, isExpiringSoon, formatDate, CATEGORY_BADGE_COLORS, cn } from '@/utils';
import type { Notice } from '@/types';

export function AdminDashboardPage() {
  const { notices, isLoading } = useNotices(true);

  const stats = useMemo(() => {
    const active = notices.filter((n) => !isExpired(n.expiryDate));
    const expired = notices.filter((n) => isExpired(n.expiryDate));
    const expiringSoon = active.filter((n) => isExpiringSoon(n.expiryDate));
    const draft = notices.filter((n) => n.status === 'draft');
    const scheduled = notices.filter((n) => n.status === 'scheduled');
    const totalViews = notices.reduce((acc, n) => acc + n.views, 0);
    return { total: notices.length, active: active.length, expired: expired.length, expiringSoon: expiringSoon.length, draft: draft.length, scheduled: scheduled.length, totalViews };
  }, [notices]);

  const recentNotices = useMemo(() =>
    [...notices].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [notices]
  );

  const urgentNotices = useMemo(() =>
    notices.filter((n) => n.category === 'Urgent' && !isExpired(n.expiryDate)),
    [notices]
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back, Admin</p>
        </div>
        <Link to="/admin/notices/new">
          <Button icon={<PlusCircle size={16} />}>Create Notice</Button>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Notices" value={stats.total} icon={<FileText size={20} />} color="bg-primary-500" delay={0} />
        <StatCard title="Active" value={stats.active} icon={<CheckCircle size={20} />} color="bg-emerald-500" delay={0.05} />
        <StatCard title="Expiring Soon" value={stats.expiringSoon} icon={<Clock size={20} />} color="bg-orange-500" delay={0.1} />
        <StatCard title="Total Views" value={stats.totalViews.toLocaleString()} icon={<Eye size={20} />} color="bg-violet-500" delay={0.15} />
        <StatCard title="Drafts" value={stats.draft || 0} icon={<FileEdit size={20} />} color="bg-slate-500" delay={0.2} />
        <StatCard title="Scheduled" value={stats.scheduled || 0} icon={<CalendarClock size={20} />} color="bg-blue-500" delay={0.25} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent notices */}
        <div className="lg:col-span-2 bg-white dark:bg-navy-850 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold text-slate-800 dark:text-white text-sm">Recent Notices</h2>
            <Link to="/admin/notices" className="text-xs text-primary-600 dark:text-primary-400 font-semibold flex items-center gap-1 hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-3">
                  <NoticeCardSkeleton />
                </div>
              ))
              : recentNotices.map((notice) => (
                <NoticeRow key={notice.id} notice={notice} />
              ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Urgent notices */}
          <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <Flame size={15} className="text-red-500" />
              <h2 className="font-bold text-slate-800 dark:text-white text-sm">Urgent Notices</h2>
            </div>
            {urgentNotices.length === 0 ? (
              <div className="px-5 py-8 text-center text-xs text-slate-400">No urgent notices</div>
            ) : (
              <div className="p-3 space-y-2">
                {urgentNotices.map((n) => (
                  <div key={n.id} className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl">
                    <p className="text-sm font-semibold text-red-700 dark:text-red-400 line-clamp-1 mb-1">{n.title}</p>
                    <CountdownTimer expiryDate={n.expiryDate} compact />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 space-y-2">
            <h2 className="font-bold text-slate-800 dark:text-white text-sm mb-3">Quick Actions</h2>
            <Link to="/admin/notices/new">
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-xl text-sm font-semibold text-primary-700 dark:text-primary-300 transition-colors">
                <PlusCircle size={16} /> Create New Notice
              </button>
            </Link>
            <Link to="/admin/notices">
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors mt-2">
                <FileText size={16} /> Manage Notices
              </button>
            </Link>
            <a href="/" target="_blank" rel="noopener noreferrer">
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors mt-2">
                <Users size={16} /> View Student Feed
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, delay }: {
  title: string; value: string | number; icon: React.ReactNode; color: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white dark:bg-navy-850 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-card"
    >
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-white mb-3`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-slate-800 dark:text-white">{value}</div>
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{title}</div>
    </motion.div>
  );
}

function NoticeRow({ notice }: { notice: Notice }) {
  const expired = isExpired(notice.expiryDate);
  return (
    <div className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-semibold truncate', expired ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200')}>
          {notice.title}
        </p>
        <p className="text-xs text-slate-400">{formatDate(notice.createdAt)}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={cn('text-[10px] font-bold border px-2 py-0.5 rounded-full', CATEGORY_BADGE_COLORS[notice.category])}>
          {notice.category}
        </span>
        <Badge variant="status" status={expired ? 'expired' : 'active'}>
          {expired ? 'Expired' : 'Active'}
        </Badge>
      </div>
    </div>
  );
}
