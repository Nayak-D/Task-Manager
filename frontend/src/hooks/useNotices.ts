import { useEffect, useCallback, useRef } from 'react';
import { noticeService } from '@/services/api';
import { useNoticeStore } from '@/store/noticeStore';
import toast from 'react-hot-toast';
import type { CreateNoticeDto, UpdateNoticeDto } from '@/types';

export function useNotices(adminMode = false) {
  const lastNoticeIdsRef = useRef<string[]>([]);
  const {
    notices,
    setNotices,
    addNotice,
    updateNotice,
    deleteNotice,
    setLoading,
    setError,
    filters,
    setFilters,
    isLoading,
    error,
    getFilteredNotices,
  } = useNoticeStore();

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = adminMode
        ? await noticeService.getAll()
        : await noticeService.getActive();
      setNotices(res.data);
    } catch (err: any) {
      const msg = (!err.response && err.code === 'ERR_NETWORK')
        ? 'Cannot reach server. Make sure the backend is running on port 5000.'
        : err.message || 'Failed to load notices';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [adminMode]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  useEffect(() => {
    if (adminMode) return;

    const interval = window.setInterval(async () => {
      try {
        const res = await noticeService.getActive();
        const nextIds = res.data.map((notice) => notice.id);
        const previousIds = lastNoticeIdsRef.current;

        if (previousIds.length > 0) {
          const newestNotices = res.data.filter((notice) => !previousIds.includes(notice.id));
          if (newestNotices.length > 0) {
            toast.success(`New notice published: ${newestNotices[0].title}`);
          }
        }

        lastNoticeIdsRef.current = nextIds;
        setNotices(res.data);
      } catch {
        // ignore polling errors; main fetch path already reports failures
      }
    }, 30000);

    return () => window.clearInterval(interval);
  }, [adminMode, setNotices]);

  const createNotice = useCallback(async (dto: CreateNoticeDto) => {
    setLoading(true);
    try {
      const res = await noticeService.create(dto);
      addNotice(res.data);
      toast.success('Notice created successfully');
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [addNotice]);

  const editNotice = useCallback(async (id: string, dto: UpdateNoticeDto) => {
    setLoading(true);
    try {
      const res = await noticeService.update(id, dto);
      updateNotice(res.data);
      toast.success('Notice updated successfully');
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [updateNotice]);

  const removeNotice = useCallback(async (id: string) => {
    try {
      await noticeService.delete(id);
      deleteNotice(id);
      toast.success('Notice deleted successfully');
    } catch {
      // handled by interceptor
    }
  }, [deleteNotice]);

  const pinNotice = useCallback(async (id: string) => {
    try {
      const res = await noticeService.togglePin(id);
      updateNotice(res.data);
      toast.success(res.data.isPinned ? 'Notice pinned' : 'Notice unpinned');
    } catch {
      // handled by interceptor
    }
  }, [updateNotice]);

  return {
    notices,
    filteredNotices: getFilteredNotices(adminMode),
    isLoading,
    error,
    filters,
    setFilters,
    createNotice,
    editNotice,
    removeNotice,
    pinNotice,
    refetch: fetchNotices,
    fetchNotices, // alias used by StudentFeedPage ErrorState retry
  };
}

export function useActiveNotices() {
  return useNotices(false);
}

export function useAllNotices() {
  return useNotices(true);
}
