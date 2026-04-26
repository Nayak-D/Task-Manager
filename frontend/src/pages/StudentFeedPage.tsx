import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Flame, Clock, TrendingUp, BookOpen, Palmtree, X } from 'lucide-react';
import { NoticeCard } from '@/features/notices/NoticeCard';
import { NoticeDetail } from '@/features/notices/NoticeDetail';
import { FilterBar } from '@/features/notices/FilterBar';
import { NoticeCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState, SearchEmpty, ErrorState } from '@/components/ui/EmptyState';
import { useNotices } from '@/hooks/useNotices';
import { isExpiringSoon } from '@/utils';
import type { Notice } from '@/types';

export function StudentFeedPage() {
  const { filteredNotices, isLoading, error, filters, setFilters, fetchNotices } = useNotices(false);
  const [selected, setSelected] = useState<Notice | null>(null);
  const [dismissedUrgentBanner, setDismissedUrgentBanner] = useState(false);

  const stats = useMemo(() => ({
    total: filteredNotices.length,
    urgent: filteredNotices.filter((n) => n.category === 'Urgent').length,
    exam: filteredNotices.filter((n) => n.category === 'Exam').length,
    holiday: filteredNotices.filter((n) => n.category === 'Holiday').length,
    expiringSoon: filteredNotices.filter((n) => isExpiringSoon(n.expiryDate)).length,
  }), [filteredNotices]);

  const hasFilter = filters.search || filters.category !== 'All' || filters.sort !== 'latest';

  // Show urgent banner if there are urgent notices and banner not dismissed
  const showUrgentBanner = !dismissedUrgentBanner && stats.urgent > 0;

  return (
    <>
      {/* Urgent push notification banner */}
      <AnimatePresence>
        {showUrgentBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 flex items-center gap-3 p-3 bg-red-600 text-white rounded-2xl shadow-lg"
          >
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Flame size={15} />
            </div>
            <p className="text-sm font-semibold flex-1">
              {stats.urgent} urgent {stats.urgent === 1 ? 'notice' : 'notices'} require your attention!
            </p>
            <button
              onClick={() => setFilters({ category: 'Urgent' })}
              className="text-xs font-bold bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg transition-colors"
            >
              View
            </button>
            <button
              onClick={() => setDismissedUrgentBanner(true)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center">
                <Bell size={16} className="text-primary-600 dark:text-primary-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary-500">Live Notices</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
              Notice Board
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Stay updated with the latest announcements
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex gap-3 flex-wrap">
            <StatChip icon={<TrendingUp size={13} />} label="Active" value={stats.total} color="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20" onClick={() => setFilters({ category: 'All' })} />
            {stats.urgent > 0 && (
              <StatChip icon={<Flame size={13} />} label="Urgent" value={stats.urgent} color="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20" onClick={() => setFilters({ category: 'Urgent' })} />
            )}
            {stats.exam > 0 && (
              <StatChip icon={<BookOpen size={13} />} label="Exam" value={stats.exam} color="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20" onClick={() => setFilters({ category: 'Exam' })} />
            )}
            {stats.holiday > 0 && (
              <StatChip icon={<Palmtree size={13} />} label="Holiday" value={stats.holiday} color="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20" onClick={() => setFilters({ category: 'Holiday' })} />
            )}
            {stats.expiringSoon > 0 && (
              <StatChip icon={<Clock size={13} />} label="Expiring" value={stats.expiringSoon} color="text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20" />
            )}
          </div>
        </div>

        <FilterBar filters={filters} onFilterChange={setFilters} />
      </motion.div>

      {/* Content */}
      {error ? (
        <ErrorState message={error} onRetry={fetchNotices} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <NoticeCardSkeleton key={i} />)}
        </div>
      ) : filteredNotices.length === 0 ? (
        hasFilter ? (
          <SearchEmpty />
        ) : (
          <EmptyState
            title="No active notices"
            description="There are no active notices at this time. Check back later for new announcements."
          />
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredNotices.map((notice, i) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              index={i}
              onClick={() => setSelected(notice)}
            />
          ))}
        </div>
      )}

      <NoticeDetail
        notice={selected}
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

function StatChip({
  icon, label, value, color, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${color} ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-default'}`}
    >
      {icon}
      {value} {label}
    </button>
  );
}
