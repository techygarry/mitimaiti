import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach auth token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 responses by redirecting to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Admin API Methods ──────────────────────────────────────────────────────────

export const adminApi = {
  // Auth
  requestOtp: (phone: string) =>
    api.post('/auth/otp/request', { phone }),

  verifyOtp: (phone: string, code: string) =>
    api.post('/auth/otp/verify', { phone, code }),

  // Dashboard stats
  getStats: () =>
    api.get('/admin/stats'),

  // Moderation queue
  getQueue: (params?: { status?: string; priority?: string; page?: number; limit?: number }) =>
    api.get('/admin/queue', { params }),

  getReport: (id: string) =>
    api.get(`/admin/queue/${id}`),

  submitAction: (data: {
    reportId: string;
    action: 'dismiss' | 'remove_content' | 'suspend' | 'ban';
    reason: string;
    suspendDays?: number;
    banPermanent?: boolean;
  }) =>
    api.post('/admin/action', data),

  // User management
  getUser: (id: string) =>
    api.get(`/admin/user/${id}`),

  searchUsers: (query: string) =>
    api.get('/admin/user/search', { params: { q: query } }),

  // Appeals
  getAppeals: (params?: { status?: string; page?: number }) =>
    api.get('/admin/appeals', { params }),

  reviewAppeal: (data: { appealId: string; action: 'approve' | 'deny'; reason: string }) =>
    api.post('/admin/appeals/review', data),

  // Daily prompts
  getPrompts: (params?: { page?: number; upcoming?: boolean }) =>
    api.get('/admin/daily-prompt', { params }),

  createPrompt: (data: { question: string; category: string; date?: string }) =>
    api.post('/admin/daily-prompt', data),

  updatePrompt: (id: string, data: { question?: string; category?: string; is_active?: boolean }) =>
    api.patch(`/admin/daily-prompt/${id}`, data),

  deletePrompt: (id: string) =>
    api.delete(`/admin/daily-prompt/${id}`),
};
