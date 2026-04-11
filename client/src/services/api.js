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

export default API;
