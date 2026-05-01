import axios from 'axios';
import toast from 'react-hot-toast';
import type { Notice, CreateNoticeDto, UpdateNoticeDto, LoginDto, ApiResponse, User, RecipientOption } from '@/types';

// ─── Axios Instance ────────────────────────────────────────────────────────────
const envApiUrl = (import.meta as any).env?.VITE_API_URL;
const isLocalHost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);
const fallbackApiUrl = isLocalHost
  ? 'http://localhost:5000/api'
  : 'https://digital-notice-board-9cq4.onrender.com/api';

const api = axios.create({
  baseURL: envApiUrl || fallbackApiUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('notice_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors globally (single toast, no duplicates)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't show toast if the caller opted out via config.silent
    const silent = (error.config as any)?.silent;

    if (error.response?.status === 401) {
      localStorage.removeItem('notice_token');
      localStorage.removeItem('notice_user');
      localStorage.removeItem('notice_auth');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (!silent) {
      if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
        toast.error(`Cannot reach server at ${envApiUrl || fallbackApiUrl}.`, {
          id: 'network-error', // Deduplicate: same id = only one toast shown
          duration: 5000,
        });
      } else {
        const message = error.response?.data?.message || error.message || 'Something went wrong';
        toast.error(message, { id: `api-error-${error.response?.status}` });
      }
    }

    return Promise.reject(error);
  }
);

// ─── Auth Service ──────────────────────────────────────────────────────────────
export const authService = {
  async login(dto: LoginDto): Promise<{ user: User; token: string }> {
    const res = await api.post('/auth/login', dto, { silent: true } as any);
    return res.data.data;
  },

  async register(dto: any): Promise<any> {
    const res = await api.post('/auth/register', dto, { silent: true } as any);
    return res.data.data || res.data;
  },

  async verifyEmail(email: string, code: string): Promise<any> {
    const res = await api.post('/auth/verify-email', { email, code }, { silent: true } as any);
    return res.data.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('notice_token');
      localStorage.removeItem('notice_user');
      localStorage.removeItem('notice_auth');
    }
  },

  async getMe(): Promise<User> {
    const res = await api.get('/auth/me');
    return res.data.data;
  },

  async getRecipients(): Promise<RecipientOption[]> {
    const res = await api.get('/auth/recipients');
    return res.data.data;
  },
};

// ─── Notice Service ────────────────────────────────────────────────────────────
export const noticeService = {
  async getAll(): Promise<ApiResponse<Notice[]>> {
    const res = await api.get('/notices');
    return { data: res.data.data, message: res.data.message, success: res.data.success };
  },

  async getActive(): Promise<ApiResponse<Notice[]>> {
    const res = await api.get('/notices/active');
    return { data: res.data.data, message: res.data.message, success: res.data.success };
  },

  async getById(id: string): Promise<ApiResponse<Notice>> {
    const res = await api.get(`/notices/${id}`);
    return { data: res.data.data, message: res.data.message, success: res.data.success };
  },

  async create(dto: CreateNoticeDto): Promise<ApiResponse<Notice>> {
    const formData = new FormData();
    formData.append('title', dto.title);
    formData.append('description', dto.description);
    formData.append('category', dto.category);
    formData.append('expiryDate', dto.expiryDate);
    formData.append('isPinned', String(dto.isPinned || false));
    formData.append('emailAlert', String(dto.emailAlert || false));
    if (dto.emailRecipients && dto.emailRecipients.length > 0) {
      formData.append('emailRecipients', JSON.stringify(dto.emailRecipients));
    }
    if (dto.status) formData.append('status', dto.status);
    if (dto.scheduledAt) formData.append('scheduledAt', dto.scheduledAt);
    if (dto.attachments && dto.attachments.length > 0) {
      formData.append('attachments', JSON.stringify(dto.attachments));
    }
    const res = await api.post('/notices', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { data: res.data.data, message: res.data.message, success: res.data.success };
  },

  async update(id: string, dto: UpdateNoticeDto): Promise<ApiResponse<Notice>> {
    const formData = new FormData();
    if (dto.title) formData.append('title', dto.title);
    if (dto.description) formData.append('description', dto.description);
    if (dto.category) formData.append('category', dto.category);
    if (dto.expiryDate) formData.append('expiryDate', dto.expiryDate);
    if (dto.isPinned !== undefined) formData.append('isPinned', String(dto.isPinned));
    if (dto.emailAlert !== undefined) formData.append('emailAlert', String(dto.emailAlert));
    if (dto.emailRecipients) formData.append('emailRecipients', JSON.stringify(dto.emailRecipients));
    if (dto.status) formData.append('status', dto.status);
    if (dto.scheduledAt !== undefined) formData.append('scheduledAt', dto.scheduledAt || '');
    if (dto.attachments) formData.append('attachments', JSON.stringify(dto.attachments));
    const res = await api.put(`/notices/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { data: res.data.data, message: res.data.message, success: res.data.success };
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    const res = await api.delete(`/notices/${id}`);
    return { data: null, message: res.data.message, success: res.data.success };
  },

  async getStats() {
    const res = await api.get('/notices/admin/stats');
    return res.data.data;
  },

  async togglePin(id: string): Promise<ApiResponse<Notice>> {
    const res = await api.patch(`/notices/${id}/pin`);
    return { data: res.data.data, message: res.data.message, success: res.data.success };
  },

  async publish(id: string): Promise<ApiResponse<Notice>> {
    const res = await api.patch(`/notices/${id}/publish`);
    return { data: res.data.data, message: res.data.message, success: res.data.success };
  },
};

export default api;
