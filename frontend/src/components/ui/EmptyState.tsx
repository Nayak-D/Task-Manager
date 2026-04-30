import { motion } from 'framer-motion';
import { Bell, AlertCircle, SearchX } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({
  title = 'No notices found',
  description = 'There are no active notices at this time. Check back later.',
  action,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
        <Bell size={28} className="text-slate-300 dark:text-slate-600" />
      </div>
      <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">{description}</p>
      {action && (
        <div className="mt-5">
          <Button size="sm" onClick={action.onClick}>{action.label}</Button>
        </div>
      )}
    </motion.div>
  );
}

export function SearchEmpty() {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <SearchX size={40} className="text-slate-300 dark:text-slate-600 mb-3" />
      <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-1">No results</h3>
      <p className="text-sm text-slate-400 dark:text-slate-500">Try adjusting your search or filters.</p>
    </motion.div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Failed to load data', onRetry }: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
        <AlertCircle size={26} className="text-red-400" />
      </div>
      <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-1">Something went wrong</h3>
      <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">{message}</p>
      {onRetry && <Button size="sm" variant="outline" onClick={onRetry}>Try Again</Button>}
    </motion.div>
  );
}
