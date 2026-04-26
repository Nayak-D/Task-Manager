import { create } from 'zustand';
import type { Notice, NoticeFilters, NoticeCategory } from '@/types';
import { isExpired } from '@/utils';

interface NoticeStore {
  notices: Notice[];
  filters: NoticeFilters;
  isLoading: boolean;
  error: string | null;
  setNotices: (notices: Notice[]) => void;
  addNotice: (notice: Notice) => void;
  updateNotice: (notice: Notice) => void;
  deleteNotice: (id: string) => void;
  setFilters: (filters: Partial<NoticeFilters>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getActiveNotices: () => Notice[];
  getFilteredNotices: (adminMode?: boolean) => Notice[];
}

export const useNoticeStore = create<NoticeStore>((set, get) => ({
  notices: [],
  filters: {
    search: '',
    category: 'All',
    sort: 'latest',
    showExpired: false,
  },
  isLoading: false,
  error: null,

  setNotices: (notices) => set({ notices }),
  addNotice: (notice) => set((s) => ({ notices: [notice, ...s.notices] })),
  updateNotice: (notice) =>
    set((s) => ({
      notices: s.notices.map((n) => (n.id === notice.id ? notice : n)),
    })),
  deleteNotice: (id) =>
    set((s) => ({ notices: s.notices.filter((n) => n.id !== id) })),
  setFilters: (filters) =>
    set((s) => ({ filters: { ...s.filters, ...filters } })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  getActiveNotices: () => {
    return get().notices.filter((n) => !isExpired(n.expiryDate));
  },

  getFilteredNotices: (adminMode = false) => {
    const { notices, filters } = get();
    let result = adminMode
      ? notices
      : notices.filter((n) => !isExpired(n.expiryDate));

    if (adminMode && !filters.showExpired) {
      // admin sees all by default, filtered by toggle
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q)
      );
    }

    if (filters.category !== 'All') {
      result = result.filter((n) => n.category === (filters.category as NoticeCategory));
    }

    if (filters.sort === 'latest') {
      result = [...result].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (filters.sort === 'expiring-soon') {
      result = [...result].sort(
        (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      );
    } else if (filters.sort === 'oldest') {
      result = [...result].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    // Pinned first
    return [...result.filter((n) => n.isPinned), ...result.filter((n) => !n.isPinned)];
  },
}));
