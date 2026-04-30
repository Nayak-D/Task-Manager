import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';
import { NoticeForm } from '@/features/notices/NoticeForm';
import { useNotices } from '@/hooks/useNotices';
import { noticeService } from '@/services/api';
import { useNoticeStore } from '@/store/noticeStore';
import type { Notice, CreateNoticeDto } from '@/types';

export function CreateEditTaskPage() {
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { createNotice, editNotice, isLoading } = useNotices(true);
  const [initialData, setInitialData] = useState<Notice | undefined>(undefined);
  const [fetching, setFetching] = useState(isEditing);
  const notices = useNoticeStore((s) => s.notices);

  useEffect(() => {
    if (id) {
      // First check local store
      const local = notices.find((n) => n.id === id);
      if (local) {
        setInitialData(local);
        setFetching(false);
      } else {
        noticeService.getById(id).then((res) => {
          setInitialData(res.data);
          setFetching(false);
        }).catch(() => {
          navigate('/admin/tasks');
        });
      }
    }
  }, [id]);

  const handleSubmit = async (data: CreateNoticeDto) => {
    if (isEditing && id) {
      await editNotice(id, data);
    } else {
      await createNotice(data);
    }
    navigate('/admin/tasks');
  };

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl"
      >
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors mb-5"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center">
            <FileText size={18} className="text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">
              {isEditing ? 'Edit Task' : 'Create Task'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isEditing ? 'Update the task details below' : 'Fill in the details to publish a new task'}
            </p>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-card">
          {fetching ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <NoticeForm
              initialData={initialData}
              onSubmit={handleSubmit}
              onCancel={() => navigate(-1)}
              loading={isLoading}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
