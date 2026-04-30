export type NoticeCategory =
  | 'General'
  | 'Academic'
  | 'Events'
  | 'Urgent'
  | 'Exam'
  | 'Holiday'
  | 'Administrative'
  | 'Sports'
  | 'Cultural';

export type NoticeStatus = 'active' | 'expired' | 'draft' | 'scheduled';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'other';
  size: number;
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  category: NoticeCategory;
  status: NoticeStatus;
  expiryDate: string;
  scheduledAt?: string | null;
  emailAlert?: boolean;
  emailRecipients?: string[];
  emailSentAt?: string | null;
  emailSentCount?: number;
  createdAt: string;
  updatedAt: string;
  author: string;
  attachments: Attachment[];
  isPinned: boolean;
  views: number;
}

export interface CreateNoticeDto {
  title: string;
  description: string;
  category: NoticeCategory;
  expiryDate: string;
  status?: NoticeStatus;
  scheduledAt?: string | null;
  emailAlert?: boolean;
  emailRecipients?: string[];
  attachments?: Attachment[];
  isPinned?: boolean;
}

export interface UpdateNoticeDto extends Partial<CreateNoticeDto> { }

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
  avatar?: string;
}

export interface RecipientOption {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
  mode?: 'student' | 'admin';
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface NoticeFilters {
  search: string;
  category: NoticeCategory | 'All';
  sort: 'latest' | 'expiring-soon' | 'oldest';
  showExpired?: boolean;
  status?: NoticeStatus | 'all';
}
