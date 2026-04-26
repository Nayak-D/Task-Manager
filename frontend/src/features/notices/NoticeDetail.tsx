import { FileText, Download, Eye, Calendar, User, Flame, Pin, ExternalLink } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { cn, isExpiringSoon, isExpired, formatDateTime, CATEGORY_BADGE_COLORS, formatFileSize } from '@/utils';
import type { Notice } from '@/types';

interface NoticeDetailProps {
  notice: Notice | null;
  isOpen: boolean;
  onClose: () => void;
}

export function NoticeDetail({ notice, isOpen, onClose }: NoticeDetailProps) {
  if (!notice) return null;
  const expiring = isExpiringSoon(notice.expiryDate);
  const expired = isExpired(notice.expiryDate);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-5">
        {/* Badges */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className={cn(
            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border',
            CATEGORY_BADGE_COLORS[notice.category]
          )}>
            {notice.category === 'Urgent' && <Flame size={11} />}
            {notice.category}
          </span>
          {notice.isPinned && <Badge variant="pinned"><Pin size={10} /> Pinned</Badge>}
          {expiring && !expired && <Badge variant="expiring"><CountdownTimer expiryDate={notice.expiryDate} compact /></Badge>}
          {expired && <Badge variant="status" status="expired">Expired</Badge>}
          {!expired && !expiring && <Badge variant="status" status="active">Active</Badge>}
        </div>

        {/* Title */}
        <div>
          <h2 className={cn(
            'text-xl font-bold leading-snug mb-1',
            notice.category === 'Urgent' ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-white'
          )}>
            {notice.title}
          </h2>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-navy-900/60 rounded-xl">
          <MetaItem icon={<Calendar size={14} />} label="Created" value={formatDateTime(notice.createdAt)} />
          <MetaItem icon={<Calendar size={14} />} label="Expires" value={formatDateTime(notice.expiryDate)} />
          <MetaItem icon={<User size={14} />} label="Posted by" value={notice.author} />
          <MetaItem icon={<Eye size={14} />} label="Views" value={notice.views.toLocaleString()} />
        </div>

        {/* Countdown */}
        {!expired && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl">
            <CountdownTimer expiryDate={notice.expiryDate} />
          </div>
        )}

        {/* Description */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Description</h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {notice.description}
          </p>
        </div>

        {/* Attachments */}
        {notice.attachments.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Attachments ({notice.attachments.length})
            </h4>
            <div className="space-y-2">
              {notice.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-navy-900/60 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  {att.type === 'image' ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200">
                      <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-red-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{att.name}</p>
                    <p className="text-xs text-slate-400">{formatFileSize(att.size)}</p>
                  </div>
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                  >
                    {att.type === 'pdf' ? <Download size={13} /> : <ExternalLink size={13} />}
                    {att.type === 'pdf' ? 'Download' : 'View'}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-slate-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{label}</p>
        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{value}</p>
      </div>
    </div>
  );
}
