import { cn, CATEGORY_COLORS } from '@/utils';
import type { NoticeCategory, NoticeStatus } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'category' | 'status' | 'expiring' | 'pinned' | 'custom';
  category?: NoticeCategory;
  status?: NoticeStatus;
  className?: string;
}

export function Badge({ children, variant = 'custom', category, status, className }: BadgeProps) {
  const base = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold';

  if (variant === 'category' && category) {
    return <span className={cn(base, CATEGORY_COLORS[category], className)}>{children}</span>;
  }

  if (variant === 'status' && status) {
    const statusColors: Record<NoticeStatus, string> = {
      active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      expired: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
      draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    };
    return <span className={cn(base, statusColors[status], className)}>{children}</span>;
  }

  if (variant === 'expiring') {
    return (
      <span className={cn(base, 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 animate-pulse', className)}>
        {children}
      </span>
    );
  }

  if (variant === 'pinned') {
    return (
      <span className={cn(base, 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300', className)}>
        {children}
      </span>
    );
  }

  return <span className={cn(base, 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300', className)}>{children}</span>;
}
