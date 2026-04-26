import { memo } from 'react';
import { motion } from 'framer-motion';
import { Pin, Eye, Paperclip, Clock, Flame, ExternalLink, BookOpen, Palmtree, CalendarClock, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { cn, isExpiringSoon, isExpired, formatDate, CATEGORY_BADGE_COLORS } from '@/utils';
import type { Notice } from '@/types';

interface NoticeCardProps {
  notice: Notice;
  index?: number;
  onClick?: () => void;
}

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  Urgent: <Flame size={10} />,
  Exam: <BookOpen size={10} />,
  Holiday: <Palmtree size={10} />,
};

export const NoticeCard = memo(function NoticeCard({ notice, index = 0, onClick }: NoticeCardProps) {
  const expiring = isExpiringSoon(notice.expiryDate);
  const expired = isExpired(notice.expiryDate);
  const isUrgent = notice.category === 'Urgent';
  const isExam = notice.category === 'Exam';
  const isHoliday = notice.category === 'Holiday';
  const isScheduled = notice.status === 'scheduled';
  const isDraft = notice.status === 'draft';

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={onClick}
      className={cn(
        'group relative bg-white dark:bg-navy-850 rounded-2xl p-5 shadow-card hover:shadow-card-hover border transition-all duration-200 cursor-pointer',
        expired
          ? 'border-slate-100 dark:border-slate-800 opacity-60'
          : isUrgent
          ? 'border-red-200 dark:border-red-900/40'
          : isExam
          ? 'border-indigo-200 dark:border-indigo-900/40'
          : isHoliday
          ? 'border-green-200 dark:border-green-900/40'
          : expiring
          ? 'border-orange-200 dark:border-orange-900/40'
          : notice.isPinned
          ? 'border-primary-200 dark:border-primary-900/40'
          : 'border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-800/50'
      )}
    >
      {/* Top accent bar */}
      {isUrgent && !expired && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-400 rounded-t-2xl" />
      )}
      {isExam && !expired && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-blue-400 rounded-t-2xl" />
      )}
      {isHoliday && !expired && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-400 rounded-t-2xl" />
      )}

      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border',
            CATEGORY_BADGE_COLORS[notice.category]
          )}>
            {CATEGORY_ICON[notice.category]}
            {notice.category}
          </span>
          {notice.isPinned && (
            <Badge variant="pinned">
              <Pin size={9} /> Pinned
            </Badge>
          )}
          {expiring && !expired && (
            <Badge variant="expiring">
              <Clock size={9} /> Expiring Soon
            </Badge>
          )}
          {expired && (
            <Badge variant="status" status="expired">Expired</Badge>
          )}
          {isScheduled && (
            <Badge variant="status" status="active">
              <CalendarClock size={9} /> Scheduled
            </Badge>
          )}
          {isDraft && (
            <Badge variant="status" status="expired">Draft</Badge>
          )}
        </div>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap flex-shrink-0">
          {formatDate(notice.createdAt)}
        </span>
      </div>

      {/* Title */}
      <h3 className={cn(
        'font-bold text-slate-800 dark:text-white leading-snug mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2',
        isUrgent ? 'text-red-700 dark:text-red-400' : '',
        isExam ? 'text-indigo-700 dark:text-indigo-400' : '',
        isHoliday ? 'text-green-700 dark:text-green-400' : '',
      )}>
        {notice.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-3">
        {notice.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <CountdownTimer expiryDate={notice.expiryDate} compact />

        <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
          {notice.emailAlert && (
            <span className="flex items-center gap-1 text-emerald-500" title="Email alert enabled">
              <Mail size={11} />
            </span>
          )}
          {notice.attachments.length > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip size={11} />
              {notice.attachments.length}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Eye size={11} />
            {notice.views.toLocaleString()}
          </span>
          <ExternalLink size={11} className="opacity-0 group-hover:opacity-60 transition-opacity" />
        </div>
      </div>
    </motion.article>
  );
});
