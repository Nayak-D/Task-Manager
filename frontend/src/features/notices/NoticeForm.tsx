import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Pin, Mail, Clock, BookOpen, Palmtree, AlertTriangle, X } from 'lucide-react';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ALL_CATEGORIES } from '@/utils';
import { authService } from '@/services/api';
import type { Notice, CreateNoticeDto, RecipientOption } from '@/types';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(120),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000),
  category: z.enum(['General', 'Academic', 'Events', 'Urgent', 'Exam', 'Holiday', 'Administrative', 'Sports', 'Cultural']),
  expiryDate: z.string().min(1, 'Expiry date is required').refine(
    (v) => new Date(v) > new Date(),
    { message: 'Expiry date must be in the future' }
  ),
  status: z.enum(['active', 'draft', 'scheduled']).optional(),
  scheduledAt: z.string().optional().nullable(),
  emailAlert: z.boolean().optional(),
  isPinned: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

interface NoticeFormProps {
  initialData?: Notice;
  onSubmit: (data: CreateNoticeDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const STATUS_OPTIONS = [
  { label: 'Active (publish now)', value: 'active' },
  { label: 'Draft (save for later)', value: 'draft' },
  { label: 'Scheduled (publish at date/time)', value: 'scheduled' },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Urgent: <AlertTriangle size={14} className="text-red-500" />,
  Exam: <BookOpen size={14} className="text-indigo-500" />,
  Holiday: <Palmtree size={14} className="text-green-500" />,
};

export function NoticeForm({ initialData, onSubmit, onCancel, loading }: NoticeFormProps) {
  const isEditing = Boolean(initialData);
  const [emailRecipients, setEmailRecipients] = useState<string[]>(initialData?.emailRecipients ?? []);
  const [availableRecipients, setAvailableRecipients] = useState<RecipientOption[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState('');
  const [recipientsLoading, setRecipientsLoading] = useState(false);

  const defaultExpiry = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setSeconds(0, 0);
    return d.toISOString().slice(0, 16);
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title ?? '',
      description: initialData?.description ?? '',
      category: initialData?.category ?? 'General',
      expiryDate: initialData
        ? new Date(initialData.expiryDate).toISOString().slice(0, 16)
        : defaultExpiry(),
      status: (initialData?.status as 'active' | 'draft' | 'scheduled') ?? 'active',
      scheduledAt: initialData?.scheduledAt
        ? new Date(initialData.scheduledAt).toISOString().slice(0, 16)
        : null,
      emailAlert: initialData?.emailAlert ?? false,
      isPinned: initialData?.isPinned ?? false,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        description: initialData.description,
        category: initialData.category,
        expiryDate: new Date(initialData.expiryDate).toISOString().slice(0, 16),
        status: (initialData.status as 'active' | 'draft' | 'scheduled') ?? 'active',
        scheduledAt: initialData.scheduledAt
          ? new Date(initialData.scheduledAt).toISOString().slice(0, 16)
          : null,
        emailAlert: initialData.emailAlert ?? false,
        isPinned: initialData.isPinned,
      });
    }
  }, [initialData, reset]);

  useEffect(() => {
    const loadRecipients = async () => {
      setRecipientsLoading(true);
      try {
        const recipients = await authService.getRecipients();
        setAvailableRecipients(recipients);
      } catch {
        setAvailableRecipients([]);
      } finally {
        setRecipientsLoading(false);
      }
    };

    loadRecipients();
  }, []);

  const watchedStatus = watch('status');
  const watchedCategory = watch('category');
  const watchedEmailAlert = watch('emailAlert');

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const addEmailRecipient = (email: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    setEmailError('');

    if (!validateEmail(trimmedEmail)) {
      setEmailError('Invalid email format');
      return;
    }

    if (emailRecipients.includes(trimmedEmail)) {
      setEmailError('Email already added');
      return;
    }

    setEmailRecipients([...emailRecipients, trimmedEmail]);
    setEmailInput('');
  };

  const removeEmailRecipient = (email: string) => {
    setEmailRecipients(emailRecipients.filter((e) => e !== email));
  };

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit({
      ...data,
      expiryDate: new Date(data.expiryDate).toISOString(),
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString() : null,
      emailRecipients: data.emailAlert ? emailRecipients : [],
      attachments: initialData?.attachments ?? [],
    });
  };

  const categoryOptions = ALL_CATEGORIES.map((c) => ({ label: c, value: c }));
  const statusOptions = STATUS_OPTIONS.map((s) => ({ label: s.label, value: s.value }));

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-5"
    >
      <Input
        label="Notice Title *"
        placeholder="Enter a clear, descriptive title..."
        error={errors.title?.message}
        {...register('title')}
      />

      <Textarea
        label="Description *"
        placeholder="Provide full details about the notice..."
        rows={4}
        error={errors.description?.message}
        {...register('description')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <div>
              <Select
                label="Category *"
                options={categoryOptions}
                error={errors.category?.message}
                {...field}
              />
              {/* Show category hint for core PDF categories */}
              {CATEGORY_ICONS[watchedCategory] && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  {CATEGORY_ICONS[watchedCategory]}
                  {watchedCategory === 'Urgent' && 'Students will see an urgent alert banner'}
                  {watchedCategory === 'Exam' && 'Categorized under Exam schedule notices'}
                  {watchedCategory === 'Holiday' && 'Categorized under Holiday announcements'}
                </div>
              )}
            </div>
          )}
        />

        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              label="Publish Status"
              options={statusOptions}
              error={errors.status?.message}
              {...field}
            />
          )}
        />
      </div>

      {/* Scheduled date/time (shown only when status = scheduled) */}
      {watchedStatus === 'scheduled' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
              <Clock size={13} />
              Scheduled Publishing
            </div>
            <Input
              label="Publish At *"
              type="datetime-local"
              error={errors.scheduledAt?.message}
              {...register('scheduledAt')}
            />
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Notice will become visible to students at this exact date and time.
            </p>
          </div>
        </motion.div>
      )}

      <Input
        label="Expiry Date & Time *"
        type="datetime-local"
        error={errors.expiryDate?.message}
        {...register('expiryDate')}
      />

      {/* Toggles row */}
      <div className="flex flex-wrap gap-4 pt-1">
        {/* Pin toggle */}
        <Controller
          name="isPinned"
          control={control}
          render={({ field }) => (
            <button
              type="button"
              onClick={() => field.onChange(!field.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${field.value
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white dark:bg-navy-850 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary-300'
                }`}
            >
              <Pin size={13} />
              {field.value ? 'Pinned' : 'Pin to top'}
            </button>
          )}
        />

        {/* Email alert toggle */}
        <Controller
          name="emailAlert"
          control={control}
          render={({ field }) => (
            <button
              type="button"
              onClick={() => field.onChange(!field.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${field.value
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white dark:bg-navy-850 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                }`}
            >
              <Mail size={13} />
              {field.value ? 'Email alert ON' : 'Email alert'}
            </button>
          )}
        />
      </div>

      {/* Email Recipients Section (shown when email alert is enabled) */}
      {watchedEmailAlert && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
              <Mail size={13} />
              Email Recipients
            </div>

            {/* Email input */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter email address (e.g., student@college.edu)"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setEmailError('');
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addEmailRecipient(emailInput);
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-white dark:bg-navy-850 border border-emerald-200 dark:border-emerald-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => addEmailRecipient(emailInput)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Add
                </button>
              </div>
              {emailError && (
                <p className="text-xs text-red-500 dark:text-red-400">{emailError}</p>
              )}
            </div>

            {/* Quick select from existing users */}
            <div className="space-y-2">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                {recipientsLoading ? 'Loading recipients...' : 'Select from existing users:'}
              </p>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-auto pr-1">
                {availableRecipients.map((recipient) => (
                  <button
                    key={recipient.id}
                    type="button"
                    onClick={() => {
                      if (!emailRecipients.includes(recipient.email)) {
                        setEmailRecipients([...emailRecipients, recipient.email]);
                      }
                    }}
                    disabled={emailRecipients.includes(recipient.email)}
                    className={`px-2.5 py-1.5 text-xs rounded-lg transition-colors ${emailRecipients.includes(recipient.email)
                        ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300 cursor-not-allowed'
                        : 'bg-white dark:bg-navy-850 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                      }`}
                    title={`${recipient.name} (${recipient.role})`}
                  >
                    {recipient.email}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipients list */}
            {emailRecipients.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                  Selected Recipients ({emailRecipients.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {emailRecipients.map((email) => (
                    <div
                      key={email}
                      className="flex items-center gap-2 px-3 py-1.5 bg-emerald-200 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium"
                    >
                      <span>{email}</span>
                      <button
                        type="button"
                        onClick={() => removeEmailRecipient(email)}
                        className="ml-1 hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {emailRecipients.length === 0 && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                ⚠️ No recipients selected. Add at least one email to send notifications.
              </p>
            )}

            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              💡 Emails will be sent when the notice is published or updated with email alert enabled.
            </p>
          </div>
        </motion.div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          loading={loading}
          className="flex-1"
          disabled={watchedEmailAlert && emailRecipients.length === 0}
          title={watchedEmailAlert && emailRecipients.length === 0 ? 'Add email recipients to publish with email alert' : ''}
        >
          {isEditing ? 'Update Notice' : watchedStatus === 'draft' ? 'Save as Draft' : watchedStatus === 'scheduled' ? 'Schedule Notice' : 'Publish Notice'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </motion.form>
  );
}
