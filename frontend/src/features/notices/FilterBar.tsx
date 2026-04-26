import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, Flame, BookOpen, Palmtree } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';
import { cn, ALL_CATEGORIES, CATEGORY_BADGE_COLORS } from '@/utils';
import type { NoticeCategory, NoticeFilters } from '@/types';

interface FilterBarProps {
  filters: NoticeFilters;
  onFilterChange: (f: Partial<NoticeFilters>) => void;
  showExpiredToggle?: boolean;
}

const SORT_OPTIONS = [
  { label: 'Latest', value: 'latest' },
  { label: 'Expiring Soon', value: 'expiring-soon' },
  { label: 'Oldest', value: 'oldest' },
] as const;

// Core PDF categories shown as quick-access chips
const QUICK_CATEGORIES: { label: string; value: NoticeCategory; icon: React.ReactNode; color: string }[] = [
  { label: 'Urgent', value: 'Urgent', icon: <Flame size={11} />, color: 'border-red-300 text-red-600 dark:border-red-600 dark:text-red-400' },
  { label: 'Exam', value: 'Exam', icon: <BookOpen size={11} />, color: 'border-indigo-300 text-indigo-600 dark:border-indigo-600 dark:text-indigo-400' },
  { label: 'Holiday', value: 'Holiday', icon: <Palmtree size={11} />, color: 'border-green-300 text-green-600 dark:border-green-600 dark:text-green-400' },
];

export function FilterBar({ filters, onFilterChange, showExpiredToggle }: FilterBarProps) {
  const [rawSearch, setRawSearch] = useState(filters.search);
  const [showFilters, setShowFilters] = useState(false);
  const debounced = useDebounce(rawSearch, 300);

  useEffect(() => {
    onFilterChange({ search: debounced });
  }, [debounced]);

  const activeFiltersCount = (filters.category !== 'All' ? 1 : 0) + (filters.sort !== 'latest' ? 1 : 0);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={rawSearch}
            onChange={(e) => setRawSearch(e.target.value)}
            placeholder="Search notices by title or content..."
            className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-navy-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 transition-all"
          />
          {rawSearch && (
            <button
              onClick={() => { setRawSearch(''); onFilterChange({ search: '' }); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={cn(
            'flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all',
            showFilters || activeFiltersCount > 0
              ? 'bg-primary-600 text-white border-primary-600 shadow-md'
              : 'bg-white dark:bg-navy-850 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary-300'
          )}
        >
          <SlidersHorizontal size={15} />
          <span className="hidden sm:inline">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 bg-white text-primary-600 rounded-full text-[10px] flex items-center justify-center font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Quick category chips — core PDF categories shown prominently */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onFilterChange({ category: 'All' })}
          className={cn(
            'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all',
            filters.category === 'All'
              ? 'bg-primary-600 text-white border-primary-600'
              : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300'
          )}
        >
          All
        </button>
        {QUICK_CATEGORIES.map((qc) => (
          <button
            key={qc.value}
            onClick={() => onFilterChange({ category: qc.value })}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all',
              filters.category === qc.value
                ? 'bg-primary-600 text-white border-primary-600'
                : cn('border', qc.color, 'hover:opacity-80 bg-white dark:bg-navy-850')
            )}
          >
            {qc.icon}
            {qc.label}
          </button>
        ))}
      </div>

      {/* Expanded filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-navy-850 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4">
              {/* Category */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Category</p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => onFilterChange({ category: 'All' })}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-semibold border transition-all',
                      filters.category === 'All'
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                    )}
                  >
                    All
                  </button>
                  {ALL_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => onFilterChange({ category: cat })}
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-semibold border transition-all',
                        filters.category === cat
                          ? 'bg-primary-600 text-white border-primary-600'
                          : cn('border', CATEGORY_BADGE_COLORS[cat], 'hover:opacity-80')
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Sort By</p>
                <div className="flex gap-1.5 flex-wrap">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onFilterChange({ sort: opt.value })}
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-semibold border transition-all',
                        filters.sort === opt.value
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Expired toggle */}
              {showExpiredToggle && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onFilterChange({ showExpired: !filters.showExpired })}
                    className={cn(
                      'w-9 h-5 rounded-full transition-colors relative flex-shrink-0',
                      filters.showExpired ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'
                    )}
                  >
                    <div className={cn(
                      'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                      filters.showExpired ? 'translate-x-4' : 'translate-x-0.5'
                    )} />
                  </button>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Show expired notices</span>
                </div>
              )}

              {/* Reset */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => onFilterChange({ category: 'All', sort: 'latest', showExpired: false })}
                  className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                >
                  Reset filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
