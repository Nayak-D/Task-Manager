import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, Edit2, Trash2, Eye, Pin, CalendarClock, Send, Mail } from 'lucide-react';
import { useNotices } from '@/hooks/useNotices';
import { FilterBar } from '@/features/notices/FilterBar';
import { NoticeDetail } from '@/features/notices/NoticeDetail';
import { ConfirmModal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { isExpired, isExpiringSoon, formatDate, CATEGORY_BADGE_COLORS, cn } from '@/utils';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import type { Notice } from '@/types';

export function ManageNoticesPage() {
  const { filteredNotices, isLoading, filters, setFilters, removeNotice, fetchNotices } = useNotices(true);
  const [deleteTarget, setDeleteTarget] = useState<Notice | null>(null);
  const [viewTarget, setViewTarget] = useState<Notice | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    await removeNotice(deleteTarget.id);
    setDeleteLoading(false);
    setDeleteTarget(null);
  };

  const handlePublish = async (notice: Notice) => {
    try {
      await api.patch(`/notices/${notice.id}/publish`);
      toast.success('Notice published successfully');
      fetchNotices();
    } catch {
      toast.error('Failed to publish notice');
    }
  };

  // Status tabs for admin
  const STATUS_TABS = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Draft', value: 'draft' },
    { label: 'Scheduled', value: 'scheduled' },
    { label: 'Expired', value: 'expired' },
  ];

  const activeStatus = (filters as any).status || 'all';

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Manage Tasks</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{filteredNotices.length} tasks found</p>
        </div>
        <Link to="/admin/notices/new">
          <Button icon={<PlusCircle size={16} />}>Create Task</Button>
        </Link>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilters({ ...(filters as any), status: tab.value })}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all',
              activeStatus === tab.value
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white dark:bg-navy-850 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary-300'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <FilterBar filters={filters} onFilterChange={setFilters} showExpiredToggle />

      {/* Table */}
      <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Task</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 hidden md:table-cell">Created</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
                : filteredNotices.length === 0
                  ? (
                    <tr>
                      <td colSpan={5} className="py-12">
                        <EmptyState title="No tasks" description="No tasks found matching your filters." />
                      </td>
                    </tr>
                  )
                  : filteredNotices.map((notice, i) => (
                    <NoticeTableRow
                      key={notice.id}
                      notice={notice}
                      index={i}
                      onView={() => setViewTarget(notice)}
                      onDelete={() => setDeleteTarget(notice)}
                      onPublish={() => handlePublish(notice)}
                    />
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <NoticeDetail notice={viewTarget} isOpen={Boolean(viewTarget)} onClose={() => setViewTarget(null)} />
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteLoading}
      />
    </div>
  );
}

function NoticeTableRow({ notice, index, onView, onDelete, onPublish }: {
  notice: Notice; index: number; onView: () => void; onDelete: () => void; onPublish: () => void;
}) {
  const expired = isExpired(notice.expiryDate);
  const expiring = isExpiringSoon(notice.expiryDate);
  const isDraft = notice.status === 'draft';
  const isScheduled = notice.status === 'scheduled';

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.03 }}
      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {notice.isPinned && <Pin size={12} className="text-primary-500 flex-shrink-0" />}
          {notice.emailAlert && <span title="Email alert enabled"><Mail size={12} className="text-emerald-500 flex-shrink-0" /></span>}
          <div className="min-w-0">
            <p className={cn('text-sm font-semibold truncate max-w-[200px] sm:max-w-xs',
              expired ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'
            )}>
              {notice.title}
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Eye size={10} /> {notice.views.toLocaleString()} views
              {isScheduled && notice.scheduledAt && (
                <span className="ml-1 text-blue-500">· Publishes {formatDate(notice.scheduledAt)}</span>
              )}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className={cn('text-[11px] font-semibold border px-2 py-0.5 rounded-full', CATEGORY_BADGE_COLORS[notice.category])}>
          {notice.category}
        </span>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(notice.createdAt)}</span>
      </td>
      <td className="px-4 py-3">
        {isDraft ? (
          <Badge variant="status" status="expired">Draft</Badge>
        ) : isScheduled ? (
          <Badge variant="status" status="active">
            <CalendarClock size={9} /> Scheduled
          </Badge>
        ) : expired ? (
          <Badge variant="status" status="expired">Expired</Badge>
        ) : expiring ? (
          <Badge variant="expiring">⚡ Soon</Badge>
        ) : (
          <Badge variant="status" status="active">Active</Badge>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 justify-end">
          {(isDraft || isScheduled) && (
            <button
              onClick={onPublish}
              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
              title="Publish now"
            >
              <Send size={15} />
            </button>
          )}
          <button
            onClick={onView}
            className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
            title="View"
          >
            <Eye size={15} />
          </button>
          <Link
            to={`/admin/notices/${notice.id}/edit`}
            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 size={15} />
          </Link>
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}
