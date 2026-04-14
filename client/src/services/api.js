import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const stored = JSON.parse(localStorage.getItem('fittrack-auth') || '{}');
  const token = stored?.state?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fittrack-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authService = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/me', data),
};

// ─── Members ──────────────────────────────────────────────────────────────────
export const memberService = {
  getAll: (params) => API.get('/members', { params }),
  getById: (id) => API.get(`/members/${id}`),
  create: (data) => API.post('/members', data),
  update: (id, data) => API.put(`/members/${id}`, data),
  delete: (id) => API.delete(`/members/${id}`),
  getStats: () => API.get('/members/stats'),
};

// ─── Trainers ─────────────────────────────────────────────────────────────────
export const trainerService = {
  getAll: (params) => API.get('/trainers', { params }),
  getById: (id) => API.get(`/trainers/${id}`),
  create: (data) => API.post('/trainers', data),
  update: (id, data) => API.put(`/trainers/${id}`, data),
  delete: (id) => API.delete(`/trainers/${id}`),
};

// ─── Plans ────────────────────────────────────────────────────────────────────
export const planService = {
  getAll: (params) => API.get('/plans', { params }),
  getById: (id) => API.get(`/plans/${id}`),
  create: (data) => API.post('/plans', data),
  update: (id, data) => API.put(`/plans/${id}`, data),
  delete: (id) => API.delete(`/plans/${id}`),
};

// ─── Payments ─────────────────────────────────────────────────────────────────
export const paymentService = {
  getAll: (params) => API.get('/payments', { params }),
  getById: (id) => API.get(`/payments/${id}`),
  create: (data) => API.post('/payments', data),
  update: (id, data) => API.put(`/payments/${id}`, data),
  delete: (id) => API.delete(`/payments/${id}`),
  getStats: () => API.get('/payments/stats'),
};

// ─── Progress ──────────────────────────────────────────────────────────────────
export const progressService = {
  getMyProgress: () => API.get('/progress/me'),
  getByMember: (memberId) => API.get(`/progress/${memberId}`),
  add: (data) => API.post('/progress', data),
  delete: (id) => API.delete(`/progress/${id}`),
};

// ─── Subscriptions ─────────────────────────────────────────────────────────────
export const subscriptionService = {
  createRequest: (data) => API.post('/subscriptions/request', data),
  getAll: (params) => API.get('/subscriptions', { params }),
  getPendingCount: () => API.get('/subscriptions/pending-count'),
  getMyRequests: () => API.get('/subscriptions/my'),
  approve: (id) => API.patch(`/subscriptions/${id}/approve`),
  reject: (id, reason) => API.patch(`/subscriptions/${id}/reject`, { reason }),
};

// ─── Attendance ────────────────────────────────────────────────────────────────
export const attendanceService = {
  mark: (data) => API.post('/attendance', data),
  getToday: () => API.get('/attendance/today'),
  getMyHistory: (params) => API.get('/attendance/me', { params }),
  getMemberHistory: (memberId, params) => API.get(`/attendance/member/${memberId}`, { params }),
  getStats: (memberId) => API.get(`/attendance/stats/${memberId}`),
  getAll: (params) => API.get('/attendance', { params }),
};

// ─── Notifications ─────────────────────────────────────────────────────────────
export const notificationService = {
  getMyNotifications: () => API.get('/notifications'),
  markAsRead: (id) => API.patch(`/notifications/${id}/read`),
  markAllAsRead: () => API.patch('/notifications/read-all'),
  checkExpiries: () => API.post('/notifications/check-expiries'), // Usually admin or cron
};

// ─── Analytics ───────────────────────────────────────────────────────────────
export const analyticsService = {
  getDashboard: (params) => API.get('/analytics', { params }), // accepts timeframe
};

export default API;

