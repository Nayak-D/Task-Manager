import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, isPast, differenceInHours, format } from 'date-fns';
import type { NoticeCategory, NoticeStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isExpired(expiryDate: string): boolean {
  return isPast(new Date(expiryDate));
}

export function isExpiringSoon(expiryDate: string): boolean {
  const hours = differenceInHours(new Date(expiryDate), new Date());
  return hours > 0 && hours <= 24;
}

export function getTimeRemaining(expiryDate: string): string {
  if (isExpired(expiryDate)) return 'Expired';
  return `Expires ${formatDistanceToNow(new Date(expiryDate), { addSuffix: true })}`;
}

export function formatDate(date: string): string {
  return format(new Date(date), 'MMM dd, yyyy');
}

export function formatDateTime(date: string): string {
  return format(new Date(date), 'MMM dd, yyyy · h:mm a');
}

export function getNoticeStatus(expiryDate: string): NoticeStatus {
  return isExpired(expiryDate) ? 'expired' : 'active';
}

export const CATEGORY_COLORS: Record<NoticeCategory, string> = {
  General: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  Academic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Events: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Urgent: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  Exam: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  Holiday: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Administrative: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Sports: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Cultural: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
};

export const CATEGORY_BADGE_COLORS: Record<NoticeCategory, string> = {
  General: 'border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300',
  Academic: 'border-blue-300 text-blue-600 dark:border-blue-600 dark:text-blue-400',
  Events: 'border-purple-300 text-purple-600 dark:border-purple-600 dark:text-purple-400',
  Urgent: 'border-red-300 text-red-600 dark:border-red-600 dark:text-red-400',
  Exam: 'border-indigo-300 text-indigo-600 dark:border-indigo-600 dark:text-indigo-400',
  Holiday: 'border-green-300 text-green-600 dark:border-green-600 dark:text-green-400',
  Administrative: 'border-amber-300 text-amber-600 dark:border-amber-600 dark:text-amber-400',
  Sports: 'border-emerald-300 text-emerald-600 dark:border-emerald-600 dark:text-emerald-400',
  Cultural: 'border-pink-300 text-pink-600 dark:border-pink-600 dark:text-pink-400',
};

export const ALL_CATEGORIES: NoticeCategory[] = [
  'Urgent', 'Exam', 'Holiday', 'General', 'Academic', 'Events', 'Administrative', 'Sports', 'Cultural',
];

// PDF-specified core categories (shown prominently)
export const CORE_CATEGORIES: NoticeCategory[] = ['Urgent', 'Exam', 'Holiday'];

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
